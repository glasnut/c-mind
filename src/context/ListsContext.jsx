import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useStoredState } from '../hooks/useStoredState.js'
import { useAuth } from './AuthContext.jsx'

// Списки «Избранное» и «Сравнение»: общие для всех страниц и сохраняются в браузере.
// В списках хранятся только id товаров — актуальные данные берутся из productsService.

export const COMPARE_LIMIT = 4

const ListsContext = createContext(null)

export function ListsProvider({ children, getProduct }) {
  const { scope, logAction } = useAuth()
  const [favorites, setFavorites] = useStoredState(scope('favorites'), [])
  const [compare, setCompare] = useStoredState(scope('compare'), [])
  const [notice, setNotice] = useState('')

  // Подсказка в панели сравнения исчезает сама
  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  const toggleFavorite = useCallback(
    (id) => {
      const name = getProduct(id)?.name ?? id
      if (favorites.includes(id)) {
        setFavorites(favorites.filter((x) => x !== id))
        logAction('favorite', `Убрано из избранного: ${name}`, `/product/${id}`)
      } else {
        setFavorites([...favorites, id])
        logAction('favorite', `Добавлено в избранное: ${name}`, `/product/${id}`)
      }
    },
    [favorites, getProduct, logAction, setFavorites],
  )

  const removeFromCompare = useCallback(
    (id) => setCompare((list) => list.filter((x) => x !== id)),
    [setCompare],
  )

  // Заменяет список целиком (например, кнопка-пример на странице сравнения)
  const replaceCompare = useCallback(
    (ids) => {
      setCompare(ids.slice(0, COMPARE_LIMIT))
      setNotice('')
    },
    [setCompare],
  )

  const clearCompare = useCallback(() => {
    setCompare([])
    setNotice('')
  }, [setCompare])

  const toggleCompare = useCallback(
    (id) => {
      if (compare.includes(id)) {
        removeFromCompare(id)
        return
      }
      const product = getProduct(id)
      const first = compare.length ? getProduct(compare[0]) : null
      if (first && product && first.category !== product.category) {
        setNotice('Сравнивать можно комплектующие одной категории. Очистите список, чтобы начать заново.')
        return
      }
      if (compare.length >= COMPARE_LIMIT) {
        setNotice(`В сравнение можно добавить не больше ${COMPARE_LIMIT} товаров.`)
        return
      }
      setCompare([...compare, id])
    },
    [compare, getProduct, removeFromCompare, setCompare],
  )

  const value = useMemo(
    () => ({
      favorites,
      compare,
      notice,
      isFavorite: (id) => favorites.includes(id),
      inCompare: (id) => compare.includes(id),
      toggleFavorite,
      toggleCompare,
      removeFromCompare,
      replaceCompare,
      clearCompare,
    }),
    [favorites, compare, notice, toggleFavorite, toggleCompare, removeFromCompare, replaceCompare, clearCompare],
  )

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>
}

export function useLists() {
  const ctx = useContext(ListsContext)
  if (!ctx) throw new Error('useLists нужно вызывать внутри <ListsProvider>')
  return ctx
}
