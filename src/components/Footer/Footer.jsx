import { Link } from 'react-router-dom'
import Logo from '../Logo/Logo.jsx'
import { NAV_ITEMS } from '../Header/Header.jsx'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo />
          <p className="footer__note">
            Цены в демо-базе условные и не являются актуальными предложениями. Оценки
            рассчитываются автоматически по характеристикам.
          </p>
        </div>

        <nav className="footer__nav" aria-label="Разделы сайта">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
