import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../Icon/Icon.jsx'
import { productsService } from '../../services/products/index.js'
import './Search.css'

// Поиск по названию: подсказки появляются по мере ввода, Enter ведёт в каталог.
export default function Search() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const navigate = useNavigate()

  const results = productsService.search(query).slice(0, 5)

  // Закрываем список по клику вне поля и по Escape
  useEffect(() => {
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const submit = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setOpen(false)
    navigate(`/catalog?q=${encodeURIComponent(q)}`)
  }

  const pick = (id) => {
    setOpen(false)
    setQuery('')
    navigate(`/product/${id}`)
  }

  return (
    <div className="search" ref={rootRef}>
      <form className="search__form" role="search" onSubmit={submit}>
        <button type="submit" className="search__submit" aria-label="Найти">
          <Icon name="search" size={20} />
        </button>
        <input
          type="search"
          className="search__input"
          placeholder="Поиск комплектующих…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          aria-label="Поиск комплектующих"
        />
      </form>

      {open && query.trim() && (
        <ul className="search__list">
          {results.length > 0 ? (
            results.map((p) => (
              <li key={p.id}>
                <button type="button" className="search__item" onClick={() => pick(p.id)}>
                  <span>{p.name}</span>
                  <span className="search__hint">{p.brand}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="search__empty">Ничего не найдено</li>
          )}
        </ul>
      )}
    </div>
  )
}
