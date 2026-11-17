import { Resend } from 'resend'
import { reportServer } from './monitor.js'

/**
 * Correos transaccionales con Resend: aviso de pedido nuevo a la dueña,
 * confirmación al cliente y avisos cuando cambia el estado del pedido.
 * Si RESEND_API_KEY no está configurada, no se envía nada y la tienda sigue funcionando.
 */

export type MailItem = { name: string; qty: number; unitPrice: number | null; optionLabel?: string; idea?: string | null; kind?: string }
export type MailOrder = {
  id: string
  customer_name: string
  email: string
  phone: string
  delivery: string
  address: { street?: string; city?: string; zip?: string; references?: string } | null
  payment: string
  gift?: string | null
  items: MailItem[]
  total: number | null
}

const BURGUNDY = '#82001a'
const CREAM = '#fdf6ee'
const ROSE = '#fad9cd'

const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const money = (n: number | null) => (n === null ? 'Por confirmar' : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n))
const siteUrl = () => (process.env.VITE_SITE_URL || process.env.BETTER_AUTH_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')).replace(/\/$/, '')
const payLabel: Record<string, string> = { transferencia: 'Transferencia bancaria', enlace: 'Tarjeta con enlace de pago', efectivo: 'Efectivo al recoger' }

function layout(title: string, intro: string, body: string) {
  const url = siteUrl()
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:${CREAM};font-family:Montserrat,Helvetica,Arial,sans-serif;color:${BURGUNDY}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 0 24px">
  ${url ? `<img src="${url}/media/isotipo_burdeos_sm.png" width="34" height="44" alt="" style="vertical-align:middle;border:0">` : ''}
  <span style="font-weight:700;font-size:20px;letter-spacing:1px;vertical-align:middle;padding-left:10px">JULIETTÉ</span>
</td></tr>
<tr><td style="border-top:1px solid ${BURGUNDY};padding:28px 0 8px">
  <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:34px;line-height:1.1">${title}</h1>
  <p style="margin:0;font-size:15px;line-height:1.7">${intro}</p>
</td></tr>
<tr><td style="padding:16px 0">${body}</td></tr>
<tr><td style="border-top:1px solid ${BURGUNDY};padding:20px 0 0;font-size:12px;line-height:1.7">
  Con cariño, Julietté · <em>Romance hecho arte.</em>${url ? `<br><a href="${url}" style="color:${BURGUNDY}">${esc(url.replace(/^https?:\/\//, ''))}</a>` : ''}
</td></tr>
</table></td></tr></table></body></html>`
}

function itemsTable(o: MailOrder) {
  const rows = o.items
    .map(
      (i) => `<tr>
  <td style="padding:12px 0;border-bottom:1px solid ${ROSE};font-size:14px;line-height:1.5"><strong>${i.qty} × ${esc(i.name)}</strong>${i.optionLabel ? `<br><span style="font-size:13px">${esc(i.optionLabel)}</span>` : ''}${i.idea ? `<br><span style="font-size:13px">“${esc(i.idea)}”</span>` : ''}${i.kind === 'custom' ? '<br><span style="font-size:13px">Pieza a medida · se cotiza con boceto</span>' : ''}</td>
  <td align="right" style="padding:12px 0;border-bottom:1px solid ${ROSE};font-size:14px;white-space:nowrap">${i.unitPrice === null ? 'Por cotizar' : money(i.unitPrice * i.qty)}</td>
</tr>`,
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
<tr><td style="padding:14px 0;font-size:15px"><strong>Subtotal</strong></td><td align="right" style="padding:14px 0;font-size:15px"><strong>${money(o.total)}</strong></td></tr></table>`
}

function deliveryText(o: MailOrder) {
  return o.delivery === 'envio' && o.address ? `Envío a ${esc(o.address.street)}, ${esc(o.address.city)}, CP ${esc(o.address.zip)}` : 'Recoger en persona'
}

function client() {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
}

const from = () => process.env.EMAIL_FROM || 'Julietté <onboarding@resend.dev>'
const ownerEmails = () =>
  (process.env.ORDER_NOTIFY_EMAIL || process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

async function send(msg: { to: string[]; subject: string; html: string; replyTo?: string }, route: string) {
  const r = client()
  if (!r || msg.to.length === 0) return false
  try {
    const { error } = await r.emails.send({ from: from(), to: msg.to, subject: msg.subject, html: msg.html, replyTo: msg.replyTo })
    if (error) throw new Error(`${error.name}: ${error.message}`)
    return true
  } catch (e) {
    await reportServer(e, { route })
    return false
  }
}

export async function sendOrderEmails(o: MailOrder) {
  const owner = ownerEmails()
  const admin = siteUrl() ? `${siteUrl()}/admin` : ''
  const ownerHtml = layout(
    `Pedido nuevo · ${esc(o.id)}`,
    `<strong>${esc(o.customer_name)}</strong> acaba de hacer un pedido.`,
    `${itemsTable(o)}
<p style="margin:16px 0 0;font-size:14px;line-height:1.8">
<strong>Contacto:</strong> ${esc(o.email)} · ${esc(o.phone)}<br>
<strong>Entrega:</strong> ${deliveryText(o)}<br>
<strong>Pago elegido:</strong> ${esc(payLabel[o.payment] ?? o.payment)}${o.gift ? `<br><strong>Nota de regalo:</strong> ${esc(o.gift)}` : ''}</p>
${admin ? `<p style="margin:24px 0 0"><a href="${admin}" style="display:inline-block;background:${BURGUNDY};color:${CREAM};text-decoration:none;font-weight:600;font-size:14px;padding:14px 26px;border-radius:999px">Ver en el panel</a></p>` : ''}`,
  )
  const customerHtml = layout(
    `Recibimos tu pedido, ${esc(o.customer_name.split(' ')[0])}`,
    `Tu número de pedido es <strong>${esc(o.id)}</strong>. Te escribiremos por WhatsApp para confirmar disponibilidad, envío y forma de pago. Si es una pieza personalizada, primero recibirás tu boceto.`,
    `${itemsTable(o)}
<p style="margin:16px 0 0;font-size:14px;line-height:1.8"><strong>Entrega:</strong> ${deliveryText(o)}<br><strong>Pago:</strong> ${esc(payLabel[o.payment] ?? o.payment)}</p>
<p style="margin:20px 0 0;font-size:13px;line-height:1.7">Todavía no se ha hecho ningún cobro. Si tienes dudas, responde a este correo.</p>`,
  )
  await Promise.allSettled([
    send({ to: owner, subject: `Pedido nuevo ${o.id} · ${o.customer_name}`, html: ownerHtml, replyTo: o.email }, 'email/owner'),
    send({ to: [o.email], subject: `Recibimos tu pedido ${o.id} · Julietté`, html: customerHtml, replyTo: owner[0] }, 'email/customer'),
  ])
}

const statusCopy: Record<string, { subject: string; title: string; text: string }> = {
  confirmado: { subject: 'Tu pedido está confirmado', title: 'Pedido confirmado', text: 'Confirmamos tu pedido. Pronto empezaremos a pintarlo.' },
  'en-proceso': { subject: 'Ya estamos pintando tu pieza', title: 'Tu pieza está en proceso', text: 'Tu pieza ya está en el taller. Cada trazo se hace a mano, así que le damos el tiempo que merece.' },
  enviado: { subject: 'Tu pedido va en camino', title: 'Va en camino', text: 'Tu pieza salió del taller con su tarjeta de bienvenida y su guía de cuidados.' },
  entregado: { subject: 'Tu pieza llegó', title: 'Entregado', text: 'Esperamos que tu pieza te acompañe en muchas historias. Si nos etiquetas en redes, nos encantará verla.' },
  cancelado: { subject: 'Tu pedido fue cancelado', title: 'Pedido cancelado', text: 'Tu pedido fue cancelado. Si no lo esperabas o tienes dudas, responde a este correo.' },
}

export async function sendStatusEmail(o: { id: string; customer_name: string; email: string }, status: string) {
  const c = statusCopy[status]
  if (!c) return false
  const html = layout(`${c.title}`, `Hola, ${esc(o.customer_name.split(' ')[0])}. ${c.text}`, `<p style="margin:0;font-size:14px">Pedido <strong>${esc(o.id)}</strong></p>`)
  return send({ to: [o.email], subject: `${c.subject} · ${o.id}`, html, replyTo: ownerEmails()[0] }, 'email/status')
}
