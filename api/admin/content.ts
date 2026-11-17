import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth.js'
import { publishContent, readContent } from '../_lib/github.js'
import { cleanProduct, cleanSettings } from '../_lib/validate.js'
import { reportServer } from '../_lib/monitor.js'

/**
 * GET  → contenido actual (ajustes y productos) leído del repositorio.
 * POST → publica todos los cambios en un solo commit; Vercel actualiza el sitio en 1–2 minutos.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  const session = await requireAdmin(req, res)
  if (!session) return

  try {
    if (req.method === 'GET') {
      return res.status(200).json(await readContent())
    }
    if (req.method === 'POST') {
      const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as { settings?: Record<string, unknown>; products?: Record<string, unknown>[] }
      if (!body || !body.settings || !Array.isArray(body.products)) return res.status(400).json({ error: 'Faltan datos para publicar.' })
      if (body.products.length > 300) return res.status(400).json({ error: 'Demasiados productos en una sola publicación.' })
      const products = body.products.map(cleanProduct)
      const slugs = new Set<string>()
      for (const p of products) {
        if (slugs.has(p.slug)) return res.status(400).json({ error: `Hay dos productos con el nombre "${p.name}". Cambia uno de ellos.` })
        slugs.add(p.slug)
      }
      const result = await publishContent({ settings: cleanSettings(body.settings), products }, { name: session.user.name, email: session.user.email })
      return res.status(200).json({ ok: true, ...result })
    }
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Método no permitido.' })
  } catch (e) {
    await reportServer(e, { route: 'admin/content', method: req.method })
    return res.status(500).json({ error: (e as Error).message || 'No se pudo completar la operación.' })
  }
}
