import { Link } from 'react-router-dom'
import './Logo.css'

// Знак C-Mind: два вложенных «C» с квадратом-чипом внутри.
export function LogoMark({ size = 40 }) {
  return (
    <svg
      className="logo__mark"
      width={size}
      height={size * (595 / 575)}
      viewBox="680 535 575 595"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1222 676L1117 571H851L718 704V956L855 1093H1117L1222 988"
        stroke="#E8EDF5"
        strokeWidth="52"
      />
      <path
        d="M1148 745L1085 677H898L825 750V897L913 985H1085L1148 922"
        stroke="#087BFF"
        strokeWidth="53"
      />
      <rect x="924" y="771" width="121" height="122" fill="#FF8500" />
    </svg>
  )
}

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="C-Mind — на главную">
      <LogoMark size={34} />
      <span className="logo__text">C-MIND</span>
    </Link>
  )
}
