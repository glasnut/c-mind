// Логика каталога: подготовка фильтров, фильтрация и сортировка.
// Здесь нет ни одной строчки интерфейса — только функции над массивом товаров.

import { ALL_CATEGORIES_DEFS, FILTER_DEFS } from './filters.js'

export const SORT_OPTIONS = [
  { id: 'score', label: 'По оценке C-Mind' },
  { id: 'price-asc', label: 'Сначала дешевле' },
  { id: 'price-desc', label: 'Сначала дороже' },
  { id: 'perf', label: 'По производительности' },
  { id: 'name', label: 'По названию' },
]

const SORTERS = {
  score: (a, b) => b.score.total - a.score.total,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  perf: (a, b) => b.perfIndex - a.perfIndex,
  name: (a, b) => a.name.localeCompare(b.name, 'ru'),
}

export function getFilterDefs(category) {
  return category ? (FILTER_DEFS[category] ?? ALL_CATEGORIES_DEFS) : ALL_CATEGORIES_DEFS
}

const asArray = (value) => (Array.isArray(value) ? value : [value])

// Варианты фильтров (с количеством товаров) для текущей категории.
export function buildFilterOptions(products, defs) {
  return defs.map((def) => {
    if (def.type === 'min') {
      return { ...def, options: def.thresholds.map((value) => ({ value, label: def.format(value) })) }
    }
    const counts = new Map()
    for (const product of products) {
      for (const value of asArray(def.get(product))) counts.set(value, (counts.get(value) ?? 0) + 1)
    }
    const values = [...counts.keys()].sort((a, b) =>
      typeof a === 'number' ? a - b : String(a).localeCompare(String(b), 'ru'),
    )
    return {
      ...def,
      options: values.map((value) => ({
        value,
        label: def.format ? def.format(value) : String(value),
        count: counts.get(value),
      })),
    }
  })
}

// state: { query, selected: { [filterId]: значения }, priceMin, priceMax, favoritesOnly }
export function filterProducts(products, state, defs, favoriteIds = []) {
  const query = state.query.trim().toLowerCase()
  const min = state.priceMin === '' ? null : Number(state.priceMin)
  const max = state.priceMax === '' ? null : Number(state.priceMax)

  return products.filter((product) => {
    if (query && !`${product.brand} ${product.name}`.toLowerCase().includes(query)) return false
    if (min !== null && product.price < min) return false
    if (max !== null && product.price > max) return false
    if (state.favoritesOnly && !favoriteIds.includes(product.id)) return false

    return defs.every((def) => {
      const chosen = state.selected[def.id]
      if (chosen === undefined || chosen === null || (Array.isArray(chosen) && chosen.length === 0)) return true
      if (def.type === 'min') return def.get(product) >= chosen
      return asArray(def.get(product)).some((value) => chosen.includes(value))
    })
  })
}

export function sortProducts(products, sortId) {
  return [...products].sort(SORTERS[sortId] ?? SORTERS.score)
}

// Сколько фильтров сейчас включено (для значка на мобильной кнопке «Фильтры»)
export function countActiveFilters(state) {
  const chosen = Object.values(state.selected).filter(
    (v) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0),
  ).length
  return chosen + (state.priceMin !== '' ? 1 : 0) + (state.priceMax !== '' ? 1 : 0) + (state.favoritesOnly ? 1 : 0)
}
