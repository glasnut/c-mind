import { Link } from 'react-router-dom'
import Icon from '../Icon/Icon.jsx'
import ScoreBadge from '../ScoreBadge/ScoreBadge.jsx'
import { CATEGORIES } from '../../data/categories.js'
import { useLists } from '../../context/ListsContext.jsx'
import { formatPrice } from '../../utils/format.js'
import './ProductCard.css'

// Карточка товара. `badge` — необязательная пометка в углу (например, «Лучшая оценка»).
// `showActions` добавляет кнопки избранного и сравнения (используется в каталоге).
export default function ProductCard({ product, badge, showActions = false }) {
  const category = CATEGORIES[product.category]
  const { isFavorite, inCompare, toggleFavorite, toggleCompare } = useLists()
  const favorite = isFavorite(product.id)
  const compared = inCompare(product.id)

  return (
    <article className="pcard">
      <Link to={`/product/${product.id}`} className="pcard__link" aria-label={product.name}>
        <div className="pcard__visual">
          <Icon name={category.icon} size={64} strokeWidth={1.2} className="pcard__icon" />
          {badge && <span className="pcard__badge">{badge}</span>}
          <span className="pcard__category">{category.name}</span>
        </div>

        <div className="pcard__body">
          <h3 className="pcard__name">{product.name}</h3>
          <p className="pcard__specs">{product.highlights.join(' · ')}</p>

          <div className="pcard__bottom">
            <div>
              <div className="pcard__price">{formatPrice(product.price)}</div>
              <div className="pcard__note">условная цена</div>
            </div>
            <ScoreBadge value={product.score.total} />
            {!showActions && (
              <span className="pcard__go" aria-hidden="true">
                <Icon name="arrow" size={20} />
              </span>
            )}
          </div>
        </div>
      </Link>

      {showActions && (
        <>
          <button
            type="button"
            className={`pcard__fav${favorite ? ' is-active' : ''}`}
            onClick={() => toggleFavorite(product.id)}
            aria-pressed={favorite}
            aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            title={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          >
            <Icon name="heart" size={20} />
          </button>

          <div className="pcard__actions">
            <Link to={`/product/${product.id}`} className="pcard__more">
              Подробнее
            </Link>
            <button
              type="button"
              className={`pcard__compare${compared ? ' is-active' : ''}`}
              onClick={() => toggleCompare(product.id)}
              aria-pressed={compared}
            >
              <Icon name={compared ? 'check' : 'scale'} size={16} />
              {compared ? 'В сравнении' : 'Сравнить'}
            </button>
          </div>
        </>
      )}
    </article>
  )
}
