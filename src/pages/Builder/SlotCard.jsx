import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon.jsx'
import { CATEGORIES } from '../../data/categories.js'
import { SLOT_NAMES } from '../../services/builder/slots.js'
import { formatPrice } from '../../utils/format.js'

const HINTS = {
  cpu: 'Выберите процессор — от него зависит сокет платы.',
  motherboard: 'Плата должна подходить по сокету и типу памяти.',
  ram: 'Тип памяти (DDR4/DDR5) должен совпадать с платой.',
  gpu: 'Нужна, если у процессора нет встроенной графики.',
  storage: 'Для системы лучше SSD.',
  psu: 'Мощность проверяется по потреблению процессора и видеокарты.',
  case: 'Проверяются формат платы, длина видеокарты и высота кулера.',
  cooler: 'Должен подходить по сокету и по высоте корпуса.',
}

// Один слот сборки: выбранная деталь или выпадающий список вариантов.
export default function SlotCard({ slot, part, options, onlyCompatible, onSelect, onRemove }) {
  const category = CATEGORIES[slot]
  const visible = onlyCompatible ? options.filter((o) => o.problems.length === 0 || o.product.id === part?.id) : options
  const hidden = options.length - visible.length

  return (
    <article className={`slot ${part ? 'slot--filled' : ''}`} data-slot={slot}>
      <div className="slot__icon" aria-hidden="true">
        <Icon name={category.icon} size={26} />
      </div>
      <div className="slot__body">
        <h3>{SLOT_NAMES[slot]}</h3>
        {part ? (
          <div className="slot__chosen">
            <Link to={`/product/${part.id}`} className="slot__name">
              {part.name}
            </Link>
            <span className="slot__price">{formatPrice(part.price)}</span>
          </div>
        ) : (
          <p className="slot__hint">{HINTS[slot]}</p>
        )}

        <div className="slot__controls">
          <select
            aria-label={`${SLOT_NAMES[slot]}: ${part ? 'заменить' : 'выбрать'}`}
            value=""
            onChange={(e) => e.target.value && onSelect(slot, e.target.value)}
          >
            <option value="">{part ? 'Заменить…' : 'Выбрать…'}</option>
            {visible.map(({ product, problems }) => (
              <option key={product.id} value={product.id} disabled={product.id === part?.id}>
                {problems.length ? '⚠ ' : ''}
                {product.name} — {formatPrice(product.price)}
              </option>
            ))}
          </select>
          {part && (
            <>
              <Link className="slot__link" to={`/analyzer?product=${part.id}`}>
                Анализ
              </Link>
              <button type="button" className="slot__remove" onClick={() => onRemove(slot)} aria-label={`Убрать: ${SLOT_NAMES[slot]}`}>
                Убрать
              </button>
            </>
          )}
        </div>
        {onlyCompatible && hidden > 0 && (
          <p className="slot__meta">Скрыто несовместимых вариантов: {hidden}</p>
        )}
      </div>
    </article>
  )
}
