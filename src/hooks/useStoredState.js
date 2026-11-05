import { useCallback, useEffect, useState } from 'react'
import { storage } from '../services/storage/index.js'

// Как useState, но значение сохраняется в localStorage и восстанавливается при следующем визите.
// Если ключ поменялся (например, пользователь вошёл в аккаунт), подгружается значение нового ключа.
export function useStoredState(key, initialValue) {
  const [state, setState] = useState(() => ({ key, value: storage.get(key, initialValue) }))

  // Ключ сменился — читаем данные под новым ключом прямо во время отрисовки
  let current = state
  if (state.key !== key) {
    current = { key, value: storage.get(key, initialValue) }
    setState(current)
  }

  useEffect(() => {
    storage.set(state.key, state.value)
  }, [state])

  const setValue = useCallback(
    (updater) =>
      setState((prev) => {
        const base = prev.key === key ? prev : { key, value: storage.get(key, initialValue) }
        return { key, value: typeof updater === 'function' ? updater(base.value) : updater }
      }),
    // initialValue нужен только при смене ключа
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )

  return [current.value, setValue]
}
