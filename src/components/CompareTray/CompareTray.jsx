import { Link, useLocation } from 'react-router-dom'
import Icon from '../Icon/Icon.jsx'
import { useLists } from '../../context/ListsContext.jsx'
import { productsService } from '../../services/products/index.js'
import { CATEGORIES } from '../../data/categories.js'
import './CompareTray.css'

// Нижняя панель со списком сравнения: видна на всех страницах, пока в списке есть товары.
export default function CompareTray() {
  const { compare, notice, removeFromCompare, clearCompare } = useLists()
  const { pathname } = useLocation()
  const products = compare.map((id) => productsService.getById(id)).filter(Boolean)

  // На самой странице сравнения список и так на виду
  if (pathname === '/comparison') return null
  if (products.length === 0 && !notice) return null

  return (
    <aside className="tray" aria-label="Список сравнения">
      <div className="container tray__inner">
        {products.length > 0 && (
          <>
            <div className="tray__title">
              <Icon name="scale" size={20} />
              <span>
                Сравнение
                <small>{CATEGORIES[products[0].category].name}</small>
              </span>
            </div>

            <ul className="tray__list">
              {products.map((p) => (
                <li key={p.id} className="tray__chip">
                  <span>{p.name}</span>
                  <button type="button" onClick={() => removeFromCompare(p.id)} aria-label={`Убрать ${p.name}`}>
                    <Icon name="close" size={14} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="tray__actions">
              <button type="button" className="tray__clear" onClick={clearCompare}>
                Очистить
              </button>
              {products.length >= 2 ? (
                <Link to="/comparison" className="tray__go">
                  Сравнить ({products.length})
                </Link>
              ) : (
                <span className="tray__hint">Добавьте ещё один товар</span>
              )}
            </div>
          </>
        )}
        {notice && (
          <p className="tray__notice" role="status">
            {notice}
          </p>
        )}
      </div>
    </aside>
  )
}
