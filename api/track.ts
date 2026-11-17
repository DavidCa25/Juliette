import type { VercelRequest, VercelResponse } from '@vercel/node'
import { hasDb, q } from './_lib/db.js'
import { reportServer } from './_lib/monitor.js'

/**
 * Recibe eventos de analítica propia en lotes (solo de visitantes que aceptaron cookies de analítica).
 * Guarda una fila por evento; los datos personales no se registran.
 */
const TYPES = new Set(['page_view', 'product_view', 'add_to_cart', 'design_start', 'design_step', 'design_complete', 'checkout_start', 'order_submitted', 'whatsapp_click', 'video_play'])
const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : null)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).end()
  if (!hasDb()) return res.status(204).end()

  let body: unknown = req.body
  try {
    if (typeof body === 'string') body = JSON.parse(body)
  } catch {
    return res.status(400).end()
  }
  const b = body as { v?: unknown; s?: unknown; events?: unknown[] }
  const events = Array.isArray(b?.events) ? b.events.slice(0, 50) : []
  const visitor = str(b.v, 64)
  const session = str(b.s, 64)
  const ua = String(req.headers['user-agent'] ?? '')
  if (/bot|crawler|spider|headless|lighthouse/i.test(ua)) return res.status(204).end()
  const device = /Mobi|Android|iPhone/i.test(ua) ? 'movil' : /iPad|Tablet/i.test(ua) ? 'tableta' : 'escritorio'
  const country = str(req.headers['x-vercel-ip-country'], 4)

  const rows = events
    .map((e) => e as Record<string, unknown>)
    .filter((e) => TYPES.has(String(e.t)))
    .map((e) => [
      String(e.t),
      str(e.p, 300),
      visitor,
      session,
      str(e.r, 300),
      e.u && typeof e.u === 'object' ? JSON.stringify(e.u).slice(0, 500) : null,
      device,
      country,
      e.d && typeof e.d === 'object' ? JSON.stringify(e.d).slice(0, 1000) : null,
    ])
  if (rows.length === 0) return res.status(204).end()

  const values = rows.map((_, i) => `($${i * 9 + 1},$${i * 9 + 2},$${i * 9 + 3},$${i * 9 + 4},$${i * 9 + 5},$${i * 9 + 6},$${i * 9 + 7},$${i * 9 + 8},$${i * 9 + 9})`).join(',')
  try {
    await q(`INSERT INTO events (type, path, visitor_id, session_id, referrer, utm, device, country, data) VALUES ${values}`, rows.flat())
  } catch (e) {
    // La analítica nunca debe romper la tienda; se reporta una muestra para no saturar Sentry
    if (Math.random() < 0.05) await reportServer(e, { route: 'track', events: rows.length })
  }
  return res.status(204).end()
}
