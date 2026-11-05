import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// При переходе на другую страницу возвращаем прокрутку наверх.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
