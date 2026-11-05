import { Suspense, lazy } from 'react'
import { SERIES_COLORS } from './colors.js'

// Recharts подгружается только на странице сравнения — остальные страницы он не замедляет.
const RadarCompare = lazy(() => import('./RadarCompare.jsx'))

const decimal = (v) => v.toFixed(1).replace('.', ',')

// Группа столбиков: по одному на товар, длина — доля от максимума в группе.
function BarGroup({ title, products, values, format }) {
  const max = Math.max(...values)
  return (
    <div className="bars__group">
      <h3>{title}</h3>
      {products.map((p, i) => (
        <div key={p.id} className="bars__row">
          <span className="bars__name">{p.name}</span>
          <span className="bars__track">
            <span style={{ width: `${max ? (values[i] / max) * 100 : 0}%`, background: SERIES_COLORS[i] }} />
          </span>
          <span className="bars__value">{format(values[i])}</span>
        </div>
      ))}
    </div>
  )
}

export default function ComparisonCharts({ products, criteria }) {
  return (
    <section className="charts" aria-labelledby="charts-title">
      <h2 id="charts-title">Наглядно</h2>

      <div className="charts__grid">
        <div className="charts__panel">
          <h3 className="charts__subtitle">Оценки по критериям (из 10)</h3>
          {criteria.length >= 3 ? (
            <Suspense fallback={<p className="charts__loading">Загрузка графика…</p>}>
              <RadarCompare products={products} criteria={criteria} />
            </Suspense>
          ) : null}
          <div className="bars">
            {criteria.map((c) => (
              <BarGroup key={c.id} title={c.label} products={products} values={c.scores} format={decimal} />
            ))}
          </div>
        </div>

        <div className="charts__panel">
          <h3 className="charts__subtitle">Цена и производительность</h3>
          <div className="bars">
            <BarGroup
              title="Индекс производительности (условный)"
              products={products}
              values={products.map((p) => p.perfIndex)}
              format={(v) => String(v)}
            />
            <BarGroup
              title="Цена, ₽ (условная)"
              products={products}
              values={products.map((p) => p.price)}
              format={(v) => new Intl.NumberFormat('ru-RU').format(v)}
            />
            <BarGroup
              title="Производительность на 1000 ₽"
              products={products}
              values={products.map((p) => p.perfIndex / (p.price / 1000))}
              format={(v) => (v < 10 ? v.toFixed(2) : v.toFixed(1)).replace('.', ',')}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
