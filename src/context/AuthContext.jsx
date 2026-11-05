import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { authService } from '../services/auth/index.js'
import { storage } from '../services/storage/index.js'
import { useStoredState } from '../hooks/useStoredState.js'

// Текущий пользователь и его данные. У гостя данные лежат под обычными ключами,
// у вошедшего — под ключами вида `u.<id>.favorites`, поэтому у разных аккаунтов они не смешиваются.

// Всё, что принадлежит пользователю: нужно для переноса и удаления аккаунта
export const USER_DATA_KEYS = ['favorites', 'compare', 'builder-draft', 'builder-purpose', 'builds', 'saved-comparisons', 'history']
// При регистрации в новый аккаунт копируется то, что гость уже успел собрать
const MIGRATED_KEYS = ['favorites', 'compare', 'builder-draft', 'builder-purpose', 'builds']

const HISTORY_LIMIT = 50

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getSession())
  const scope = useCallback((key) => (user ? `u.${user.id}.${key}` : key), [user])
  const [history, setHistory] = useStoredState(scope('history'), [])

  // История ведётся только у вошедших пользователей
  const logAction = useCallback(
    (type, text, link) => {
      if (!user) return
      setHistory((list) => {
        const last = list[0]
        if (last && last.text === text && Date.now() - new Date(last.at).getTime() < 3000) return list
        return [{ id: crypto.randomUUID(), type, text, link, at: new Date().toISOString() }, ...list].slice(0, HISTORY_LIMIT)
      })
    },
    [user, setHistory],
  )

  const register = useCallback(async (fields) => {
    const created = await authService.register(fields)
    for (const key of MIGRATED_KEYS) {
      const value = storage.get(key, undefined)
      if (value !== undefined) storage.set(`u.${created.id}.${key}`, value)
    }
    setUser(created)
  }, [])

  const login = useCallback(async (fields) => setUser(await authService.login(fields)), [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const deleteAccount = useCallback(() => {
    if (!user) return
    authService.deleteAccount(user.id, USER_DATA_KEYS)
    setUser(null)
  }, [user])

  const value = useMemo(
    () => ({ user, scope, history, logAction, clearHistory: () => setHistory([]), register, login, logout, deleteAccount }),
    [user, scope, history, logAction, setHistory, register, login, logout, deleteAccount],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth нужно вызывать внутри <AuthProvider>')
  return ctx
}
