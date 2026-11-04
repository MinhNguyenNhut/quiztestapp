// src/features/meeting/useMeeting.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store';

const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000'
).replace(/\/+$/, '');

const turnUrl = import.meta.env.VITE_TURN_URL as string | undefined;
const turnUser = import.meta.env.VITE_TURN_USER as string | undefined;
const turnPass = import.meta.env.VITE_TURN_PASS as string | undefined;

// A TURN server is required for users behind strict NATs/firewalls; STUN alone will fail for some.
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    ...(turnUrl && turnUser && turnPass
      ? [{ urls: turnUrl, username: turnUser, credential: turnPass }]
      : []),
  ],
};

export interface ChatMessage {
  id: string;
  from: string;
  name?: string;
  message: string;
  at: number;
  mine: boolean;
}

type ChatMessagePayload = Omit<ChatMessage, 'mine'>;

function mergeMessages(
  current: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const messages = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => messages.set(message.id, message));
  return [...messages.values()].sort(
    (left, right) => left.at - right.at || left.id.localeCompare(right.id),
  );
}

export type MeetingStatus = 'connecting' | 'joined' | 'error' | 'ended';

interface MeetingPeer {
  id: string;
  name: string;
}

interface SignalData {
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export function useMeeting(
  roomId: string,
  token: string,
  initial: { audio: boolean; video: boolean } = { audio: true, video: true },
) {
  const { t } = useTranslation();
  const translationRef = useRef(t);
  const userId = useAppSelector((state) => state.user.profile?.id);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remotes, setRemotes] = useState<Record<string, MediaStream>>({});
  const [peerIds, setPeerIds] = useState<string[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatError, setChatError] = useState(false);
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

  useEffect(() => {
    translationRef.current = t;
  }, [t]);

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
    socket.on('peers', (peers: Array<string | MeetingPeer>) => {
      setStatus('joined');
      const peerNames: Record<string, string> = {};
      const ids = peers.map((peer) => {
        const id = typeof peer === 'string' ? peer : peer.id;
        if (typeof peer !== 'string' && peer.name) peerNames[id] = peer.name;
        return id;
      });
      setPeerIds([...new Set(ids)]);
      setNames(peerNames);
      peers.forEach((peer) => {
        const id = typeof peer === 'string' ? peer : peer.id;
        enqueue(id, async () => {
          const pc = createPc(id);
          await pc.setLocalDescription(await pc.createOffer());
          socket.emit('signal', { to: id, data: { sdp: pc.localDescription } });
        });
      });
    });

    socket.on('peer-joined', (peer: MeetingPeer) => {
      setPeerIds((current) =>
        current.includes(peer.id) ? current : [...current, peer.id],
      );
      setNames((current) => ({ ...current, [peer.id]: peer.name }));
    });

    socket.on('signal', ({ from, data }: { from: string; data: SignalData }) => {
      setPeerIds((current) => current.includes(from) ? current : [...current, from]);
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
      });
    });

    socket.on('peer-left', (id: string) => {
      pcs.current.get(id)?.close();
      pcs.current.delete(id);
      queues.current.delete(id);
      setPeerIds((current) => current.filter((peerId) => peerId !== id));
      setRemotes((current) => {
        const remaining = { ...current };
        delete remaining[id];
        return remaining;
      });
      setNames((current) => {
        const remaining = { ...current };
        delete remaining[id];
        return remaining;
      });
    });

    socket.on('chat-history', (history: ChatMessagePayload[]) => {
      setMessages((current) =>
        mergeMessages(
          current,
          history.map((message) => ({ ...message, mine: message.from === userId })),
        ),
      );
      setChatError(false);
    });
    socket.on('chat', (message: ChatMessagePayload) => {
      setMessages((current) =>
        mergeMessages(current, [{ ...message, mine: message.from === userId }]),
      );
    });
    socket.on('chat-error', () => setChatError(true));

    socket.on('room-full', () => fail(translationRef.current('meeting.roomFull')));
    socket.on('error-message', (msg: string) => fail(msg));
    socket.on('meeting-ended', () => {
      setError(translationRef.current('meeting.meetingEndedMessage'));
      setStatus('ended');
    });
    socket.on('connect_error', () => fail(translationRef.current('meeting.connectionFailed')));

    (async () => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // no camera
        } catch {
          stream = new MediaStream();
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
  }, [roomId, token, userId]);

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
    setChatError(false);
    socketRef.current?.emit('chat', { message });
  }, []);

  return {
    localStream,
    screenStream,
    remotes,
    peerIds,
    names,
    messages,
    chatError,
    status,
    error,
    micOn,
    camOn,
    camAvailable: Boolean(localStream?.getVideoTracks().length),
    toggleMic,
    toggleCam,
    startScreenShare,
    stopScreenShare,
    sendChat,
  };
}