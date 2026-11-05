// Сравнение товаров одной категории.
//
// buildComparison(products) возвращает готовые данные для страницы: строки таблицы с
// пометкой победителя и текстовое заключение. Победитель определяется по направлению
// параметра (например, у энергопотребления лучше меньшее значение), а не по размеру числа.
// Параметры, которые нельзя честно сравнить, показываются без победителя.

import { SPEC_DEFS, formatSpec } from '../../data/specs.js'
import { CRITERIA_LABELS } from '../scoring/index.js'
import { formatPrice, formatScore } from '../../utils/format.js'

const decimal1 = (v) => v.toFixed(1).replace('.', ',')
const decimalAuto = (v) => (v < 10 ? v.toFixed(2) : v.toFixed(1)).replace('.', ',')

// Приводит значение к числу для сравнения (или null, если сравнить нельзя)
function comparable(def, value) {
  if (value === undefined || value === null || value === '') return null
  if (def.rank) {
    const index = def.rank.indexOf(value)
    return index === -1 ? null : index
  }
  if (typeof value === 'boolean') return Number(value)
  return typeof value === 'number' ? value : null
}

function makeRow(def, products) {
  const values = products.map((p) => def.value(p))
  const nums = values.map((v) => comparable(def, v))
  const known = nums.filter((n) => n !== null)

  let bestIndexes = []
  if (def.better && known.length >= 2 && new Set(known).size > 1) {
    const target = def.better === 'high' ? Math.max(...known) : Math.min(...known)
    bestIndexes = nums.flatMap((n, i) => (n === target ? [i] : []))
  }

  return {
    id: def.id,
    label: def.label,
    hint: def.hint,
    decisive: bestIndexes.length > 0,
    cells: products.map((p, i) => ({
      text: def.text(p),
      best: bestIndexes.includes(i),
    })),
  }
}

export function buildComparison(products) {
  const category = products[0].category

  const generalDefs = [
    { id: 'price', label: 'Цена (условная)', better: 'low', value: (p) => p.price, text: (p) => formatPrice(p.price) },
    {
      id: 'score',
      label: 'Общая оценка C-Mind',
      better: 'high',
      value: (p) => p.score.total,
      text: (p) => `${formatScore(p.score.total)} / 10`,
    },
    {
      id: 'perf',
      label: 'Индекс производительности',
      hint: 'Условный индекс по шкале 0–100: оценка по открытым обзорам, не собственные замеры.',
      better: 'high',
      value: (p) => p.perfIndex,
      text: (p) => String(p.perfIndex),
    },
    {
      id: 'perfPerPrice',
      label: 'Производительность на 1000 ₽',
      better: 'high',
      value: (p) => p.perfIndex / (p.price / 1000),
      text: (p) => decimalAuto(p.perfIndex / (p.price / 1000)),
    },
  ]

  const specDefs = SPEC_DEFS[category].map((def) => ({
    ...def,
    value: def.get,
    text: (p) => formatSpec(def, p),
  }))

  // Критерии оценки, которые есть у всех сравниваемых товаров
  const criteriaIds = Object.keys(CRITERIA_LABELS).filter((id) =>
    products.every((p) => p.score.breakdown.some((b) => b.id === id)),
  )
  const criteriaDefs = criteriaIds.map((id) => ({
    id: `criterion-${id}`,
    label: CRITERIA_LABELS[id],
    better: 'high',
    value: (p) => p.score.breakdown.find((b) => b.id === id).score,
    text: (p) => `${formatScore(p.score.breakdown.find((b) => b.id === id).score)} / 10`,
  }))

  const sections = [
    { title: 'Главное', rows: generalDefs.map((d) => makeRow(d, products)) },
    { title: 'Характеристики', rows: specDefs.map((d) => makeRow(d, products)) },
    { title: 'Оценки по критериям', rows: criteriaDefs.map((d) => makeRow(d, products)) },
  ]

  return {
    sections,
    criteria: criteriaIds.map((id) => ({
      id,
      label: CRITERIA_LABELS[id],
      scores: products.map((p) => p.score.breakdown.find((b) => b.id === id).score),
    })),
    conclusion: buildConclusion(products, sections),
  }
}

// ---------- Заключение ----------

function buildConclusion(products, sections) {
  const paragraphs = []
  const byScore = [...products].sort((a, b) => b.score.total - a.score.total)
  const [leader, second] = byScore

  if (leader.score.total - second.score.total < 0.3) {
    const names = byScore
      .filter((p) => leader.score.total - p.score.total < 0.3)
      .map((p) => `${p.name} (${formatScore(p.score.total)})`)
    paragraphs.push(`По общей оценке C-Mind товары почти не различаются: ${names.join(', ')} из 10.`)
  } else {
    paragraphs.push(
      `По общей оценке C-Mind впереди ${leader.name}: ${formatScore(leader.score.total)} из 10, ` +
        `у ${second.name} — ${formatScore(second.score.total)}.`,
    )
  }

  // Сильные стороны каждого товара: параметры, где он единственный победитель
  // Общая оценка уже названа в первом абзаце, критерии — производные от неё, поэтому их не повторяем
  const decisiveRows = sections
    .filter((s) => s.title !== 'Оценки по критериям')
    .flatMap((s) => s.rows)
    .filter((row) => row.id !== 'score')
  products.forEach((product, index) => {
    const wins = decisiveRows.filter((row) => row.decisive && row.cells[index].best && row.cells.filter((c) => c.best).length === 1)
    if (wins.length === 0) {
      paragraphs.push(`${product.name} не опережает остальных ни по одному из однозначно сравниваемых показателей.`)
      return
    }
    const list = wins.slice(0, 5).map((row) => {
      if (products.length === 2) {
        const other = row.cells[1 - index].text
        return `«${row.label}» (${row.cells[index].text} против ${other})`
      }
      return `«${row.label}» (${row.cells[index].text})`
    })
    paragraphs.push(`${product.name} выигрывает по показателям: ${list.join('; ')}.`)
  })

  // Бюджет
  const cheapest = [...products].sort((a, b) => a.price - b.price)[0]
  if (cheapest.id !== leader.id) {
    const diff = leader.price - cheapest.price
    paragraphs.push(
      `Если важнее бюджет, обратите внимание на ${cheapest.name}: он дешевле лидера на ${formatPrice(diff)} ` +
        `(по условным ценам).`,
    )
  }

  paragraphs.push(
    'Частоты, число шейдеров и другие параметры разных архитектур напрямую не сопоставимы, поэтому показаны без победителя. ' +
      'Выводы построены на условных ценах и оценочном индексе производительности и не заменяют независимые тесты.',
  )

  return paragraphs
}
