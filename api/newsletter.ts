import type { VercelRequest, VercelResponse } from '@vercel/node'
import { hasDb, q } from './_lib/db.js'
import { reportServer } from './_lib/monitor.js'
import { addContact, sendWelcome } from './_lib/newsletter.js'

/**
 * Suscripción al newsletter desde el sitio. Guarda el correo en Neon (con fecha de consentimiento),
 * lo agrega a los contactos de Resend y manda la bienvenida. Si ya estaba suscrito, responde igual de bien.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido.' })
  }
  const b = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}) as Record<string, unknown>
  // Campo oculto contra bots
  if (typeof b.website === 'string' && b.website.trim()) return res.status(200).json({ ok: true })
  const email = String(b.email ?? '').trim().toLowerCase().slice(0, 160)
  if (!EMAIL.test(email)) return res.status(400).json({ error: 'Revisa tu correo.' })
  const source = String(b.source ?? 'sitio').slice(0, 60)
  const country = String(req.headers['x-vercel-ip-country'] ?? '').slice(0, 4) || null

  let isNew = true
  if (hasDb()) {
    try {
      const rows = await q<{ email: string }>(
        `INSERT INTO subscribers (email, source, country) VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET status = 'activo' WHERE subscribers.status <> 'activo'
         RETURNING email`,
        [email, source, country],
      )
      isNew = rows.length > 0
    } catch (e) {
      await reportServer(e, { route: 'newsletter' })
    }
  }
  if (isNew) {
    const id = await addContact(email)
    if (id && hasDb()) await q(`UPDATE subscribers SET resend_id = $2 WHERE email = $1`, [email, id]).catch(() => undefined)
    await sendWelcome(email)
  }
  return res.status(200).json({ ok: true, already: !isNew })
}
