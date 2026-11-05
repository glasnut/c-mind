import { criterionNote } from '../../services/analysis/index.js'
import { formatScore } from '../../utils/format.js'
import './ScoreBreakdown.css'

// Итоговая оценка товара и разбор по критериям: что и с каким весом повлияло на балл.
export default function ScoreBreakdown({ product, analysis, score = product.score, heading = 'Автоматическая оценка' }) {

  return (
    <section className="sb" aria-labelledby="sb-title">
      <h2 id="sb-title" className="sb__title">
        {heading}
      </h2>

      <div className="sb__total">
        <div className="sb__number">
          {formatScore(score.total)}
          <span>/10</span>
        </div>
        <div>
          <div className="sb__verdict">{analysis.verdict}</div>
          <p className="sb__explain">{analysis.explanation}</p>
        </div>
      </div>

      <ul className="sb__list">
        {score.breakdown.map((row) => (
          <li key={row.id} className="sb__row">
            <div className="sb__row-head">
              <span className="sb__label">{row.label}</span>
              <span className="sb__weight">вес {Math.round(row.weight * 100)}%</span>
              <span className="sb__score">{formatScore(row.score)}/10</span>
            </div>
            <div
              className="sb__bar"
              role="meter"
              aria-label={row.label}
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={row.score}
            >
              <span style={{ width: `${row.score * 10}%` }} />
            </div>
            <p className="sb__note">{criterionNote(product, row.id)}</p>
          </li>
        ))}
      </ul>

      <p className="sb__foot">
        Оценка рассчитана автоматически по характеристикам и условной цене, это не нейросеть. Индекс производительности
        оценочный.
      </p>
    </section>
  )
}
