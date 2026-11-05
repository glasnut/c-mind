// Слой доступа к данным о товарах.
// Страницы работают только через эти функции, а не с файлами данных напрямую.
// Когда появится сервер/БД, достаточно заменить реализацию здесь.

import { PRODUCTS } from '../../data/products/index.js'
import { scoreProduct } from '../scoring/index.js'

const withScore = (product) => ({ ...product, score: scoreProduct(product) })

export const productsService = {
  getAll() {
    return PRODUCTS.map(withScore)
  },

  getById(id) {
    const product = PRODUCTS.find((p) => p.id === id)
    return product ? withScore(product) : null
  },

  getFeatured() {
    return PRODUCTS.filter((p) => p.featured).map(withScore)
  },

  search(query) {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return PRODUCTS.filter((p) => `${p.brand} ${p.name}`.toLowerCase().includes(q)).map(withScore)
  },
}
