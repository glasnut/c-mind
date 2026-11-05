// Обёртка над localStorage. Все чтения и записи защищены: в приватном режиме браузера
// или при заблокированном хранилище приложение продолжает работать, просто без сохранения.
// Позже эту реализацию можно заменить на запросы к серверу, не меняя остальной код.

const PREFIX = 'cmind:'

export const storage = {
  get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(PREFIX + key)
      return raw === null ? fallback : JSON.parse(raw)
    } catch {
      return fallback
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // хранилище недоступно — молча продолжаем работу без сохранения
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(PREFIX + key)
    } catch {
      // хранилище недоступно — удалять нечего
    }
  },
}
