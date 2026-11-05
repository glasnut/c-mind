import { SCENARIO_LIST, WEIGHT_LABELS } from '../../data/scenarios.js'

// Выбор сценария и ручная настройка весов критериев.
// Ползунки показывают только критерии, применимые к выбранному товару.
export default function WeightsPanel({ scenarioId, onScenario, weights, criteriaKeys, onWeight, custom, onReset }) {
  return (
    <section className="wp" aria-label="Сценарий и важность критериев">
      <h2>Для чего выбираете?</h2>
      <div className="wp__chips" role="group" aria-label="Сценарий использования">
        {SCENARIO_LIST.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip ${!custom && s.id === scenarioId ? 'is-active' : ''}`}
            aria-pressed={!custom && s.id === scenarioId}
            onClick={() => onScenario(s.id)}
            title={s.description}
          >
            {s.name}
          </button>
        ))}
      </div>

      <details className="wp__details">
        <summary>Настроить важность критериев вручную{custom ? ' (изменено)' : ''}</summary>
        <div className="wp__sliders">
          {criteriaKeys.map((key) => (
            <label key={key} className="wp__slider">
              <span>
                {WEIGHT_LABELS[key]} <b>{weights[key] ?? 0}</b>
              </span>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={weights[key] ?? 0}
                onChange={(e) => onWeight(key, Number(e.target.value))}
              />
            </label>
          ))}
          <p className="wp__hint">0 — критерий не учитывается, 10 — максимально важен. Если обнулить все, используются веса категории.</p>
          {custom && (
            <button type="button" className="wp__reset" onClick={onReset}>
              Сбросить к сценарию
            </button>
          )}
        </div>
      </details>
    </section>
  )
}
