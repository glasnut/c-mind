import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useStoredState } from '../../hooks/useStoredState.js'

const MAX_SAVED = 20

// Сохранение текущего сравнения в личный кабинет (только для вошедших пользователей).
export default function SaveComparison({ products }) {
  const { user, scope, logAction } = useAuth()
  const [, setSaved] = useStoredState(scope('saved-comparisons'), [])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  if (!user) {
    return (
      <p className="cmp__save-note">
        <Link to="/profile">Войдите</Link>, чтобы сохранять сравнения в личном кабинете.
      </p>
    )
  }

  const save = (e) => {
    e.preventDefault()
    const title = name.trim() || products.map((p) => p.name).join(' vs ')
    setSaved((list) =>
      [{ id: `${Date.now()}`, name: title, ids: products.map((p) => p.id), createdAt: new Date().toISOString() }, ...list].slice(0, MAX_SAVED),
    )
    logAction('comparison', `Сохранено сравнение: ${title}`, '/profile')
    setName('')
    setMessage('Сравнение сохранено в личном кабинете.')
  }

  return (
    <form className="cmp__save" onSubmit={save}>
      <input
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          setMessage('')
        }}
        placeholder="Название сравнения (необязательно)"
        aria-label="Название сравнения"
        maxLength={80}
      />
      <button type="submit">Сохранить сравнение</button>
      {message && (
        <span className="cmp__save-ok" role="status">
          {message}
        </span>
      )}
    </form>
  )
}
