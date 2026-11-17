import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'node:crypto'
import { hasDb, q } from './_lib/db.js'
import { catalog } from './_lib/catalog.js'
import { reportServer } from './_lib/monitor.js'
import { sendOrderEmails } from './_lib/email.js'

/**
 * Registra un pedido desde el checkout. Los precios se recalculan con el catálogo publicado.
 * Responde con el número de pedido. Si no hay base de datos configurada, responde 503 y
 * el sitio continúa el pedido por WhatsApp.
 */
const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function newId() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `JLT-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido.' })
  }
  if (!hasDb()) return res.status(503).json({ error: 'Pedidos en línea no disponibles.' })

  const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})
  if (raw.length > 60_000) return res.status(413).json({ error: 'Pedido demasiado grande.' })
  const b = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Record<string, unknown>

  // Campo trampa para bots: las personas no lo ven ni lo llenan
  if (str(b.website)) return res.status(200).json({ id: newId() })

  const customer = (b.customer ?? {}) as Record<string, unknown>
  const name = str(customer.name, 120)
  const phone = str(customer.phone, 30)
  const email = str(customer.email, 160).toLowerCase()
  if (name.length < 2 || phone.replace(/\D/g, '').length < 10 || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Revisa tu nombre, teléfono y correo.' })
  }
  const delivery = b.delivery === 'local' ? 'local' : 'envio'
  const payment = ['transferencia', 'enlace', 'efectivo'].includes(String(b.payment)) ? String(b.payment) : 'transferencia'
  const addr = (b.address ?? null) as Record<string, unknown> | null
  const address = delivery === 'envio' && addr ? { street: str(addr.street), city: str(addr.city, 80), zip: str(addr.zip, 10), references: str(addr.references) } : null

  const cat = catalog()
  const rawItems = Array.isArray(b.items) ? b.items.slice(0, 30) : []
  if (rawItems.length === 0) return res.status(400).json({ error: 'El carrito está vacío.' })
  const items = rawItems.map((it) => {
    const i = it as Record<string, unknown>
    const qty = Math.max(1, Math.min(10, Number(i.qty) || 1))
    if (i.kind === 'product') {
      const slug = str(i.slug, 80)
      const p = cat.get(slug)
      const optionId = str(i.optionId, 20)
      const unitPrice = p && p.price !== null && optionId === 'sin' ? p.price : null
      return { kind: 'product', slug, name: p?.name ?? str(i.name, 80), optionId, optionLabel: str(i.optionLabel, 80), idea: str(i.idea, 400) || null, qty, unitPrice }
    }
    return { kind: 'custom', name: str(i.name, 80) || 'Pieza a medida', design: i.design && typeof i.design === 'object' ? i.design : null, qty, unitPrice: null }
  })
  const subtotal = items.every((i) => i.unitPrice !== null) ? items.reduce((n, i) => n + (i.unitPrice ?? 0) * i.qty, 0) : null

  const id = newId()
  try {
    await q(
      `INSERT INTO orders (id, customer_name, phone, email, delivery, address, payment, gift, items, subtotal, total, visitor_id, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        id,
        name,
        phone,
        email,
        delivery,
        address ? JSON.stringify(address) : null,
        payment,
        str(b.gift, 240) || null,
        JSON.stringify(items),
        subtotal,
        subtotal,
        str(b.visitorId, 64) || null,
        b.source && typeof b.source === 'object' ? JSON.stringify(b.source).slice(0, 2000) : null,
      ],
    )
  } catch (e) {
    await reportServer(e, { route: 'orders' })
    return res.status(500).json({ error: 'No se pudo registrar el pedido.' })
  }
  // Los correos no deben impedir que el pedido quede registrado
  await sendOrderEmails({ id, customer_name: name, email, phone, delivery, address, payment, gift: str(b.gift, 240) || null, items, total: subtotal })
  return res.status(201).json({ id, subtotal })
}
