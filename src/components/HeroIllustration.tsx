const HeroIllustration = () => (
  <svg viewBox="0 0 520 640" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-auto">
    <defs>
      <radialGradient id="hero-bg" cx="50%" cy="45%" r="52%">
        <stop offset="0%" stopColor="#EEF2F7" />
        <stop offset="100%" stopColor="#DDE3EC" />
      </radialGradient>
      <radialGradient id="stage-grad" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </radialGradient>
      <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.07" />
      </filter>
      <filter id="figure-shadow" x="-30%" y="-10%" width="160%" height="130%">
        <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#1E293B" floodOpacity="0.12" />
      </filter>
    </defs>

    {/* ── Background circle ─────────────────────────────── */}
    <circle cx="260" cy="310" r="265" fill="url(#hero-bg)" />

    {/* ── Stage ─────────────────────────────────────────── */}
    <ellipse cx="260" cy="486" rx="210" ry="22" fill="#CBD5E1" />
    <ellipse cx="260" cy="478" rx="190" ry="14" fill="#DDE3EC" />

    {/* Podium */}
    <path d="M234 404 L286 404 L296 476 L224 476 Z" fill="#C0CAD6" />
    <rect x="220" y="394" width="80" height="14" rx="4" fill="#AEBBC8" />
    {/* Podium screen */}
    <rect x="232" y="412" width="56" height="38" rx="3" fill="#007cd8" fillOpacity="0.1" />
    <rect x="238" y="420" width="44" height="3" rx="1.5" fill="#007cd8" fillOpacity="0.45" />
    <rect x="238" y="427" width="30" height="3" rx="1.5" fill="#007cd8" fillOpacity="0.3" />
    <rect x="238" y="434" width="38" height="3" rx="1.5" fill="#007cd8" fillOpacity="0.3" />

    {/* ── Speaker figure ────────────────────────────────── */}
    <g filter="url(#figure-shadow)">
      {/* Legs */}
      <rect x="236" y="355" width="26" height="52" rx="10" fill="#111827" />
      <rect x="270" y="355" width="26" height="52" rx="10" fill="#111827" />
      {/* Shoes */}
      <ellipse cx="249" cy="404" rx="18" ry="7" fill="#0A0F1A" />
      <ellipse cx="283" cy="404" rx="18" ry="7" fill="#0A0F1A" />

      {/* Torso */}
      <path d="M220 248 C218 242 226 232 260 232 C294 232 302 242 300 248 L306 358 L214 358 Z" fill="#1E293B" />
      {/* Collar / shirt detail */}
      <path d="M248 232 L260 248 L272 232" fill="#2D3F52" />

      {/* Left arm — raised */}
      <path d="M222 274 Q188 238 170 208" stroke="#1E293B" strokeWidth="22" strokeLinecap="round" />
      <ellipse cx="165" cy="202" rx="13" ry="13" fill="#C4956A" />

      {/* Right arm — raised */}
      <path d="M298 274 Q332 238 350 208" stroke="#1E293B" strokeWidth="22" strokeLinecap="round" />
      <ellipse cx="355" cy="202" rx="13" ry="13" fill="#C4956A" />

      {/* Neck */}
      <rect x="250" y="216" width="20" height="20" rx="5" fill="#C4956A" />

      {/* Head */}
      <ellipse cx="260" cy="196" rx="30" ry="32" fill="#C4956A" />

      {/* Hair */}
      <path d="M232 182 Q234 158 260 156 Q286 158 288 182 Q282 170 260 168 Q238 170 232 182 Z" fill="#1E293B" />

      {/* VR Headset body */}
      <rect x="232" y="178" width="56" height="30" rx="9" fill="#660000" />
      {/* Side pieces */}
      <rect x="219" y="185" width="16" height="12" rx="4" fill="#7A0000" />
      <rect x="285" y="185" width="16" height="12" rx="4" fill="#7A0000" />
      {/* Headband */}
      <path d="M230 180 Q260 164 290 180" stroke="#4A0000" strokeWidth="4" strokeLinecap="round" />
      {/* Lenses */}
      <rect x="238" y="184" width="20" height="18" rx="5" fill="#007cd8" fillOpacity="0.85" />
      <rect x="262" y="184" width="20" height="18" rx="5" fill="#007cd8" fillOpacity="0.85" />
      {/* Lens highlights */}
      <rect x="241" y="187" width="7" height="5" rx="2" fill="white" fillOpacity="0.55" />
      <rect x="265" y="187" width="7" height="5" rx="2" fill="white" fillOpacity="0.55" />
      {/* Lens glow dots */}
      <circle cx="248" cy="196" r="3" fill="#60C8FF" fillOpacity="0.65" />
      <circle cx="272" cy="196" r="3" fill="#60C8FF" fillOpacity="0.65" />
    </g>

    {/* ── Sound waves ───────────────────────────────────── */}
    {/* Right */}
    <path d="M368 206 Q380 196 368 186" stroke="#007cd8" strokeWidth="3.5" strokeLinecap="round" opacity="0.75" />
    <path d="M382 212 Q400 196 382 180" stroke="#007cd8" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    <path d="M396 218 Q422 196 396 174" stroke="#007cd8" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
    <path d="M410 224 Q444 196 410 168" stroke="#007cd8" strokeWidth="2" strokeLinecap="round" opacity="0.18" />
    {/* Left */}
    <path d="M152 206 Q140 196 152 186" stroke="#007cd8" strokeWidth="3.5" strokeLinecap="round" opacity="0.75" />
    <path d="M138 212 Q120 196 138 180" stroke="#007cd8" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    <path d="M124 218 Q98 196 124 174" stroke="#007cd8" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />

    {/* ── Floating UI cards ─────────────────────────────── */}

    {/* Card 1 — Confidence Score (top right) */}
    <g filter="url(#card-shadow)">
      <rect x="354" y="58" width="148" height="104" rx="14" fill="white" />
      <rect x="354" y="58" width="148" height="104" rx="14" fill="none" stroke="#EEF1F5" strokeWidth="1" />
    </g>
    <text x="370" y="81" fontSize="9" fill="#9CA3AF" fontFamily="system-ui,sans-serif" fontWeight="600" letterSpacing="1.2">CONFIANZA</text>
    <text x="370" y="114" fontSize="34" fill="#660000" fontFamily="system-ui,sans-serif" fontWeight="700">94%</text>
    <rect x="370" y="124" width="118" height="6" rx="3" fill="#F1F5F9" />
    <rect x="370" y="124" width="110" height="6" rx="3" fill="#660000" />
    <text x="370" y="148" fontSize="9" fill="#6B7280" fontFamily="system-ui,sans-serif">↑ 12% esta sesión</text>

    {/* Card 2 — Voice Quality (left) */}
    <g filter="url(#card-shadow)">
      <rect x="20" y="104" width="138" height="88" rx="14" fill="white" />
      <rect x="20" y="104" width="138" height="88" rx="14" fill="none" stroke="#EEF1F5" strokeWidth="1" />
    </g>
    <text x="36" y="126" fontSize="9" fill="#9CA3AF" fontFamily="system-ui,sans-serif" fontWeight="600" letterSpacing="1.2">VOZ</text>
    {[
      [36, 22], [46, 34], [56, 26], [66, 40], [76, 30],
      [86, 36], [96, 20], [106, 32], [116, 38], [126, 24],
    ].map(([x, h], i) => (
      <rect key={i} x={x} y={168 - h} width="6" height={h} rx="2"
        fill="#007cd8" fillOpacity={0.25 + (i % 4) * 0.18} />
    ))}
    <text x="36" y="183" fontSize="9" fill="#6B7280" fontFamily="system-ui,sans-serif">Proyección: Excelente</text>

    {/* Card 3 — Session stars (right, lower) */}
    <g filter="url(#card-shadow)">
      <rect x="390" y="200" width="112" height="64" rx="12" fill="white" />
      <rect x="390" y="200" width="112" height="64" rx="12" fill="none" stroke="#EEF1F5" strokeWidth="1" />
    </g>
    <text x="406" y="221" fontSize="9" fill="#9CA3AF" fontFamily="system-ui,sans-serif" fontWeight="600" letterSpacing="1.2">SESIÓN</text>
    {[0, 1, 2, 3, 4].map(i => (
      <text key={i} x={406 + i * 18} y="248" fontSize="15" fill="#e0aa00" fontFamily="system-ui,sans-serif">★</text>
    ))}

    {/* ── Audience ──────────────────────────────────────── */}
    {/* Row 3 — back, lightest */}
    {[66, 116, 166, 216, 266, 316, 366, 416, 466].map((x, i) => (
      <g key={`r3-${i}`}>
        <circle cx={x} cy="524" r="9" fill="#CBD5E1" />
        <rect x={x - 9} y="534" width="18" height="14" rx="4" fill="#CBD5E1" fillOpacity="0.55" />
      </g>
    ))}
    {/* Row 2 — mid */}
    {[90, 144, 198, 252, 306, 360, 414, 454].map((x, i) => (
      <g key={`r2-${i}`}>
        <circle cx={x} cy="547" r="10" fill="#94A3B8" />
        <rect x={x - 10} y="558" width="20" height="16" rx="4" fill="#94A3B8" fillOpacity="0.6" />
      </g>
    ))}
    {/* Row 1 — front, darkest */}
    {[116, 174, 232, 290, 348, 396].map((x, i) => (
      <g key={`r1-${i}`}>
        <circle cx={x} cy="574" r="12" fill="#64748B" />
        <rect x={x - 12} y="587" width="24" height="18" rx="5" fill="#64748B" fillOpacity="0.65" />
      </g>
    ))}

    {/* Subtle ground line under audience */}
    <line x1="40" y1="608" x2="480" y2="608" stroke="#CBD5E1" strokeWidth="1.5" strokeOpacity="0.5" />
  </svg>
);

export default HeroIllustration;
