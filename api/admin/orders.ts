import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth.js'
import { hasDb, q } from '../_lib/db.js'
import { reportServer } from '../_lib/monitor.js'
import { sendStatusEmail } from '../_lib/email.js'

/**
 * GET   → pedidos (filtros: status, q, limit).
 * PATCH → cambia estado, estado de pago o notas de un pedido.
 */
export const STATUSES = ['nuevo', 'confirmado', 'en-proceso', 'enviado', 'entregado', 'cancelado']
const PAYMENT = ['pendiente', 'anticipo', 'pagado', 'reembolsado']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  const session = await requireAdmin(req, res)
  if (!session) return
  if (!hasDb()) return res.status(503).json({ error: 'Conecta la base de datos (Neon) para ver pedidos.' })

  try {
    if (req.method === 'GET') {
      const status = typeof req.query.status === 'string' && STATUSES.includes(req.query.status) ? req.query.status : null
      const term = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 80) : ''
      const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 100))
      const rows = await q(
        `SELECT id, created_at, updated_at, status, payment_status, customer_name, phone, email, delivery, address, payment, gift, items, subtotal, total, currency, source, notes
         FROM orders
         WHERE ($1::text IS NULL OR status = $1)
           AND ($2 = '' OR id ILIKE '%' || $2 || '%' OR customer_name ILIKE '%' || $2 || '%' OR email ILIKE '%' || $2 || '%' OR phone ILIKE '%' || $2 || '%')
         ORDER BY created_at DESC
         LIMIT $3`,
        [status, term, limit],
      )
      const counts = await q<{ status: string; n: number }>(`SELECT status, count(*)::int AS n FROM orders GROUP BY status`)
      return res.status(200).json({ orders: rows, counts })
    }

    if (req.method === 'PATCH') {
      const b = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as { id?: string; status?: string; payment_status?: string; notes?: string; notify?: boolean }
      if (!b?.id) return res.status(400).json({ error: 'Falta el número de pedido.' })
      const before = await q<{ status: string; customer_name: string; email: string }>(`SELECT status, customer_name, email FROM orders WHERE id = $1`, [b.id])
      if (!before.length) return res.status(404).json({ error: 'Pedido no encontrado.' })
      const status = b.status && STATUSES.includes(b.status) ? b.status : null
      const pay = b.payment_status && PAYMENT.includes(b.payment_status) ? b.payment_status : null
      const notes = typeof b.notes === 'string' ? b.notes.slice(0, 2000) : null
      const rows = await q(
        `UPDATE orders SET
           status = COALESCE($2, status),
           payment_status = COALESCE($3, payment_status),
           notes = COALESCE($4, notes),
           updated_at = now()
         WHERE id = $1
         RETURNING id, status, payment_status, notes, updated_at`,
        [b.id, status, pay, notes],
      )
      if (!rows.length) return res.status(404).json({ error: 'Pedido no encontrado.' })
      let emailed = false
      if (status && status !== before[0].status && b.notify !== false) {
        emailed = await sendStatusEmail({ id: b.id, customer_name: before[0].customer_name, email: before[0].email }, status)
      }
      return res.status(200).json({ order: rows[0], emailed })
    }

    res.setHeader('Allow', 'GET, PATCH')
    return res.status(405).json({ error: 'Método no permitido.' })
  } catch (e) {
    await reportServer(e, { route: 'admin/orders', method: req.method })
    return res.status(500).json({ error: (e as Error).message })
  }
}
