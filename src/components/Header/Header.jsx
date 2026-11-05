import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Logo from '../Logo/Logo.jsx'
import Search from '../Search/Search.jsx'
import Icon from '../Icon/Icon.jsx'
import { useLists } from '../../context/ListsContext.jsx'
import './Header.css'

export const NAV_ITEMS = [
  { to: '/', label: 'Главная', end: true },
  { to: '/catalog', label: 'Каталог' },
  { to: '/comparison', label: 'Сравнение' },
  { to: '/analyzer', label: 'Анализатор' },
  { to: '/builder', label: 'Подбор ПК' },
  { to: '/about', label: 'О проекте' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { compare } = useLists()

  // При переходе на другую страницу мобильное меню закрывается
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header className="header">
      <div className="container header__inner">
        <Logo />

        <nav className={`header__nav ${menuOpen ? 'is-open' : ''}`} aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="header__link">
              {item.label}
              {item.to === '/comparison' && compare.length > 0 && (
                <span className="header__count" aria-label={`в сравнении: ${compare.length}`}>
                  {compare.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="header__search">
          <Search />
        </div>

        <NavLink to="/profile" className="header__icon-btn" aria-label="Личный кабинет">
          <Icon name="user" size={22} />
        </NavLink>

        <button
          type="button"
          className="header__icon-btn header__burger"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>
      </div>
    </header>
  )
}
