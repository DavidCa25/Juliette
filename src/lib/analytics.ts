/**
 * Analítica propia de Julietté (se guarda en tu base de datos Neon, no en terceros).
 * Solo funciona si la persona aceptó las cookies de analítica. Los eventos se envían en lotes
 * para no saturar el servidor durante campañas grandes.
 */
import { readJSON } from './format'

export type EventType =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'design_start'
  | 'design_step'
  | 'design_complete'
  | 'checkout_start'
  | 'order_submitted'
  | 'whatsapp_click'
  | 'video_play'

type Queued = { t: EventType; p: string; r?: string; u?: Record<string, string>; d?: Record<string, unknown> }

const queue: Queued[] = []
let timer: number | null = null

function allowed() {
  return readJSON<{ analytics?: boolean }>('jl-consent-v1', {}).analytics === true
}

function id(store: Storage | undefined, key: string) {
  try {
    if (!store) return ''
    let v = store.getItem(key)
    if (!v) {
      v = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
      store.setItem(key, v)
    }
    return v
  } catch {
    return ''
  }
}

export const visitorId = () => (allowed() ? id(globalThis.localStorage, 'jl-vid') : '')
const sessionId = () => id(globalThis.sessionStorage, 'jl-sid')

/** Campaña de origen (utm_*) de la visita actual; se guarda por sesión. */
export function campaign(): Record<string, string> | undefined {
  try {
    const saved = sessionStorage.getItem('jl-utm')
    if (saved) return JSON.parse(saved)
    const p = new URLSearchParams(location.search)
    const u: Record<string, string> = {}
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
      const v = p.get(k)
      if (v) u[k.replace('utm_', '')] = v.slice(0, 80)
    }
    if (Object.keys(u).length) {
      sessionStorage.setItem('jl-utm', JSON.stringify(u))
      return u
    }
  } catch {
    /* sin almacenamiento */
  }
  return undefined
}

function flush() {
  timer = null
  if (!queue.length || !allowed()) {
    queue.length = 0
    return
  }
  const payload = JSON.stringify({ v: visitorId(), s: sessionId(), events: queue.splice(0, 50) })
  const blob = new Blob([payload], { type: 'application/json' })
  if (!(navigator.sendBeacon && navigator.sendBeacon('/api/track', blob))) {
    fetch('/api/track', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
  }
  if (queue.length) timer = window.setTimeout(flush, 1000)
}

export function track(t: EventType, d?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !allowed()) return
  const first = !sessionStorage.getItem('jl-ref')
  let r: string | undefined
  if (first) {
    try {
      r = document.referrer && !document.referrer.startsWith(location.origin) ? new URL(document.referrer).hostname : 'directo'
      sessionStorage.setItem('jl-ref', r)
    } catch {
      /* ignorar */
    }
  }
  queue.push({ t, p: location.pathname, r, u: first ? campaign() : undefined, d })
  if (queue.length >= 20) flush()
  else if (timer === null) timer = window.setTimeout(flush, 4000)
}

if (typeof window !== 'undefined') {
  addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush())
}
