import { useState } from 'react'
import { SLOT_NAMES } from '../../services/builder/slots.js'
import { formatPrice, formatScore } from '../../utils/format.js'

function IssueList({ title, tone, items }) {
  if (items.length === 0) return null
  return (
    <div className={`issues issues--${tone}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <b>{i.title}.</b> {i.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Итоги сборки: цена, потребление, оценка, статус совместимости и сохранение.
export default function Summary({ summary, purposeName, onSave, onReset }) {
  const { compatibility: c, total, power, build, notes, chosen, missing, complete, ready } = summary
  const [name, setName] = useState('')
  const [saved, setSaved] = useState('')

  let status
  if (chosen.length === 0) status = { tone: 'idle', text: 'Выберите комплектующие — совместимость проверяется автоматически.' }
  else if (c.errors.length) status = { tone: 'error', text: `Найдены несовместимости: ${c.errors.length}` }
  else if (!complete) status = { tone: 'warn', text: `Конфликтов нет, сборка неполная: не хватает ${missing.length}` }
  else if (c.warnings.length) status = { tone: 'warn', text: 'Собрать можно, но есть предупреждения' }
  else status = { tone: 'ok', text: 'Сборка полная, все проверки пройдены' }

  const save = (e) => {
    e.preventDefault()
    if (chosen.length === 0) return
    onSave(name.trim() || `Сборка ${new Date().toLocaleDateString('ru-RU')}`)
    setName('')
    setSaved('Сборка сохранена в этом браузере.')
  }

  return (
    <aside className="sum" aria-label="Итоги сборки">
      <div className={`sum__status sum__status--${status.tone}`} role="status">
        {status.text}
      </div>

      <dl className="sum__stats">
        <div>
          <dt>Стоимость (условная)</dt>
          <dd className="sum__price">{formatPrice(total)}</dd>
        </div>
        <div>
          <dt>Потребление (оценка)</dt>
          <dd>{power.total ? `~${power.total} Вт` : '—'}</dd>
        </div>
        <div>
          <dt>Оценка для цели «{purposeName}»</dt>
          <dd>{chosen.length ? `${formatScore(build.score)} / 10` : '—'}</dd>
        </div>
      </dl>
      <p className="sum__foot">Цены условные. Оценка — автоматическая по условным индексам производительности, это не замеры и не нейросеть.</p>

      {missing.length > 0 && chosen.length > 0 && (
        <p className="sum__missing">
          Не выбрано: {missing.map((s) => SLOT_NAMES[s].toLowerCase()).join(', ')}.
        </p>
      )}

      <IssueList title="Несовместимо" tone="error" items={c.errors} />
      <IssueList title="Предупреждения" tone="warn" items={c.warnings} />
      {notes.length > 0 && (
        <div className="issues issues--note">
          <h3>Баланс сборки</h3>
          <ul>
            {notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}
      {c.passed.length > 0 && (
        <details className="issues issues--ok">
          <summary>Проверено, совместимо: {c.passed.length}</summary>
          <ul>
            {c.passed.map((i) => (
              <li key={i.id}>
                <b>{i.title}.</b> {i.text}
              </li>
            ))}
          </ul>
        </details>
      )}

      <form className="sum__save" onSubmit={save}>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setSaved('')
          }}
          placeholder="Название сборки"
          aria-label="Название сборки"
          maxLength={60}
        />
        <button type="submit" disabled={chosen.length === 0}>
          Сохранить
        </button>
      </form>
      {saved && <p className="sum__saved" role="status">{saved}</p>}
      {chosen.length > 0 && (
        <button type="button" className="sum__reset" onClick={onReset}>
          Очистить сборку
        </button>
      )}
      {chosen.length > 0 && !ready && complete && <p className="sum__foot">Сохранить можно и с предупреждениями — они останутся в проверке.</p>}
    </aside>
  )
}
