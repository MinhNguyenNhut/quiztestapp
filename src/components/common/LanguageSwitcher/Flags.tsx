import { useId } from 'react';

interface FlagProps {
  width?: number;
}

const frame = { display: 'block', borderRadius: 3, boxShadow: '0 0 0 1px rgba(0,0,0,0.15)' } as const;

export function FlagVN({ width = 24 }: FlagProps) {
  return (
    <svg width={width} height={(width * 2) / 3} viewBox="0 0 30 20" style={frame} role="img" aria-label="Vietnam flag">
      <rect width="30" height="20" fill="#DA251D" />
      <polygon
        fill="#FFFF00"
        points="15,4 16.35,8.15 20.71,8.15 17.18,10.71 18.53,14.85 15,12.29 11.47,14.85 12.82,10.71 9.29,8.15 13.65,8.15"
      />
    </svg>
  );
}

/** Union Jack. Swap for FlagUS below if you prefer the American flag. */
export function FlagEN({ width = 24 }: FlagProps) {
  const id = useId(); // unique clip ids: the flag renders in the button and in the menu
  return (
    <svg width={width} height={width / 2} viewBox="0 0 60 30" style={frame} role="img" aria-label="English flag">
      <clipPath id={`${id}-s`}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={`${id}-t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${id}-s)`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

/** Simplified US flag (stripes + star field). */
export function FlagUS({ width = 24 }: FlagProps) {
  const stripes = Array.from({ length: 7 }, (_, i) => i * 2);
  const stars = Array.from({ length: 20 }, (_, i) => ({
    x: 2 + (i % 5) * 3.2,
    y: 1.8 + Math.floor(i / 5) * 2.6,
  }));
  return (
    <svg width={width} height={width * 0.6} viewBox="0 0 30 18" style={frame} role="img" aria-label="US flag">
      <rect width="30" height="18" fill="#fff" />
      {stripes.map((i) => (
        <rect key={i} y={(i * 18) / 13} width="30" height={18 / 13} fill="#B22234" />
      ))}
      <rect width="13" height={(18 * 7) / 13} fill="#3C3B6E" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r="0.55" fill="#fff" />
      ))}
    </svg>
  );
}
