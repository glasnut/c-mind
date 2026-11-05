// Иллюстрация игрового ПК с RGB-подсветкой (векторная, в палитре C-Mind).
// Вентиляторы медленно вращаются; при prefers-reduced-motion анимация отключается глобально.

function Fan({ cx, cy, r, color, speed = 7 }) {
  const blades = Array.from({ length: 7 }, (_, i) => (
    <ellipse
      key={i}
      cx="0"
      cy={-r * 0.52}
      rx={r * 0.2}
      ry={r * 0.4}
      transform={`rotate(${(i * 360) / 7})`}
      fill={color}
      opacity="0.16"
      stroke={color}
      strokeOpacity="0.55"
      strokeWidth="1"
    />
  ))
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill="#050f22" stroke={color} strokeWidth="4" filter="url(#glow)" />
      <circle r={r - 8} fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1.5" />
      <g className="hero-art__spin" style={{ animationDuration: `${speed}s` }}>
        {blades}
      </g>
      <circle r={r * 0.2} fill="#0b2040" stroke={color} strokeWidth="2" />
    </g>
  )
}

export default function HeroArt() {
  return (
    <svg
      className="hero-art"
      viewBox="0 0 560 540"
      role="img"
      aria-label="Игровой компьютер с RGB-подсветкой"
    >
      <defs>
        <linearGradient id="caseEdge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a79d6" />
          <stop offset="0.5" stopColor="#12264a" />
          <stop offset="1" stopColor="#087bff" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1d3f" />
          <stop offset="1" stopColor="#040c1d" />
        </linearGradient>
        <linearGradient id="rgbStrip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8500" />
          <stop offset="1" stopColor="#087bff" />
        </linearGradient>
        <radialGradient id="floorGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#087bff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#087bff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="backGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#087bff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#087bff" stopOpacity="0" />
        </radialGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* свечение за корпусом и на «полу» */}
      <circle cx="280" cy="250" r="290" fill="url(#backGlow)" />
      <ellipse cx="280" cy="500" rx="250" ry="34" fill="url(#floorGlow)" />

      {/* корпус */}
      <rect x="60" y="24" width="440" height="470" rx="24" fill="#071229" stroke="url(#caseEdge)" strokeWidth="3" />
      <rect x="76" y="40" width="408" height="438" rx="14" fill="url(#glass)" />
      <path d="M76 70 L484 40" stroke="#fff" strokeOpacity="0.05" strokeWidth="60" />

      {/* верхний радиатор с вентиляторами */}
      <rect x="104" y="58" width="230" height="86" rx="10" fill="#08162f" stroke="#17315c" />
      <Fan cx="170" cy="101" r="34" color="#087bff" speed={6} />
      <Fan cx="268" cy="101" r="34" color="#087bff" speed={6} />

      {/* передняя колонка вентиляторов */}
      <rect x="378" y="58" width="92" height="352" rx="12" fill="#08162f" stroke="#17315c" />
      <Fan cx="424" cy="112" r="38" color="#ff8500" speed={8} />
      <Fan cx="424" cy="234" r="38" color="#ff8500" speed={8} />
      <Fan cx="424" cy="356" r="38" color="#ff8500" speed={8} />

      {/* материнская плата */}
      <rect x="104" y="160" width="250" height="150" rx="8" fill="#0a1a38" stroke="#17315c" />
      <g stroke="#087bff" strokeOpacity="0.35" strokeWidth="1.5" fill="none">
        <path d="M120 180h40v28h60" />
        <path d="M120 292h70v-26h40" />
        <path d="M330 176v60h-50" />
        <path d="M300 296h34" />
      </g>

      {/* кулер процессора */}
      <circle cx="176" cy="232" r="42" fill="#06132a" stroke="#17315c" strokeWidth="2" />
      <circle cx="176" cy="232" r="30" fill="#0a1d3f" stroke="#ff8500" strokeWidth="4" filter="url(#glow)" />
      <circle cx="176" cy="232" r="10" fill="#ff8500" opacity="0.9" />
      <path d="M176 190 C176 168 190 150 205 144" stroke="#17315c" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M200 215 C230 190 240 160 250 144" stroke="#17315c" strokeWidth="9" fill="none" strokeLinecap="round" />

      {/* оперативная память с RGB */}
      {[258, 282, 306].map((x) => (
        <g key={x}>
          <rect x={x} y="172" width="14" height="108" rx="3" fill="#0d2147" stroke="#1d3c70" />
          <rect x={x + 4} y="176" width="6" height="100" rx="3" fill="url(#rgbStrip)" filter="url(#glow)" />
        </g>
      ))}

      {/* видеокарта */}
      <rect x="104" y="326" width="260" height="66" rx="10" fill="#06132a" stroke="#1d3c70" strokeWidth="2" />
      <rect x="104" y="326" width="260" height="6" rx="3" fill="#087bff" filter="url(#glow)" />
      <Fan cx="156" cy="362" r="24" color="#087bff" speed={5} />
      <Fan cx="234" cy="362" r="24" color="#087bff" speed={5} />
      <Fan cx="312" cy="362" r="24" color="#ff8500" speed={5} />

      {/* кожух блока питания */}
      <rect x="76" y="418" width="408" height="60" rx="0" fill="#050d1f" />
      <rect x="76" y="418" width="408" height="3" fill="#087bff" opacity="0.6" />
      <rect x="104" y="436" width="140" height="8" rx="4" fill="#0f2a52" />

      {/* ножки */}
      <rect x="96" y="494" width="46" height="12" rx="4" fill="#0f2a52" />
      <rect x="418" y="494" width="46" height="12" rx="4" fill="#0f2a52" />
    </svg>
  )
}
