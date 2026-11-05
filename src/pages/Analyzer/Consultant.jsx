import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assistant } from '../../services/assistant/index.js'
import { useLists } from '../../context/ListsContext.jsx'

// Консультант: ответы формируются правилами по оценкам и характеристикам, нейросеть не подключена.
export default function Consultant({ product, analysis, scenario, weights }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)
  const { replaceCompare } = useLists()
  const navigate = useNavigate()

  // Новый товар — новый разговор
  useEffect(() => {
    setMessages([])
  }, [product.id])

  useEffect(() => {
    if (messages.length) endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages])

  const pairQuestion =
    product.category === 'gpu' ? 'Какой процессор подобрать?' : product.category === 'cpu' ? 'Какую видеокарту подобрать?' : 'Что подобрать в пару?'
  const questions = ['Стоит ли это покупать?', 'Какие недостатки?', 'Подойдёт ли для современных игр?', 'С чем лучше сравнить?', pairQuestion]

  const ask = async (question) => {
    const q = question.trim()
    if (!q || busy) return
    setBusy(true)
    setMessages((m) => [...m, { role: 'user', text: q }])
    setText('')
    try {
      const reply = await assistant.answer(q, { product, analysis, scenario, weights })
      setMessages((m) => [...m, { role: 'bot', ...reply }])
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: 'Не удалось подготовить ответ. Попробуйте ещё раз.' }])
    }
    setBusy(false)
  }

  const goCompare = (ids) => {
    replaceCompare(ids)
    navigate('/comparison')
  }

  return (
    <section className="cons" aria-labelledby="cons-title">
      <div className="cons__head">
        <h2 id="cons-title">Консультант</h2>
        <span className="cons__badge">автоанализ, нейросеть не подключена</span>
      </div>
      <p className="cons__lead">Задайте вопрос о выбранном товаре — ответ строится по его характеристикам и оценкам выше.</p>

      <div className="cons__chips">
        {questions.map((q) => (
          <button key={q} type="button" className="chip" onClick={() => ask(q)} disabled={busy}>
            {q}
          </button>
        ))}
      </div>

      {messages.length > 0 && (
        <div className="cons__log" role="log" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`msg msg--${m.role}`}>
              <p>{m.text}</p>
              {m.compareIds && (
                <button type="button" className="msg__action" onClick={() => goCompare(m.compareIds)}>
                  {m.compareLabel ?? 'Сравнить'}
                </button>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}

      <form
        className="cons__form"
        onSubmit={(e) => {
          e.preventDefault()
          ask(text)
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Свой вопрос, например: стоит ли брать?"
          aria-label="Вопрос консультанту"
          maxLength={200}
        />
        <button type="submit" disabled={busy || !text.trim()}>
          Спросить
        </button>
      </form>
    </section>
  )
}
