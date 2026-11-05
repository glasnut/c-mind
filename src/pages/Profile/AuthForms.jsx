import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

// Вход и регистрация. Ошибки показываются под формой; пока идёт хеширование, кнопка заблокирована.
export default function AuthForms() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [fields, setFields] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }))
  const isLogin = mode === 'login'

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await (isLogin ? login(fields) : register(fields))
    } catch (err) {
      setError(err.message || 'Не удалось выполнить действие.')
      setBusy(false)
    }
  }

  return (
    <section className="auth" aria-labelledby="auth-title">
      <div className="auth__tabs" role="tablist">
        {[
          ['login', 'Вход'],
          ['register', 'Регистрация'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            className={mode === id ? 'is-active' : ''}
            onClick={() => {
              setMode(id)
              setError('')
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <h1 id="auth-title">{isLogin ? 'Войдите в аккаунт' : 'Создайте аккаунт'}</h1>

      <form onSubmit={submit} noValidate>
        {!isLogin && (
          <label>
            <span>Имя</span>
            <input type="text" value={fields.name} onChange={set('name')} autoComplete="name" required />
          </label>
        )}
        <label>
          <span>Email</span>
          <input type="email" value={fields.email} onChange={set('email')} autoComplete="email" required />
        </label>
        <label>
          <span>Пароль</span>
          <input
            type="password"
            value={fields.password}
            onChange={set('password')}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
          />
          {!isLogin && <small>Не короче 8 символов, буквы и цифры.</small>}
        </label>
        {error && (
          <p className="auth__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="auth__submit" disabled={busy}>
          {busy ? 'Подождите…' : isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className="auth__note">
        Это демо-версия: аккаунт хранится только в вашем браузере, на этом устройстве. Пароль не сохраняется в открытом
        виде — только его хеш с солью. Без входа избранное, сравнение и сборки тоже сохраняются в браузере; при
        регистрации они переносятся в аккаунт.
      </p>
    </section>
  )
}
