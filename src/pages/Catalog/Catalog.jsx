import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '../../components/Icon/Icon.jsx'
import ProductCard from '../../components/ProductCard/ProductCard.jsx'
import FilterPanel from './FilterPanel.jsx'
import { CATEGORIES, CATEGORY_LIST } from '../../data/categories.js'
import { useLists } from '../../context/ListsContext.jsx'
import { productsService } from '../../services/products/index.js'
import {
  SORT_OPTIONS,
  buildFilterOptions,
  countActiveFilters,
  filterProducts,
  getFilterDefs,
  sortProducts,
} from '../../services/catalog/index.js'
import { plural } from '../../utils/format.js'
import './Catalog.css'

const EMPTY_FILTERS = { selected: {}, priceMin: '', priceMax: '', favoritesOnly: false }

// Внешняя часть читает адрес страницы (категория, поиск, сортировка).
// Внутренняя получает key={category}, поэтому фильтры сбрасываются при смене категории.
export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const category = CATEGORIES[params.get('category')] ? params.get('category') : ''
  const query = params.get('q') ?? ''
  const sort = SORT_OPTIONS.some((s) => s.id === params.get('sort')) ? params.get('sort') : 'score'

  const updateParam = (name, value, { replace = false } = {}) => {
    const next = new URLSearchParams(params)
    if (value) next.set(name, value)
    else next.delete(name)
    setParams(next, { replace })
  }

  return (
    <CatalogView
      key={category}
      category={category}
      query={query}
      sort={sort}
      onCategory={(id) => updateParam('category', id)}
      onQuery={(value) => updateParam('q', value, { replace: true })}
      onSort={(value) => updateParam('sort', value === 'score' ? '' : value, { replace: true })}
    />
  )
}

function CatalogView({ category, query, sort, onCategory, onQuery, onSort }) {
  const { favorites } = useLists()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const inCategory = useMemo(
    () => productsService.getAll().filter((p) => !category || p.category === category),
    [category],
  )
  const defs = getFilterDefs(category)
  const filterOptions = useMemo(() => buildFilterOptions(inCategory, defs), [inCategory, defs])

  const visible = useMemo(() => {
    const filtered = filterProducts(inCategory, { query, ...filters }, defs, favorites)
    return sortProducts(filtered, sort)
  }, [inCategory, query, filters, defs, favorites, sort])

  const activeCount = countActiveFilters(filters)
  const prices = inCategory.map((p) => p.price)
  const priceRange = { min: Math.min(...prices), max: Math.max(...prices) }
  const resetFilters = () => setFilters(EMPTY_FILTERS)

  return (
    <main className="container catalog">
      <header className="catalog__head">
        <h1 className="catalog__title">Каталог комплектующих</h1>
        <p className="catalog__note">Цены условные (демо-данные), оценки рассчитаны автоматически.</p>
      </header>

      <nav className="catalog__tabs" aria-label="Категории">
        <button
          type="button"
          className={`catalog__tab${category === '' ? ' is-active' : ''}`}
          onClick={() => onCategory('')}
        >
          Все
        </button>
        {CATEGORY_LIST.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`catalog__tab${category === c.id ? ' is-active' : ''}`}
            onClick={() => onCategory(c.id)}
          >
            <Icon name={c.icon} size={18} />
            {c.name}
          </button>
        ))}
      </nav>

      <div className="catalog__toolbar">
        <label className="catalog__search">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Поиск по названию"
            aria-label="Поиск по названию"
          />
        </label>

        <button
          type="button"
          className="catalog__filters-btn"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
        >
          <Icon name="sliders" size={18} />
          Фильтры{activeCount > 0 && <span className="catalog__badge">{activeCount}</span>}
        </button>

        <label className="catalog__sort">
          <span className="visually-hidden">Сортировка</span>
          <select value={sort} onChange={(e) => onSort(e.target.value)}>
            {SORT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="catalog__layout">
        <FilterPanel
          open={filtersOpen}
          filterOptions={filterOptions}
          filters={filters}
          onChange={setFilters}
          priceRange={priceRange}
          activeCount={activeCount}
          onReset={resetFilters}
          favoritesCount={favorites.length}
        />

        <section aria-live="polite">
          <p className="catalog__count">
            Найдено {visible.length} {plural(visible.length, ['товар', 'товара', 'товаров'])}
          </p>

          {visible.length > 0 ? (
            <div className="catalog__grid">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} showActions />
              ))}
            </div>
          ) : (
            <div className="catalog__empty">
              <h2>Ничего не найдено</h2>
              <p>Попробуйте изменить запрос или убрать часть фильтров.</p>
              <div className="catalog__empty-actions">
                {activeCount > 0 && (
                  <button type="button" className="catalog__reset" onClick={resetFilters}>
                    Сбросить фильтры
                  </button>
                )}
                {query && (
                  <button type="button" className="catalog__reset" onClick={() => onQuery('')}>
                    Очистить поиск
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
