// Подбор альтернатив: похожие товары той же категории, которые могут быть интереснее.
// Все оценки считаются с теми же весами, что и у выбранного товара, поэтому сравнение честное.

import { scoreProduct } from '../scoring/index.js'
import { formatPrice, formatScore } from '../../utils/format.js'

export function findAlternatives(product, baseTotal, weights, allProducts) {
  const pool = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .map((p) => ({ product: p, total: scoreProduct(p, { weights }).total }))

  const picks = []
  const used = new Set()
  const add = (label, entry, reason) => {
    if (!entry || used.has(entry.product.id)) return
    used.add(entry.product.id)
    picks.push({ label, product: entry.product, total: entry.total, reason })
  }

  // 1. Дешевле: самый высокий балл среди заметно более дешёвых
  const cheaper = pool
    .filter((e) => e.product.price <= product.price * 0.95)
    .sort((a, b) => b.total - a.total || b.product.price - a.product.price)[0]
  if (cheaper) {
    const diff = product.price - cheaper.product.price
    add(
      'Дешевле',
      cheaper,
      `Дешевле на ${formatPrice(diff)}. Оценка ${formatScore(cheaper.total)} против ${formatScore(baseTotal)}.`,
    )
  }

  // 2. Мощнее: ближайшая ступенька вверх по производительности
  const stronger = pool
    .filter((e) => e.product.perfIndex > product.perfIndex)
    .sort((a, b) => a.product.perfIndex - b.product.perfIndex || b.total - a.total)[0]
  if (stronger) {
    const diff = stronger.product.price - product.price
    const priceText = diff >= 0 ? `дороже на ${formatPrice(diff)}` : `дешевле на ${formatPrice(-diff)}`
    add(
      'Мощнее',
      stronger,
      `Индекс производительности ${stronger.product.perfIndex} против ${product.perfIndex}, ${priceText}.`,
    )
  }

  // 3. Лучшая оценка в категории
  const top = [...pool].sort((a, b) => b.total - a.total)[0]
  if (top && top.total > baseTotal) {
    add('Выше оценка', top, `Лучшая оценка в категории при выбранных весах: ${formatScore(top.total)} против ${formatScore(baseTotal)}.`)
  }

  return picks
}
