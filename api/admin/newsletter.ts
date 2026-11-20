import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth.js'
import { hasDb, q } from '../_lib/db.js'
import { reportServer } from '../_lib/monitor.js'
import { ownerEmails, send } from '../_lib/email.js'
import { broadcastHtml, newsletterReady, sendBroadcast, type BroadcastInput } from '../_lib/newsletter.js'

/**
 * GET  → lista de suscriptores y estado de la configuración.
 * POST → { action: 'preview' | 'test' | 'send', ...boletín }
 */
const TEMPLATES = ['lanzamiento', 'promocion', 'temporada']
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function cleanBroadcast(b: Record<string, unknown>): BroadcastInput {
  const template = TEMPLATES.includes(String(b.template)) ? (b.template as BroadcastInput['template']) : 'lanzamiento'
  const subject = str(b.subject, 140)
  const title = str(b.title, 120)
  const body = str(b.body, 4000)
  if (!subject || !title || !body) throw new Error('Escribe el asunto, el título y el texto del boletín.')
  return { template, subject, title, body, image: str(b.image, 500) || null, ctaLabel: str(b.ctaLabel, 40) || null, ctaUrl: str(b.ctaUrl, 500) || null, note: str(b.note, 300) || null }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  const session = await requireAdmin(req, res)
  if (!session) return

  if (req.method === 'GET') {
    if (!hasDb()) return res.status(200).json({ subscribers: [], total: 0, ready: newsletterReady() })
    const rows = await q(`SELECT email, created_at, source, country, status FROM subscribers ORDER BY created_at DESC LIMIT 5000`)
    const total = rows.filter((r) => (r as { status: string }).status === 'activo').length
    return res.status(200).json({ subscribers: rows, total, ready: newsletterReady() })
  }

  if (req.method === 'POST') {
    const b = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}) as Record<string, unknown>
    try {
      const input = cleanBroadcast(b)
      if (b.action === 'preview') return res.status(200).json({ html: broadcastHtml(input, { unsubscribe: false }) })
      if (b.action === 'test') {
        const to = [session.user.email, ...ownerEmails()].filter((v, i, a) => v && a.indexOf(v) === i)
        const ok = await send({ to, subject: `[Prueba] ${input.subject}`, html: broadcastHtml(input, { unsubscribe: false }) }, 'newsletter/test')
        return ok ? res.status(200).json({ ok: true, to }) : res.status(500).json({ error: 'No se pudo enviar la prueba. Revisa Resend.' })
      }
      if (b.action === 'send') {
        const id = await sendBroadcast(input)
        return res.status(200).json({ ok: true, id })
      }
      return res.status(400).json({ error: 'Acción no válida.' })
    } catch (e) {
      if (!(e instanceof Error && /^Escribe/.test(e.message))) await reportServer(e, { route: 'admin/newsletter' })
      return res.status(400).json({ error: e instanceof Error ? e.message : 'Error al preparar el boletín.' })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Método no permitido.' })
}
