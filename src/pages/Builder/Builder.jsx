import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useStoredState } from '../../hooks/useStoredState.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { SLOTS, PURPOSES, PURPOSE_LIST, optionsForSlot, summarize } from '../../services/builder/index.js'
import { productsService } from '../../services/products/index.js'
import { CATEGORIES } from '../../data/categories.js'
import { formatPrice, plural } from '../../utils/format.js'
import SlotCard from './SlotCard.jsx'
import Summary from './Summary.jsx'
import './Builder.css'

const MAX_SAVED = 20

export default function Builder() {
  useDocumentTitle('Подбор ПК')
  // Текущая сборка и сохранённые сборки живут в localStorage, чтобы не пропадать при перезагрузке
  const { scope, logAction } = useAuth()
  const [selection, setSelection] = useStoredState(scope('builder-draft'), {})
  const [purposeId, setPurposeId] = useStoredState(scope('builder-purpose'), 'universal')
  const [saved, setSaved] = useStoredState(scope('builds'), [])
  const [onlyCompatible, setOnlyCompatible] = useState(true)

  const purpose = PURPOSES[purposeId] ?? PURPOSES.universal
  const summary = useMemo(() => summarize(selection, purpose.id), [selection, purpose.id])
  const options = useMemo(() => Object.fromEntries(SLOTS.map((slot) => [slot, optionsForSlot(slot, selection)])), [selection])

  const select = (slot, id) => setSelection((s) => ({ ...s, [slot]: id }))
  const remove = (slot) =>
    setSelection((s) => {
      const next = { ...s }
      delete next[slot]
      return next
    })

  const save = (name) => {
    logAction('build', `Сохранена сборка: ${name}`, '/builder')
    setSaved((list) =>
      [{ id: `${Date.now()}`, name, purposeId: purpose.id, selection, createdAt: new Date().toISOString() }, ...list].slice(0, MAX_SAVED),
    )
  }

  const load = (build) => {
    // Товар мог исчезнуть из базы — такие детали пропускаем
    setSelection(Object.fromEntries(Object.entries(build.selection).filter(([, id]) => productsService.getById(id))))
    setPurposeId(PURPOSES[build.purposeId] ? build.purposeId : 'universal')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="container bld">
      <header className="bld__head">
        <h1>Подбор ПК</h1>
        <p>
          Соберите компьютер по деталям: совместимость (сокет, память, размеры, мощность блока питания) проверяется по характеристикам.
          Цены условные.
        </p>
      </header>

      <section className="bld__purpose" aria-label="Цель сборки">
        <h2>Для чего собираете?</h2>
        <div className="bld__chips" role="group">
          {PURPOSE_LIST.map((p) => (
            <button key={p.id} type="button" className={`chip ${p.id === purpose.id ? 'is-active' : ''}`} aria-pressed={p.id === purpose.id} onClick={() => setPurposeId(p.id)}>
              {p.name}
            </button>
          ))}
        </div>
        <label className="bld__check">
          <input type="checkbox" checked={onlyCompatible} onChange={(e) => setOnlyCompatible(e.target.checked)} />
          Показывать только совместимые варианты
        </label>
      </section>

      <div className="bld__layout">
        <div className="bld__slots">
          {SLOTS.map((slot) => (
            <SlotCard
              key={slot}
              slot={slot}
              part={summary.parts[slot]}
              options={options[slot]}
              onlyCompatible={onlyCompatible}
              onSelect={select}
              onRemove={remove}
            />
          ))}
        </div>
        <Summary summary={summary} purposeName={purpose.name} onSave={save} onReset={() => setSelection({})} />
      </div>

      <section className="bld__saved" aria-labelledby="saved-title">
        <h2 id="saved-title">Сохранённые сборки</h2>
        {saved.length === 0 ? (
          <p className="bld__empty">Пока нет сохранённых сборок. Сохраните текущую кнопкой в итогах.</p>
        ) : (
          <ul>
            {saved.map((b) => {
              const s = summarize(b.selection, b.purposeId)
              return (
                <li key={b.id} className="saved">
                  <div>
                    <h3>{b.name}</h3>
                    <p>
                      {PURPOSES[b.purposeId]?.name ?? 'Универсальное'} · {s.chosen.length} {plural(s.chosen.length, ['деталь', 'детали', 'деталей'])} ·{' '}
                      {formatPrice(s.total)} (условно)
                      {s.compatibility.errors.length > 0 && ` · несовместимостей: ${s.compatibility.errors.length}`}
                    </p>
                    <p className="saved__parts">{s.chosen.map((slot) => s.parts[slot].name).join(' · ')}</p>
                  </div>
                  <div className="saved__actions">
                    <button type="button" onClick={() => load(b)}>
                      Открыть
                    </button>
                    <button type="button" className="saved__del" onClick={() => setSaved((l) => l.filter((x) => x.id !== b.id))} aria-label={`Удалить сборку ${b.name}`}>
                      Удалить
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
