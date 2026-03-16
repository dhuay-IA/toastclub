const VRConferenceIllustration = () => (
  <svg viewBox="0 0 620 440" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-auto">
    <defs>
      <radialGradient id="room-bg" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#EEF4FB" />
        <stop offset="100%" stopColor="#DDE6F0" />
      </radialGradient>
      <linearGradient id="screen-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#007cd8" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#007cd8" stopOpacity="0.06" />
      </linearGradient>
      <linearGradient id="floor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#D1DCE8" />
        <stop offset="100%" stopColor="#BCC9D8" />
      </linearGradient>
      <filter id="hud-shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.07" />
      </filter>
    </defs>

    {/* ── Room background ───────────────────────────────── */}
    <rect width="620" height="440" rx="18" fill="url(#room-bg)" />

    {/* Ceiling */}
    <path d="M0 0 L620 0 L620 100 Q310 60 0 100 Z" fill="#E4EBF4" />

    {/* Ceiling lights */}
    {[120, 250, 370, 500].map((x, i) => (
      <g key={i}>
        <rect x={x - 20} y="18" width="40" height="8" rx="4" fill="#C8D5E4" />
        <ellipse cx={x} cy="30" rx="18" ry="8" fill="#007cd8" fillOpacity="0.08" />
      </g>
    ))}

    {/* Back wall */}
    <path d="M80 100 L540 100 L540 240 L80 240 Z" fill="#E8EFF6" />

    {/* ── Presentation screen (back wall center) ────────── */}
    <rect x="190" y="108" width="240" height="130" rx="6" fill="url(#screen-grad)" />
    <rect x="190" y="108" width="240" height="130" rx="6" fill="none" stroke="#007cd8" strokeWidth="1.5" strokeOpacity="0.3" />
    {/* Screen content: slide mockup */}
    <rect x="200" y="116" width="220" height="10" rx="2" fill="#007cd8" fillOpacity="0.2" />
    <rect x="200" y="132" width="140" height="5" rx="1.5" fill="#1E293B" fillOpacity="0.12" />
    <rect x="200" y="141" width="100" height="5" rx="1.5" fill="#1E293B" fillOpacity="0.1" />
    {/* Slide chart bars */}
    {[
      [210, 60], [230, 85], [250, 48], [270, 90], [290, 70], [310, 95],
    ].map(([x, h], i) => (
      <rect key={i} x={x} y={228 - h} width="14" height={h} rx="3"
        fill="#007cd8" fillOpacity={0.25 + i * 0.06} />
    ))}
    <rect x="200" y="228" width="220" height="1.5" fill="#007cd8" fillOpacity="0.2" />
    {/* Screen glow */}
    <ellipse cx="310" cy="175" rx="120" ry="70" fill="#007cd8" fillOpacity="0.04" />

    {/* Screen mount/stand */}
    <rect x="305" y="238" width="10" height="16" rx="2" fill="#C0CDD8" />
    <rect x="290" y="252" width="40" height="6" rx="3" fill="#AEBCC9" />

    {/* ── Side walls with VR grid lines ─────────────────── */}
    {/* Left wall */}
    <path d="M0 0 L80 100 L80 360 L0 440 Z" fill="#E0E9F2" />
    {[0.25, 0.5, 0.75].map((t, i) => (
      <line key={i} x1="0" y1={t * 440} x2="80" y2={100 + t * 260} stroke="#007cd8" strokeWidth="0.8" strokeOpacity="0.15" />
    ))}
    {[0.3, 0.6].map((t, i) => (
      <line key={i} x1={t * 80} y1="0" x2={t * 80} y2="440" stroke="#007cd8" strokeWidth="0.8" strokeOpacity="0.1" />
    ))}

    {/* Right wall */}
    <path d="M540 100 L620 0 L620 440 L540 360 Z" fill="#E0E9F2" />
    {[0.25, 0.5, 0.75].map((t, i) => (
      <line key={i} x1="620" y1={t * 440} x2="540" y2={100 + t * 260} stroke="#007cd8" strokeWidth="0.8" strokeOpacity="0.15" />
    ))}

    {/* ── Floor ─────────────────────────────────────────── */}
    <path d="M0 440 L80 360 L540 360 L620 440 Z" fill="url(#floor-grad)" />
    {/* Floor grid */}
    {[1, 2, 3, 4].map(i => (
      <line key={i}
        x1={80 + i * 92} y1="360"
        x2={i * 155} y2="440"
        stroke="#A0B0C0" strokeWidth="0.8" strokeOpacity="0.3" />
    ))}
    {[0.25, 0.5, 0.75].map((t, i) => (
      <line key={i}
        x1={80 + t * 460} y1="360"
        x2={t * 620} y2="440"
        stroke="#A0B0C0" strokeWidth="0.8" strokeOpacity="0.2" />
    ))}

    {/* ── Audience seats ────────────────────────────────── */}

    {/* Row 3 — back row (small, light) */}
    {[150, 196, 242, 288, 334, 380, 424, 468].map((x, i) => (
      <g key={`r3-${i}`}>
        {/* Seat */}
        <rect x={x - 13} y="256" width="26" height="20" rx="4" fill="#B8C8D8" />
        {/* Person */}
        <circle cx={x} cy="248" r="11" fill="#94A3B8" />
        <rect x={x - 9} y="236" width="18" height="12" rx="3" fill="#7A8FA0" fillOpacity="0.5" />
      </g>
    ))}

    {/* Row 2 — middle (medium) */}
    {[130, 182, 236, 290, 344, 398, 446].map((x, i) => (
      <g key={`r2-${i}`}>
        <rect x={x - 15} y="298" width="30" height="24" rx="5" fill="#AABCCC" />
        <circle cx={x} cy="288" r="13" fill="#64748B" />
        <rect x={x - 11} y="274" width="22" height="14" rx="4" fill="#4E6070" fillOpacity="0.55" />
      </g>
    ))}

    {/* Row 1 — front (larger, darker) */}
    {[110, 172, 234, 296, 358, 420, 470].map((x, i) => (
      <g key={`r1-${i}`}>
        <rect x={x - 18} y="346" width="36" height="28" rx="6" fill="#9AAAB8" />
        <circle cx={x} cy="334" r="16" fill="#475569" />
        <rect x={x - 13} y="318" width="26" height="16" rx="5" fill="#374455" fillOpacity="0.6" />
      </g>
    ))}

    {/* ── HUD overlay panels ────────────────────────────── */}

    {/* Left HUD — Audience Engagement */}
    <g filter="url(#hud-shadow)">
      <rect x="16" y="136" width="130" height="96" rx="12" fill="white" fillOpacity="0.92" />
      <rect x="16" y="136" width="130" height="96" rx="12" fill="none" stroke="#E2EBF4" strokeWidth="1" />
    </g>
    {/* Top colored bar */}
    <rect x="16" y="136" width="130" height="5" rx="12" fill="#660000" fillOpacity="0.7" />
    <text x="28" y="160" fontSize="8.5" fill="#9CA3AF" fontFamily="system-ui,sans-serif" fontWeight="600" letterSpacing="1">ATENCIÓN</text>
    {/* Engagement ring */}
    <circle cx="52" cy="197" r="22" fill="none" stroke="#EEF1F5" strokeWidth="6" />
    <circle cx="52" cy="197" r="22" fill="none" stroke="#660000" strokeWidth="6"
      strokeDasharray="118" strokeDashoffset="24" strokeLinecap="round"
      transform="rotate(-90 52 197)" />
    <text x="52" y="201" fontSize="10" fill="#660000" fontFamily="system-ui,sans-serif" fontWeight="700" textAnchor="middle">81%</text>
    {/* Breakdown bars */}
    <text x="86" y="182" fontSize="8" fill="#9CA3AF" fontFamily="system-ui,sans-serif">Activa</text>
    <rect x="86" y="186" width="48" height="5" rx="2" fill="#EEF1F5" />
    <rect x="86" y="186" width="39" height="5" rx="2" fill="#660000" fillOpacity="0.7" />
    <text x="86" y="200" fontSize="8" fill="#9CA3AF" fontFamily="system-ui,sans-serif">Neutral</text>
    <rect x="86" y="204" width="48" height="5" rx="2" fill="#EEF1F5" />
    <rect x="86" y="204" width="15" height="5" rx="2" fill="#e0aa00" fillOpacity="0.8" />
    <text x="86" y="218" fontSize="8" fill="#9CA3AF" fontFamily="system-ui,sans-serif">Distraída</text>
    <rect x="86" y="222" width="48" height="5" rx="2" fill="#EEF1F5" />
    <rect x="86" y="222" width="7" height="5" rx="2" fill="#94A3B8" />

    {/* Right HUD — Real-time Feedback */}
    <g filter="url(#hud-shadow)">
      <rect x="474" y="136" width="130" height="110" rx="12" fill="white" fillOpacity="0.92" />
      <rect x="474" y="136" width="130" height="110" rx="12" fill="none" stroke="#E2EBF4" strokeWidth="1" />
    </g>
    <rect x="474" y="136" width="130" height="5" rx="12" fill="#007cd8" fillOpacity="0.7" />
    <text x="486" y="160" fontSize="8.5" fill="#9CA3AF" fontFamily="system-ui,sans-serif" fontWeight="600" letterSpacing="1">RETROALIMENTACIÓN</text>
    {/* Feedback rows */}
    {[
      { label: "Ritmo", val: 78, w: 62, color: "#007cd8" },
      { label: "Claridad", val: 91, w: 73, color: "#007cd8" },
      { label: "Contacto", val: 66, w: 53, color: "#e0aa00" },
      { label: "Postura", val: 85, w: 68, color: "#007cd8" },
    ].map(({ label, val, w, color }, i) => (
      <g key={i}>
        <text x="486" y={178 + i * 20} fontSize="8" fill="#6B7280" fontFamily="system-ui,sans-serif">{label}</text>
        <rect x="524" y={170 + i * 20} width="68" height="5" rx="2" fill="#EEF1F5" />
        <rect x="524" y={170 + i * 20} width={w} height="5" rx="2" fill={color} fillOpacity="0.7" />
        <text x="596" y={176 + i * 20} fontSize="7.5" fill="#6B7280" fontFamily="system-ui,sans-serif">{val}</text>
      </g>
    ))}

    {/* Bottom center HUD — Session timer */}
    <g filter="url(#hud-shadow)">
      <rect x="228" y="384" width="164" height="42" rx="10" fill="white" fillOpacity="0.92" />
      <rect x="228" y="384" width="164" height="42" rx="10" fill="none" stroke="#E2EBF4" strokeWidth="1" />
    </g>
    <text x="244" y="402" fontSize="8.5" fill="#9CA3AF" fontFamily="system-ui,sans-serif" fontWeight="600" letterSpacing="1">TIEMPO RESTANTE</text>
    <text x="244" y="418" fontSize="14" fill="#1E293B" fontFamily="system-ui,sans-serif" fontWeight="700">04:32</text>
    <rect x="310" y="407" width="70" height="5" rx="2.5" fill="#EEF1F5" />
    <rect x="310" y="407" width="44" height="5" rx="2.5" fill="#007cd8" fillOpacity="0.6" />

    {/* VR headset reticle / crosshair (center) */}
    <circle cx="310" cy="200" r="6" fill="none" stroke="#007cd8" strokeWidth="1.5" strokeOpacity="0.35" />
    <line x1="310" y1="190" x2="310" y2="194" stroke="#007cd8" strokeWidth="1.5" strokeOpacity="0.35" />
    <line x1="310" y1="206" x2="310" y2="210" stroke="#007cd8" strokeWidth="1.5" strokeOpacity="0.35" />
    <line x1="300" y1="200" x2="304" y2="200" stroke="#007cd8" strokeWidth="1.5" strokeOpacity="0.35" />
    <line x1="316" y1="200" x2="320" y2="200" stroke="#007cd8" strokeWidth="1.5" strokeOpacity="0.35" />
  </svg>
);

export default VRConferenceIllustration;
