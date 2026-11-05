import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ProductCard from '../../components/ProductCard/ProductCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLists } from '../../context/ListsContext.jsx'
import { useStoredState } from '../../hooks/useStoredState.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { productsService } from '../../services/products/index.js'
import { PURPOSES, summarize } from '../../services/builder/index.js'
import { formatPrice, plural } from '../../utils/format.js'
import AuthForms from './AuthForms.jsx'
import './Profile.css'

const dateTime = (iso) => new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

function Dashboard() {
  const { user, scope, history, clearHistory, logout, deleteAccount } = useAuth()
  const { favorites, replaceCompare } = useLists()
  const navigate = useNavigate()
  const [comparisons, setComparisons] = useStoredState(scope('saved-comparisons'), [])
  const [builds, setBuilds] = useStoredState(scope('builds'), [])
  const [, setDraft] = useStoredState(scope('builder-draft'), {})
  const [, setPurpose] = useStoredState(scope('builder-purpose'), 'universal')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const favoriteProducts = favorites.map((id) => productsService.getById(id)).filter(Boolean)

  const openComparison = (c) => {
    replaceCompare(c.ids.filter((id) => productsService.getById(id)))
    navigate('/comparison')
  }
  const openBuild = (b) => {
    setDraft(Object.fromEntries(Object.entries(b.selection).filter(([, id]) => productsService.getById(id))))
    setPurpose(PURPOSES[b.purposeId] ? b.purposeId : 'universal')
    navigate('/builder')
  }

  return (
    <>
      <header className="prof__head">
        <div className="prof__avatar" aria-hidden="true">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1>{user.name}</h1>
          <p>
            {user.email} · с нами с {new Date(user.createdAt).toLocaleDateString('ru-RU')}
          </p>
        </div>
        <button type="button" className="prof__btn" onClick={logout}>
          Выйти
        </button>
      </header>

      <section className="prof__section" aria-labelledby="fav-title">
        <h2 id="fav-title">Избранное ({favoriteProducts.length})</h2>
        {favoriteProducts.length === 0 ? (
          <p className="prof__empty">
            Пока пусто. Добавляйте товары сердечком в <Link to="/catalog">каталоге</Link>.
          </p>
        ) : (
          <div className="prof__grid">
            {favoriteProducts.map((p) => (
              <ProductCard key={p.id} product={p} showActions />
            ))}
          </div>
        )}
      </section>

      <section className="prof__section" aria-labelledby="cmp-title">
        <h2 id="cmp-title">Сохранённые сравнения ({comparisons.length})</h2>
        {comparisons.length === 0 ? (
          <p className="prof__empty">
            Пока нет. Составьте сравнение на странице <Link to="/comparison">«Сравнение»</Link> и сохраните его.
          </p>
        ) : (
          <ul className="prof__list">
            {comparisons.map((c) => (
              <li key={c.id}>
                <div>
                  <h3>{c.name}</h3>
                  <p>
                    {c.ids.length} {plural(c.ids.length, ['товар', 'товара', 'товаров'])} · {dateTime(c.createdAt)}
                  </p>
                </div>
                <div className="prof__actions">
                  <button type="button" className="prof__btn prof__btn--primary" onClick={() => openComparison(c)}>
                    Открыть
                  </button>
                  <button type="button" className="prof__btn" onClick={() => setComparisons((l) => l.filter((x) => x.id !== c.id))} aria-label={`Удалить сравнение ${c.name}`}>
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="prof__section" aria-labelledby="bld-title">
        <h2 id="bld-title">Сохранённые сборки ({builds.length})</h2>
        {builds.length === 0 ? (
          <p className="prof__empty">
            Пока нет. Соберите ПК в <Link to="/builder">конфигураторе</Link> и сохраните сборку.
          </p>
        ) : (
          <ul className="prof__list">
            {builds.map((b) => {
              const s = summarize(b.selection, b.purposeId)
              return (
                <li key={b.id}>
                  <div>
                    <h3>{b.name}</h3>
                    <p>
                      {PURPOSES[b.purposeId]?.name ?? 'Универсальное'} · {s.chosen.length} {plural(s.chosen.length, ['деталь', 'детали', 'деталей'])} ·{' '}
                      {formatPrice(s.total)} (условно){s.compatibility.errors.length > 0 && ` · несовместимостей: ${s.compatibility.errors.length}`}
                    </p>
                  </div>
                  <div className="prof__actions">
                    <button type="button" className="prof__btn prof__btn--primary" onClick={() => openBuild(b)}>
                      Открыть
                    </button>
                    <button type="button" className="prof__btn" onClick={() => setBuilds((l) => l.filter((x) => x.id !== b.id))} aria-label={`Удалить сборку ${b.name}`}>
                      Удалить
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="prof__section" aria-labelledby="his-title">
        <div className="prof__row">
          <h2 id="his-title">История действий</h2>
          {history.length > 0 && (
            <button type="button" className="prof__btn" onClick={clearHistory}>
              Очистить историю
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="prof__empty">Здесь появятся ваши действия: избранное, анализ, сохранённые сравнения и сборки.</p>
        ) : (
          <ul className="prof__history">
            {history.map((h) => (
              <li key={h.id}>
                <time dateTime={h.at}>{dateTime(h.at)}</time>
                {h.link ? <Link to={h.link}>{h.text}</Link> : <span>{h.text}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="prof__section prof__danger">
        <h2>Удаление аккаунта</h2>
        <p className="prof__empty">Аккаунт и все его данные (избранное, сравнения, сборки, история) будут удалены из этого браузера безвозвратно.</p>
        {confirmDelete ? (
          <div className="prof__actions">
            <button type="button" className="prof__btn prof__btn--danger" onClick={deleteAccount}>
              Да, удалить навсегда
            </button>
            <button type="button" className="prof__btn" onClick={() => setConfirmDelete(false)}>
              Отмена
            </button>
          </div>
        ) : (
          <button type="button" className="prof__btn" onClick={() => setConfirmDelete(true)}>
            Удалить аккаунт
          </button>
        )}
      </section>
    </>
  )
}

export default function Profile() {
  useDocumentTitle('Личный кабинет')
  const { user } = useAuth()
  return <main className="container prof">{user ? <Dashboard /> : <AuthForms />}</main>
}
