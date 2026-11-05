// Полный разбор товара для страницы «Анализатор»: оценка с выбранными весами, плюсы и минусы,
// «когда невыгодно» и альтернативы. Используется и консультантом (services/assistant).

import { scoreProduct } from '../scoring/index.js'
import { productsService } from '../products/index.js'
import { analyzeProduct } from './index.js'
import { findAlternatives } from './alternatives.js'
import { whenNotToBuy } from './avoid.js'
import { SCENARIOS } from '../../data/scenarios.js'

export function analyzeFull(product, weights) {
  const score = scoreProduct(product, { weights })
  const base = analyzeProduct(product, score)
  const alternatives = findAlternatives(product, score.total, weights, productsService.getAll())
  const avoid = whenNotToBuy(product, score, alternatives)
  const gamingScore = scoreProduct(product, { weights: SCENARIOS.gaming.weights }).total
  return { score, ...base, alternatives, avoid, gamingScore }
}
