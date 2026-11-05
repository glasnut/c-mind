import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ScoreBreakdown from '../../components/ScoreBreakdown/ScoreBreakdown.jsx'
import ListCard from '../../components/ListCard/ListCard.jsx'
import { CATEGORY_LIST } from '../../data/categories.js'
import { SCENARIOS } from '../../data/scenarios.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLists } from '../../context/ListsContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { productsService } from '../../services/products/index.js'
import { analyzeFull } from '../../services/analysis/full.js'
import { scoreProduct } from '../../services/scoring/index.js'
import { formatPrice, formatScore } from '../../utils/format.js'
import WeightsPanel from './WeightsPanel.jsx'
import Consultant from './Consultant.jsx'
import './Analyzer.css'

const QUICK_PICKS = productsService.getFeatured()

export default function Analyzer() {
  useDocumentTitle('Анализатор комплектующих')
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { replaceCompare } = useLists()
  const { logAction } = useAuth()
  const [customWeights, setCustomWeights] = useState(null)

  const product = useMemo(() => productsService.getById(params.get('product') ?? ''), [params])
  const productId = product?.id
  const productName = product?.name
  useEffect(() => {
    if (productId) logAction('analysis', `Анализ: ${productName}`, `/analyzer?product=${productId}`)
  }, [productId, productName, logAction])

  const scenarioId = SCENARIOS[params.get('scenario')] ? params.get('scenario') : 'universal'
  const scenario = SCENARIOS[scenarioId]
  const [category, setCategory] = useState(product?.category ?? 'gpu')
  const activeCategory = product?.category ?? category

  const options = useMemo(
    () =>
      productsService
        .getAll()
        .filter((p) => p.category === activeCategory)
        .sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [activeCategory],
  )

  const update = (patch) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k)
    setParams(next, { replace: true })
  }

  const selectProduct = (id) => {
    setCustomWeights(null)
    update({ product: id })
  }

  // Веса: ручные > сценарий > веса категории (null)
  const baseScore = product ? scoreProduct(product) : null
  const criteriaKeys = baseScore ? Object.keys(baseScore.criteria) : []
  const scenarioWeights = scenario.weights
  const effectiveWeights = customWeights ?? scenarioWeights
  const analysis = useMemo(() => (product ? analyzeFull(product, effectiveWeights) : null), [product, effectiveWeights])

  const shownWeights = useMemo(() => {
    if (customWeights) return customWeights
    if (scenarioWeights) return scenarioWeights
    return baseScore?.breakdown.reduce((acc, r) => ({ ...acc, [r.id]: Math.round(r.weight * 100) / 10 }), {}) ?? {}
  }, [customWeights, scenarioWeights, baseScore])

  const setWeight = (key, value) => {
    const current = customWeights ?? Object.fromEntries(criteriaKeys.map((k) => [k, Math.round(shownWeights[k] ?? 0)]))
    setCustomWeights({ ...current, [key]: value })
  }

  const compareWith = (id) => {
    replaceCompare([product.id, id])
    navigate('/comparison')
  }

  return (
    <main className="container az">
      <header className="az__head">
        <h1>Интеллектуальный анализатор</h1>
        <p>
          Выберите комплектующее и сценарий — получите оценку, плюсы и минусы, альтернативы. Анализ автоматический, по
          характеристикам и условной цене; нейросеть не используется.
        </p>
      </header>

      <section className="az__picker" aria-label="Выбор комплектующего">
        <label className="field">
          <span>Категория</span>
          <select
            value={activeCategory}
            onChange={(e) => {
              setCategory(e.target.value)
              setCustomWeights(null)
              update({ product: '' })
            }}
          >
            {CATEGORY_LIST.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--wide">
          <span>Товар</span>
          <select value={product?.id ?? ''} onChange={(e) => selectProduct(e.target.value)}>
            <option value="">Выберите товар…</option>
            {options.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {!product && (
        <section className="az__empty">
          <h2>Что проанализировать?</h2>
          <p>Выберите товар выше или начните с популярных:</p>
          <div className="az__quick">
            {QUICK_PICKS.map((p) => (
              <button key={p.id} type="button" className="chip" onClick={() => selectProduct(p.id)}>
                {p.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {product && analysis && (
        <>
          <div className="az__product">
            <div>
              <h2>{product.name}</h2>
              <p>
                Условная цена {formatPrice(product.price)} · сценарий: {customWeights ? 'свои веса' : scenario.name}
              </p>
            </div>
            <Link to={`/product/${product.id}`} className="az__link">
              Страница товара
            </Link>
          </div>

          <WeightsPanel
            scenarioId={scenarioId}
            onScenario={(id) => {
              setCustomWeights(null)
              update({ scenario: id })
            }}
            weights={shownWeights}
            criteriaKeys={criteriaKeys}
            onWeight={setWeight}
            custom={Boolean(customWeights)}
            onReset={() => setCustomWeights(null)}
          />

          <ScoreBreakdown
            product={product}
            analysis={analysis}
            score={analysis.score}
            heading={`Оценка: ${customWeights ? 'свои веса' : scenario.name}`}
          />

          <div className="az__grid">
            <ListCard title="Плюсы" tone="pro" items={analysis.pros} empty="Явных преимуществ не выявлено." />
            <ListCard title="Минусы" tone="con" items={analysis.cons} empty="Заметных недостатков не выявлено." />
            <ListCard title="Подходит для" tone="use" items={analysis.scenarios} empty="Сценарии не определены." />
            <ListCard
              title="В каких случаях покупка может быть невыгодной"
              tone="warn"
              items={analysis.avoid}
              empty="По расчётам явных рисков нет."
            />
          </div>

          <section className="az__alts" aria-labelledby="alts-title">
            <h2 id="alts-title">Альтернативы</h2>
            {analysis.alternatives.length === 0 ? (
              <p>Ближайших альтернатив не найдено — модель выделяется в своей категории.</p>
            ) : (
              <ul>
                {analysis.alternatives.map((a) => (
                  <li key={a.product.id} className="alt">
                    <span className="alt__tag">{a.label}</span>
                    <Link to={`/analyzer?product=${a.product.id}&scenario=${scenarioId}`} className="alt__name">
                      {a.product.name}
                    </Link>
                    <span className="alt__meta">
                      {formatPrice(a.product.price)} · оценка {formatScore(a.product.score.total)}
                    </span>
                    <p>{a.reason}</p>
                    <button type="button" className="alt__btn" onClick={() => compareWith(a.product.id)}>
                      Сравнить
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Consultant product={product} analysis={analysis} scenario={scenario} weights={effectiveWeights} />
        </>
      )}
    </main>
  )
}
