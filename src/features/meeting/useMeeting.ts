// src/features/meeting/useMeeting.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL as string;

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // { urls: 'turn:your-server:3478', username: '...', credential: '...' },
  ],
};

export interface ChatMessage {
  from: string;
  name?: string;
  message: string;
  at: number;
  mine: boolean;
}

export type MeetingStatus = 'connecting' | 'joined' | 'error';

export function useMeeting(
  roomId: string,
  token: string,
  initial: { audio: boolean; video: boolean } = { audio: true, video: true },
) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remotes, setRemotes] = useState<Record<string, MediaStream>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<MeetingStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(initial.audio);
  const [camOn, setCamOn] = useState(initial.video);

  const socketRef = useRef<Socket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenRef = useRef<MediaStream | null>(null);
  const pcs = useRef(new Map<string, RTCPeerConnection>());
  const queues = useRef(new Map<string, Promise<void>>());
  const initialRef = useRef(initial);

  const replaceVideoTrack = useCallback((track: MediaStreamTrack | null) => {
    pcs.current.forEach((pc) => {
      pc.getSenders().find((s) => s.track?.kind === 'video')?.replaceTrack(track);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const socket = io(`${API_URL}/meeting`, { auth: { token } });
    socketRef.current = socket;

    const fail = (msg: string) => {
      setError(msg);
      setStatus('error');
    };

    // Run signaling jobs for one peer strictly in order, so an ICE candidate
    // never gets applied before the offer/answer it belongs to.
    const enqueue = (peerId: string, job: () => Promise<void>) => {
      const prev = queues.current.get(peerId) ?? Promise.resolve();
      queues.current.set(
        peerId,
        prev.then(job).catch((err) => console.error('[webrtc]', err)),
      );
    };

    const createPc = (peerId: string) => {
      const pc = new RTCPeerConnection(RTC_CONFIG);
      const stream = streamRef.current!;
      const tracks = [
        ...stream.getAudioTracks(),
        // if someone joins while I'm presenting, they get the screen, not the camera
        ...(screenRef.current?.getVideoTracks() ?? stream.getVideoTracks()),
      ];
      tracks.forEach((t) => pc.addTrack(t, stream));
      if (!tracks.some((t) => t.kind === 'video')) {
        pc.addTransceiver('video', { direction: 'recvonly' });
      }

      pc.onicecandidate = (e) =>
        e.candidate && socket.emit('signal', { to: peerId, data: { candidate: e.candidate } });
      pc.ontrack = (e) => setRemotes((r) => ({ ...r, [peerId]: e.streams[0] }));
      pcs.current.set(peerId, pc);
      return pc;
    };

    // I'm the newcomer: offer to everyone already in the room
    socket.on('peers', (ids: string[]) => {
      setStatus('joined');
      ids.forEach((id) =>
        enqueue(id, async () => {
          const pc = createPc(id);
          await pc.setLocalDescription(await pc.createOffer());
          socket.emit('signal', { to: id, data: { sdp: pc.localDescription } });
        }),
      );
    });

    socket.on('signal', ({ from, data }: { from: string; data: any }) =>
      enqueue(from, async () => {
        const pc = pcs.current.get(from) ?? createPc(from);
        if (data.sdp) {
          await pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === 'offer') {
            await pc.setLocalDescription(await pc.createAnswer());
            socket.emit('signal', { to: from, data: { sdp: pc.localDescription } });
          }
        } else if (data.candidate) {
          await pc.addIceCandidate(data.candidate);
        }
      }),
    );

    socket.on('peer-left', (id: string) => {
      pcs.current.get(id)?.close();
      pcs.current.delete(id);
      queues.current.delete(id);
      setRemotes(({ [id]: _removed, ...rest }) => rest);
    });

    socket.on('chat', (msg: Omit<ChatMessage, 'mine'>) =>
      setMessages((m) => [...m, { ...msg, mine: msg.from === socket.id }]),
    );

    socket.on('room-full', () => fail('This meeting is full.'));
    socket.on('error-message', (msg: string) => fail(msg));
    socket.on('connect_error', () => fail('Cannot connect to the meeting server.'));

    (async () => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // no camera
        } catch {
          return fail('Cannot access camera or microphone. Check your browser permissions.');
        }
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const hasVideo = stream.getVideoTracks().length > 0;
      stream.getAudioTracks().forEach((t) => (t.enabled = initialRef.current.audio));
      stream.getVideoTracks().forEach((t) => (t.enabled = initialRef.current.video));
      setCamOn(hasVideo && initialRef.current.video);
      streamRef.current = stream;
      setLocalStream(stream);
      socket.emit('join', { roomId });
    })();

    const peerConnections = pcs.current;
    const jobQueues = queues.current;
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      screenRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      screenRef.current = null;
      peerConnections.forEach((pc) => pc.close());
      peerConnections.clear();
      jobQueues.clear();
      socket.emit('leave');
      socket.disconnect();
    };
  }, [roomId, token]);

  const toggleMic = useCallback(() => {
    const tracks = streamRef.current?.getAudioTracks() ?? [];
    if (!tracks.length) return;
    const next = !tracks[0].enabled;
    tracks.forEach((t) => (t.enabled = next));
    setMicOn(next);
  }, []);

  const toggleCam = useCallback(() => {
    const tracks = streamRef.current?.getVideoTracks() ?? [];
    if (!tracks.length) return;
    const next = !tracks[0].enabled;
    tracks.forEach((t) => (t.enabled = next));
    setCamOn(next);
  }, []);

  const stopScreenShare = useCallback(() => {
    screenRef.current?.getTracks().forEach((t) => t.stop());
    screenRef.current = null;
    setScreenStream(null);
    replaceVideoTrack(streamRef.current?.getVideoTracks()[0] ?? null);
  }, [replaceVideoTrack]);

  const startScreenShare = useCallback(async () => {
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = display.getVideoTracks()[0];
      track.onended = stopScreenShare; // browser's "Stop sharing" bar
      screenRef.current = display;
      setScreenStream(display);
      replaceVideoTrack(track);
    } catch {
      /* user cancelled the picker */
    }
  }, [replaceVideoTrack, stopScreenShare]);

  const sendChat = useCallback((message: string) => {
    socketRef.current?.emit('chat', { message });
  }, []);

  return {
    localStream,
    screenStream,
    remotes,
    messages,
    status,
    error,
    micOn,
    camOn,
    toggleMic,
    toggleCam,
    startScreenShare,
    stopScreenShare,
    sendChat,
  };
}