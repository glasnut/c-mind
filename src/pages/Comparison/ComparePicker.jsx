import { useState } from 'react'
import Icon from '../../components/Icon/Icon.jsx'
import { CATEGORY_LIST } from '../../data/categories.js'
import { COMPARE_LIMIT, useLists } from '../../context/ListsContext.jsx'
import { productsService } from '../../services/products/index.js'

const EXAMPLE_IDS = ['nvidia-geforce-rtx-3060-12gb', 'nvidia-geforce-rtx-4060']

// Выбор товаров для сравнения прямо на странице: категория → товар → «Добавить».
// Пока в списке есть товары, категория зафиксирована (сравниваем только однотипное).
export default function ComparePicker({ products }) {
  const { compare, notice, toggleCompare, replaceCompare } = useLists()
  const [chosenCategory, setChosenCategory] = useState('gpu')
  const [chosenId, setChosenId] = useState('')

  const category = products[0]?.category ?? chosenCategory
  const available = productsService
    .getAll()
    .filter((p) => p.category === category && !compare.includes(p.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
  const selectedId = available.some((p) => p.id === chosenId) ? chosenId : (available[0]?.id ?? '')
  const full = compare.length >= COMPARE_LIMIT

  const add = () => {
    if (selectedId) toggleCompare(selectedId)
    setChosenId('')
  }

  return (
    <section className="picker" aria-label="Выбор комплектующих для сравнения">
      <div className="picker__row">
        <label className="picker__field">
          <span>Категория</span>
          <select
            value={category}
            onChange={(e) => setChosenCategory(e.target.value)}
            disabled={products.length > 0}
            title={products.length > 0 ? 'Очистите список, чтобы выбрать другую категорию' : undefined}
          >
            {CATEGORY_LIST.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="picker__field picker__field--wide">
          <span>Товар</span>
          <select value={selectedId} onChange={(e) => setChosenId(e.target.value)} disabled={full || !available.length}>
            {available.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="picker__add" onClick={add} disabled={full || !selectedId}>
          <Icon name="plus" size={18} />
          Добавить
        </button>
      </div>

      <p className="picker__meta">
        {full
          ? `Выбрано максимум — ${COMPARE_LIMIT} товара. Уберите один, чтобы добавить другой.`
          : `Можно выбрать до ${COMPARE_LIMIT} товаров одной категории.`}{' '}
        <button type="button" className="picker__example" onClick={() => replaceCompare(EXAMPLE_IDS)}>
          Пример: RTX 3060 и RTX 4060
        </button>
      </p>

      {notice && (
        <p className="picker__notice" role="status">
          {notice}
        </p>
      )}
    </section>
  )
}
