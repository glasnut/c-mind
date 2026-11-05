import { formatPrice } from '../../utils/format.js'

// Боковая панель фильтров. Состояние хранит страница каталога — панель только показывает
// его и сообщает об изменениях через onChange.
export default function FilterPanel({
  open,
  filterOptions,
  filters,
  onChange,
  priceRange,
  activeCount,
  onReset,
  favoritesCount,
}) {
  const setSelected = (id, value) =>
    onChange({ ...filters, selected: { ...filters.selected, [id]: value } })

  const toggleValue = (id, value) => {
    const current = filters.selected[id] ?? []
    setSelected(id, current.includes(value) ? current.filter((v) => v !== value) : [...current, value])
  }

  return (
    <aside className={`filters${open ? ' is-open' : ''}`} aria-label="Фильтры">
      <div className="filters__head">
        <h2>Фильтры</h2>
        {activeCount > 0 && (
          <button type="button" className="filters__reset" onClick={onReset}>
            Сбросить
          </button>
        )}
      </div>

      <label className="filters__check filters__favorites">
        <input
          type="checkbox"
          checked={filters.favoritesOnly}
          onChange={(e) => onChange({ ...filters, favoritesOnly: e.target.checked })}
        />
        <span>Только избранное ({favoritesCount})</span>
      </label>

      <fieldset className="filters__group">
        <legend>Цена, ₽</legend>
        <div className="filters__price">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="от"
            value={filters.priceMin}
            onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
            aria-label="Цена от"
          />
          <span>—</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="до"
            value={filters.priceMax}
            onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
            aria-label="Цена до"
          />
        </div>
        <p className="filters__hint">
          {formatPrice(priceRange.min)} — {formatPrice(priceRange.max)}
        </p>
      </fieldset>

      {filterOptions.map((def) => (
        <fieldset key={def.id} className="filters__group">
          <legend>{def.label}</legend>

          {def.type === 'multi' &&
            def.options.map((option) => (
              <label key={String(option.value)} className="filters__check">
                <input
                  type="checkbox"
                  checked={(filters.selected[def.id] ?? []).includes(option.value)}
                  onChange={() => toggleValue(def.id, option.value)}
                />
                <span>{option.label}</span>
                <small>{option.count}</small>
              </label>
            ))}

          {def.type === 'min' &&
            [{ value: null, label: 'Любая' }, ...def.options].map((option) => (
              <label key={String(option.value)} className="filters__check">
                <input
                  type="radio"
                  name={`filter-${def.id}`}
                  checked={(filters.selected[def.id] ?? null) === option.value}
                  onChange={() => setSelected(def.id, option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
        </fieldset>
      ))}
    </aside>
  )
}
