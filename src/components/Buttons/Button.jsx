import { Link } from 'react-router-dom'
import Icon from '../Icon/Icon.jsx'
import './Button.css'

// Универсальная кнопка. Если передан `to` — рендерится ссылкой (роутинг без перезагрузки).
// variant: 'primary' (оранжевая) | 'outline' (контурная)
export default function Button({ to, variant = 'primary', icon, arrow = false, children, ...rest }) {
  const className = `btn btn--${variant}`
  const content = (
    <>
      {icon && <Icon name={icon} size={20} />}
      <span>{children}</span>
      {arrow && <Icon name="arrow" size={18} />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={className} {...rest}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" className={className} {...rest}>
      {content}
    </button>
  )
}
