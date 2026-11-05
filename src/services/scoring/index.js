// Автоматическая оценка комплектующего (версия 1).
//
// Каждый критерий считается по характеристикам товара и даёт баллы от 0 до 10.
// Итог — взвешенное среднее; веса берутся из настроек категории (data/categories.js)
// или передаются явно (например, для сценария «игры» или «монтаж»).
// Если для товара критерий неприменим (например, у ОЗУ нет «энергоэффективности»),
// он пропускается, а веса остальных пересчитываются.

import { CATEGORIES } from '../../data/categories.js'

const clamp = (value, min = 0, max = 10) => Math.min(max, Math.max(min, value))
const round1 = (value) => Math.round(value * 10) / 10

export const CRITERIA_LABELS = {
  performance: 'Производительность',
  efficiency: 'Энергоэффективность',
  value: 'Цена/качество',
  freshness: 'Актуальность',
}

// options.weights — необязательная замена весов категории: { performance: 5, value: 1, ... }
export function scoreProduct(product, options = {}) {
  const { weights: categoryWeights, valueRef, efficiencyRef } = CATEGORIES[product.category].scoring
  let weights = options.weights ?? categoryWeights

  const criteria = {
    // Корень сглаживает шкалу: иначе массовые модели (индекс 30–40) вечно получали бы «двойки»
    // рядом с топовыми. Индекс 100 → 10 баллов, 25 → 5, 9 → 3.
    performance: clamp(10 * Math.sqrt(product.perfIndex / 100)),
    value: clamp((10 * (product.perfIndex / (product.price / 1000))) / valueRef),
    freshness: clamp(10 - (new Date().getFullYear() - product.releaseYear)),
  }

  if (product.powerW && efficiencyRef) {
    criteria.efficiency = clamp((10 * (product.perfIndex / product.powerW)) / efficiencyRef)
  }

  // Если пользователь обнулил все применимые веса, возвращаемся к весам категории
  if (!Object.keys(criteria).some((key) => (weights[key] ?? 0) > 0)) weights = categoryWeights

  let weighted = 0
  let weightSum = 0
  for (const [key, score] of Object.entries(criteria)) {
    const weight = weights[key] ?? 0
    weighted += score * weight
    weightSum += weight
  }

  // Подробная раскладка для интерфейса: критерий, балл и доля в итоговой оценке
  const breakdown = Object.entries(criteria)
    .filter(([key]) => (weights[key] ?? 0) > 0)
    .map(([id, score]) => ({
      id,
      label: CRITERIA_LABELS[id],
      score: round1(score),
      weight: weights[id] / weightSum,
    }))

  return {
    total: round1(weighted / weightSum),
    criteria,
    breakdown,
  }
}
