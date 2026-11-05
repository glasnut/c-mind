import { useEffect } from 'react'

// Заголовок вкладки браузера: «Название — C-Mind».
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — C-Mind` : 'C-Mind — умный помощник по выбору комплектующих'
  }, [title])
}
