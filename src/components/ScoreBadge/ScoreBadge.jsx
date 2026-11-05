import { formatScore } from '../../utils/format.js'
import './ScoreBadge.css'

// Круглый бейдж с общей оценкой товара (0–10).
export default function ScoreBadge({ value }) {
  return (
    <span className="score" title="Автоматическая оценка C-Mind (из 10)">
      <span className="score__value">{formatScore(value)}</span>
      <span className="score__max">/10</span>
    </span>
  )
}
