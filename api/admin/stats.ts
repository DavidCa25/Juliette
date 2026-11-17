import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth.js'
import { hasDb, q } from '../_lib/db.js'
import { reportServer } from '../_lib/monitor.js'

/** Resumen del negocio: visitas, embudo, piezas más vistas, origen del tráfico, pedidos y clientes. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  const session = await requireAdmin(req, res)
  if (!session) return
  if (!hasDb()) return res.status(503).json({ error: 'Conecta la base de datos (Neon) para ver estadísticas.' })

  const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30
  const since = `now() - interval '${days} days'`

  try {
    const [totals, daily, funnel, products, sources, devices, orders, customers] = await Promise.all([
      q<{ visitors: number; sessions: number; views: number }>(
        `SELECT count(DISTINCT visitor_id)::int AS visitors, count(DISTINCT session_id)::int AS sessions, count(*) FILTER (WHERE type = 'page_view')::int AS views FROM events WHERE ts > ${since}`,
      ),
      q<{ day: string; visitors: number; views: number }>(
        `SELECT to_char(date_trunc('day', ts AT TIME ZONE 'America/Mexico_City'), 'YYYY-MM-DD') AS day,
                count(DISTINCT visitor_id)::int AS visitors, count(*) FILTER (WHERE type = 'page_view')::int AS views
         FROM events WHERE ts > ${since} GROUP BY 1 ORDER BY 1`,
      ),
      q<{ type: string; sessions: number }>(`SELECT type, count(DISTINCT session_id)::int AS sessions FROM events WHERE ts > ${since} GROUP BY type`),
      q<{ slug: string; views: number; adds: number }>(
        `SELECT data->>'slug' AS slug,
                count(*) FILTER (WHERE type = 'product_view')::int AS views,
                count(*) FILTER (WHERE type = 'add_to_cart')::int AS adds
         FROM events WHERE ts > ${since} AND type IN ('product_view','add_to_cart') AND data ? 'slug'
         GROUP BY 1 ORDER BY views DESC LIMIT 10`,
      ),
      q<{ source: string; sessions: number }>(
        `SELECT COALESCE(utm->>'source', referrer, 'directo') AS source, count(DISTINCT session_id)::int AS sessions
         FROM events WHERE ts > ${since} AND (referrer IS NOT NULL OR utm IS NOT NULL) GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
      ),
      q<{ device: string; sessions: number }>(`SELECT device, count(DISTINCT session_id)::int AS sessions FROM events WHERE ts > ${since} GROUP BY 1 ORDER BY 2 DESC`),
      q<{ orders: number; revenue: number | null; pending: number }>(
        `SELECT count(*)::int AS orders,
                sum(total) FILTER (WHERE status <> 'cancelado')::int AS revenue,
                count(*) FILTER (WHERE status = 'nuevo')::int AS pending
         FROM orders WHERE created_at > ${since}`,
      ),
      q<{ name: string; email: string; phone: string; orders: number; spent: number | null; last: string }>(
        `SELECT max(customer_name) AS name, lower(email) AS email, max(phone) AS phone, count(*)::int AS orders,
                sum(total) FILTER (WHERE status <> 'cancelado')::int AS spent, max(created_at) AS last
         FROM orders GROUP BY lower(email) ORDER BY max(created_at) DESC LIMIT 200`,
      ),
    ])
    return res.status(200).json({ days, totals: totals[0], daily, funnel, products, sources, devices, orders: orders[0], customers })
  } catch (e) {
    await reportServer(e, { route: 'admin/stats' })
    return res.status(500).json({ error: (e as Error).message })
  }
}
