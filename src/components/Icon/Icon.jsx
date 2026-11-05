// Набор иконок в едином линейном стиле. Цвет задаётся через currentColor.

const PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  scale: (
    <>
      <path d="M12 3v18M7 21h10M5 7h14" />
      <path d="M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z" />
    </>
  ),
  chart: <path d="M5 20v-8M12 20V5M19 20v-5" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  cube: (
    <>
      <path d="M12 2l9 5v10l-9 5-9-5V7z" />
      <path d="M3 7l9 5 9-5M12 12v10" />
    </>
  ),
  flame: <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z" />,
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  sliders: <path d="M4 7h9M17 7h3M4 17h3M11 17h9M13 4v6M7 14v6" />,
  heart: <path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" />,
  gpu: (
    <>
      <rect x="2" y="6" width="20" height="11" rx="2" />
      <circle cx="8" cy="11.5" r="3" />
      <circle cx="16" cy="11.5" r="3" />
      <path d="M5 17v3M2 9h-1" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  ram: (
    <>
      <rect x="2" y="7" width="20" height="9" rx="1.5" />
      <path d="M6 10v3M10 10v3M14 10v3M18 10v3M5 16v2M9 16v2M15 16v2M19 16v2" />
    </>
  ),
  ssd: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <rect x="6" y="9" width="5" height="6" rx="1" />
      <path d="M14 10h4M14 14h4" />
    </>
  ),
  motherboard: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="7" y="7" width="5" height="5" rx="1" />
      <path d="M15 7h2M15 11h2M7 16h10" />
    </>
  ),
  psu: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="9" cy="12" r="3.5" />
      <path d="M16 9h2M16 12h2M16 15h2" />
    </>
  ),
  case: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <circle cx="12" cy="8" r="2.5" />
      <circle cx="12" cy="15" r="2.5" />
    </>
  ),
  cooler: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="1.8" />
      <path d="M12 10c0-4 1-6 3-7M14 12c4 0 6 1 7 3M12 14c0 4-1 6-3 7M10 12c-4 0-6-1-7-3" />
    </>
  ),
}

export default function Icon({ name, size = 24, strokeWidth = 1.75, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
