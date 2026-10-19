export function DjedLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="DJED Pillar Symbol"
    >
      <defs>
        <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB52E" />
          <stop offset="35%" stopColor="#C58B42" />
          <stop offset="70%" stopColor="#8C542E" />
          <stop offset="100%" stopColor="#60391F" />
        </linearGradient>
        <linearGradient id="shaftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60391F" />
          <stop offset="50%" stopColor="#C58B42" />
          <stop offset="100%" stopColor="#4A2A14" />
        </linearGradient>
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FFB52E" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Base Pedestal */}
      <path
        d="M20 112 L80 112 L72 102 L28 102 Z"
        fill="url(#bronzeGrad)"
        stroke="#FFB52E"
        strokeWidth="1.5"
      />

      {/* Main Vertical Shaft */}
      <rect
        x="42"
        y="42"
        width="16"
        height="60"
        rx="2"
        fill="url(#shaftGrad)"
        stroke="#8C542E"
        strokeWidth="1.5"
      />
      {/* Central Groove */}
      <line x1="50" y1="44" x2="50" y2="100" stroke="#FFB52E" strokeWidth="1" strokeOpacity="0.7" />

      {/* 4 Sacred Horizontal Crossbeams (The 4 tiers of stability) */}
      {/* Tier 1 (Lowest) */}
      <rect
        x="22"
        y="35"
        width="56"
        height="6"
        rx="2"
        fill="url(#bronzeGrad)"
        stroke="#FFB52E"
        strokeWidth="1.2"
        filter="url(#goldGlow)"
      />
      {/* Tier 2 */}
      <rect
        x="25"
        y="25"
        width="50"
        height="6"
        rx="2"
        fill="url(#bronzeGrad)"
        stroke="#FFB52E"
        strokeWidth="1.2"
      />
      {/* Tier 3 */}
      <rect
        x="28"
        y="15"
        width="44"
        height="6"
        rx="2"
        fill="url(#bronzeGrad)"
        stroke="#FFB52E"
        strokeWidth="1.2"
      />
      {/* Tier 4 (Top Crown) */}
      <rect
        x="32"
        y="5"
        width="36"
        height="6"
        rx="2"
        fill="url(#bronzeGrad)"
        stroke="#FFB52E"
        strokeWidth="1.2"
      />

      {/* Crest finial */}
      <path
        d="M45 5 L50 0 L55 5 Z"
        fill="#FFB52E"
      />
    </svg>
  );
}
