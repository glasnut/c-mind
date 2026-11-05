// Учётные записи (демо-версия).
//
// КАК ЭТО РАБОТАЕТ. Настоящей серверной части пока нет, поэтому аккаунты хранятся в браузере
// (localStorage). Это значит: аккаунт существует только на этом устройстве и в этом браузере.
// Пароль НИКОГДА не хранится в открытом виде: при регистрации к нему добавляется случайная «соль»,
// и из пары «пароль + соль» алгоритмом PBKDF2 (SHA-256, 210 000 повторов) получается хеш.
// Хеш нельзя «развернуть» обратно в пароль, при входе мы считаем хеш заново и сравниваем.
//
// КОГДА ПОДКЛЮЧИМ СЕРВЕР: функции register/login/logout останутся с теми же именами, но внутри
// будут отправлять запросы на сервер, где пароли хешируются (bcrypt/argon2), а вход держится
// на защищённой cookie. Интерфейс менять не придётся.

import { storage } from '../storage/index.js'

const ITERATIONS = 210_000
const MAX_FAILS = 5
const LOCK_MS = 30_000

const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes))
const fromBase64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0))

async function hashPassword(password, salt, iterations = ITERATIONS) {
  if (!globalThis.crypto?.subtle) {
    throw new AuthError('Браузер не поддерживает безопасное хеширование. Откройте сайт по https или на localhost.')
  }
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
  return toBase64(new Uint8Array(bits))
}

// Сравнение за одинаковое время, чтобы по скорости ответа нельзя было угадывать хеш
function sameHash(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export class AuthError extends Error {}

const users = () => storage.get('users', [])
const publicUser = ({ id, name, email, createdAt }) => ({ id, name, email, createdAt })
const normalizeEmail = (email) => email.trim().toLowerCase()

export function validateRegistration({ name, email, password }) {
  if (name.trim().length < 2) return 'Введите имя (не короче 2 символов).'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return 'Введите корректный email.'
  if (password.length < 8) return 'Пароль должен быть не короче 8 символов.'
  if (!/[A-Za-zА-Яа-яЁё]/.test(password) || !/\d/.test(password)) return 'В пароле нужны и буквы, и цифры.'
  return null
}

export const authService = {
  getSession() {
    const id = storage.get('session', null)
    const user = users().find((u) => u.id === id)
    return user ? publicUser(user) : null
  },

  async register({ name, email, password }) {
    const problem = validateRegistration({ name, email, password })
    if (problem) throw new AuthError(problem)
    const list = users()
    if (list.some((u) => u.email === normalizeEmail(email))) throw new AuthError('Аккаунт с таким email уже есть. Войдите.')

    const salt = crypto.getRandomValues(new Uint8Array(16))
    const user = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizeEmail(email),
      salt: toBase64(salt),
      iterations: ITERATIONS,
      hash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    }
    storage.set('users', [...list, user])
    storage.set('session', user.id)
    return publicUser(user)
  },

  async login({ email, password }) {
    const locks = storage.get('login-locks', {})
    const key = normalizeEmail(email)
    const lock = locks[key]
    if (lock?.until > Date.now()) {
      throw new AuthError(`Слишком много неудачных попыток. Подождите ${Math.ceil((lock.until - Date.now()) / 1000)} с.`)
    }

    const user = users().find((u) => u.email === key)
    // Одно и то же сообщение для «нет такого email» и «неверный пароль» — не подсказываем, какие email зарегистрированы
    const fail = () => {
      const fails = (lock?.fails ?? 0) + 1
      storage.set('login-locks', { ...locks, [key]: fails >= MAX_FAILS ? { fails: 0, until: Date.now() + LOCK_MS } : { fails, until: 0 } })
      throw new AuthError('Неверный email или пароль.')
    }
    if (!user) {
      await hashPassword(password, new Uint8Array(16)) // одинаковое время ответа
      return fail()
    }
    const hash = await hashPassword(password, fromBase64(user.salt), user.iterations)
    if (!sameHash(hash, user.hash)) return fail()

    const { [key]: _removed, ...rest } = locks
    storage.set('login-locks', rest)
    storage.set('session', user.id)
    return publicUser(user)
  },

  logout() {
    storage.remove('session')
  },

  // Удаляет аккаунт и все его данные
  deleteAccount(userId, dataKeys) {
    storage.set('users', users().filter((u) => u.id !== userId))
    dataKeys.forEach((k) => storage.remove(`u.${userId}.${k}`))
    storage.remove('session')
  },
}
