import { site } from '../config/site'

const fmt = new Intl.NumberFormat(site.locale, { style: 'currency', currency: site.currency, maximumFractionDigits: 0 })

/** Formatea un precio; null se muestra como pendiente. */
export function money(value: number | null | undefined, pending = '[PRECIO]') {
  if (value === null || value === undefined) return pending
  return fmt.format(value)
}

export function orderId(date = new Date()) {
  const y = String(date.getFullYear()).slice(2)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `JLT-${y}${m}${d}-${rand}`
}

export function safeStorage() {
  try {
    const k = '__jl'
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    return window.localStorage
  } catch {
    return null
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  const s = safeStorage()
  if (!s) return fallback
  try {
    const raw = s.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown) {
  const s = safeStorage()
  if (!s) return
  try {
    s.setItem(key, JSON.stringify(value))
  } catch {
    /* almacenamiento lleno o bloqueado: se ignora */
  }
}
