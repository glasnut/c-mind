// Консультант C-Mind.
//
// ВАЖНО: это НЕ нейросеть. Сейчас ответы формируются правилами из характеристик и оценок
// выбранного товара (см. services/analysis). Интерфейс подготовлен к подключению настоящей
// языковой модели: достаточно написать провайдер с тем же методом и передать его в createAssistant.
//
//   provider.answer(question, context) -> Promise<{ text, compareIds?, mode }>
//
//   context = { product, analysis, scenario, weights }   (analysis — результат analyzeFull)
//
// Все провайдеры возвращают поле mode: 'rules' — ответ по правилам, 'llm' — ответ модели.
// Интерфейс показывает пользователю, какой режим используется.

import { productsService } from '../products/index.js'
import { formatPrice, formatScore } from '../../utils/format.js'

export const ASSISTANT_MODE = 'rules'

// ---------- Распознавание вопроса ----------

const INTENTS = [
  { id: 'pair', words: ['подобрать', 'к ней', 'к нему', 'сочет', 'связк', 'в пару', 'какой процессор', 'какую видеокарт', 'что подойд'] },
  { id: 'compare', words: ['сравн', 'альтернатив', 'конкурент', 'аналог', 'вместо', 'другие'] },
  { id: 'games', words: ['игр', 'гейм', 'играть', 'fps', 'кадров'] },
  { id: 'cons', words: ['недостат', 'минус', 'слаб', 'проблем', 'плох'] },
  { id: 'price', words: ['цен', 'стоим', 'дорого', 'дешев', 'сколько'] },
  { id: 'worth', words: ['стоит', 'покуп', 'брать', 'взять', 'выгодно', 'хорош', 'совет'] },
]

export function detectIntent(question) {
  const q = question.toLowerCase()
  return INTENTS.find((intent) => intent.words.some((w) => q.includes(w)))?.id ?? null
}

// ---------- Ответы ----------

const price = (p) => formatPrice(p.price)

function worth({ product, analysis, scenario }) {
  const parts = [
    `${product.name}: оценка ${formatScore(analysis.score.total)} из 10 в сценарии «${scenario.name}» — ${analysis.verdict.toLowerCase()}.`,
  ]
  if (analysis.pros[0]) parts.push(`Сильная сторона: ${analysis.pros[0].toLowerCase()}.`)
  if (analysis.scenarios[0]) parts.push(`Подходит для: ${analysis.scenarios[0].toLowerCase()}.`)
  if (analysis.avoid[0]) parts.push(`Менее выгодно, если ${analysis.avoid[0].replace(/^Если\s+/i, '').replace(/^./, (c) => c.toLowerCase())}`)
  const alt = analysis.alternatives[0]
  return {
    text: parts.join(' '),
    compareIds: alt ? [product.id, alt.product.id] : undefined,
    compareLabel: alt ? `Сравнить с ${alt.product.name}` : undefined,
  }
}

function cons({ product, analysis }) {
  if (analysis.cons.length === 0) {
    return { text: `У ${product.name} по расчётам нет заметных недостатков. Проверьте, подходит ли он под ваши задачи, в блоке «В каких случаях покупка может быть невыгодной».` }
  }
  return { text: `Недостатки ${product.name}: ${analysis.cons.map((c) => c.charAt(0).toLowerCase() + c.slice(1)).join('; ')}.` }
}

function games({ product, analysis }) {
  const specific = {
    gpu: () => {
      const tier =
        product.perfIndex >= 75
          ? 'игры в 4K на высоких настройках'
          : product.perfIndex >= 50
            ? 'игры в 1440p на высоких настройках'
            : product.perfIndex >= 28
              ? 'игры в Full HD на высоких настройках'
              : 'игры в Full HD на средних настройках'
      const memory = product.specs.memoryGb <= 8 ? ' Но 8 ГБ видеопамяти в новых играх на высоких текстурах могут не хватать.' : ''
      return `По индексу производительности (${product.perfIndex} из 100) видеокарта рассчитана на ${tier}.${memory}`
    },
    cpu: () =>
      product.perfIndex >= 55 || product.specs.cacheL3Mb >= 96
        ? 'Для игр мощности более чем достаточно, процессор вряд ли станет узким местом.'
        : product.perfIndex >= 35
          ? 'Для большинства современных игр мощности хватает, с очень мощной видеокартой процессор может ограничивать частоту кадров.'
          : 'Подойдёт для игр среднего уровня; с мощной видеокартой процессор станет узким местом.',
    ram: () =>
      product.specs.capacityGb >= 32
        ? 'Для игр объёма хватает с запасом.'
        : 'Для игр 16 ГБ — рабочий минимум, но при фоновых программах может быть тесно.',
  }
  const gaming = analysis.gamingScore
  const line = specific[product.category]?.() ?? 'Игровая производительность определяется в первую очередь видеокартой и процессором; этот компонент влияет на неё косвенно.'
  return { text: `${line} Оценка в сценарии «Игры»: ${formatScore(gaming)} из 10.` }
}

function compare({ product, analysis }) {
  if (analysis.alternatives.length === 0) {
    return { text: `${product.name} — одна из лучших моделей в категории по оценке и ценовому положению, ближайших альтернатив нет.` }
  }
  const list = analysis.alternatives.map((a) => `${a.product.name} (${a.label.toLowerCase()}): ${a.reason}`)
  const first = analysis.alternatives[0]
  return {
    text: `С чем стоит сравнить: ${list.join(' ')}`,
    compareIds: [product.id, first.product.id],
    compareLabel: `Сравнить с ${first.product.name}`,
  }
}

function pair({ product }) {
  const all = productsService.getAll()
  if (product.category === 'gpu' || product.category === 'cpu') {
    const wantCpu = product.category === 'gpu'
    // Ориентир: процессор должен быть примерно того же уровня, что и видеокарта.
    const target = wantCpu ? 0.8 * product.perfIndex + 15 : (product.perfIndex - 15) / 0.8
    const matches = all
      .filter((p) => p.category === (wantCpu ? 'cpu' : 'gpu'))
      .sort((a, b) => Math.abs(a.perfIndex - target) - Math.abs(b.perfIndex - target))
      .slice(0, 2)
    const names = matches.map((m) => `${m.name} (${price(m)}, оценка ${formatScore(m.score.total)})`)
    return {
      text:
        `Для ${product.name} ${wantCpu ? 'сбалансированными по уровню будут процессоры' : 'сбалансированными по уровню будут видеокарты'}: ${names.join(' и ')}. ` +
        'Это ориентир по условным индексам производительности: проверить совместимость сокета, памяти и блока питания можно в конфигураторе.',
    }
  }
  return { text: 'Подбор совместимых комплектующих (сокет, память, габариты, мощность блока питания) выполняет конфигуратор ПК — там совместимость проверяется по характеристикам.' }
}

function priceAnswer({ product, analysis }) {
  const value = analysis.score.criteria.value
  const verdict = value >= 7 ? 'цена выглядит выгодной' : value >= 5 ? 'цена средняя для такой производительности' : 'цена высока для такой производительности'
  return {
    text: `Условная цена ${product.name} — ${price(product)} (не актуальное предложение). По критерию «Цена/качество» товар получает ${formatScore(value)} из 10: ${verdict}.`,
  }
}

const HANDLERS = { worth, cons, games, compare, pair, price: priceAnswer }

const HELP =
  'Я автоматический анализатор, а не нейросеть, и понимаю ограниченный набор вопросов: стоит ли покупать, какие недостатки, подойдёт ли для игр, с чем сравнить, что подобрать в пару, сколько стоит. Выберите один из примеров или переформулируйте вопрос.'

// ---------- Провайдеры ----------

export const rulesProvider = {
  async answer(question, context) {
    const intent = detectIntent(question)
    if (!intent) return { text: HELP, mode: 'rules' }
    return { ...HANDLERS[intent](context), mode: 'rules' }
  },
}

// Точка расширения: createAssistant({ provider: llmProvider }) подключит языковую модель.
export function createAssistant({ provider = rulesProvider } = {}) {
  return { answer: (question, context) => provider.answer(question, context) }
}

export const assistant = createAssistant()
