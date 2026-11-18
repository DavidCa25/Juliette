import { Resend } from 'resend'
import { reportServer } from './monitor.js'
import { filled, shopSettings } from './settings.js'

/**
 * Correos transaccionales con Resend: aviso de pedido nuevo a la dueña,
 * confirmación al cliente y avisos cuando cambia el estado del pedido.
 * Si RESEND_API_KEY no está configurada, no se envía nada y la tienda sigue funcionando.
 */

export type MailItem = {
  name: string
  qty: number
  unitPrice: number | null
  optionLabel?: string
  idea?: string | null
  kind?: string
  details?: string[]
  previewUrl?: string | null
  referenceUrl?: string | null
}
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
const SERIF = "Georgia,'Times New Roman',serif"

const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const money = (n: number | null) => (n === null ? 'Por confirmar' : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n))
const siteUrl = () => (process.env.VITE_SITE_URL || process.env.BETTER_AUTH_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')).replace(/\/$/, '')
const payLabel: Record<string, string> = { transferencia: 'Transferencia bancaria', enlace: 'Tarjeta con enlace de pago', efectivo: 'Efectivo al recoger' }
const firstName = (n: string) => esc(n.trim().split(/\s+/)[0] ?? '')
const safeUrl = (u: unknown) => (typeof u === 'string' && /^https:\/\//.test(u) ? esc(u) : '')

const CARE = ['Lava al revés con agua fría', 'No uses cloro', 'Evita frotar el diseño', 'Lava con colores similares', 'Seca al aire', 'Plancha al revés']

function whatsappLink(text?: string) {
  const n = (process.env.VITE_WHATSAPP ?? '').replace(/\D/g, '')
  if (!n) return ''
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

function button(href: string, label: string, primary = true) {
  return `<a href="${href}" style="display:inline-block;${primary ? `background:${BURGUNDY};color:${CREAM};` : `background:transparent;color:${BURGUNDY};border:1px solid ${BURGUNDY};`}text-decoration:none;font-weight:600;font-size:14px;padding:14px 26px;border-radius:999px;margin:0 8px 8px 0">${label}</a>`
}

function section(title: string, html: string) {
  return `<tr><td style="padding:22px 0 0">
  <p style="margin:0 0 10px;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700">${title}</p>
  ${html}
</td></tr>`
}

/** Marco común: sello oficial, título, contenido y pie con lema y redes. */
function layout(opts: { preheader: string; title: string; intro: string; body: string }) {
  const url = siteUrl()
  const s = shopSettings()
  const social = [
    filled(s.instagram?.handle) && s.instagram?.url ? `<a href="${safeUrl(s.instagram.url)}" style="color:${BURGUNDY};text-decoration:none">Instagram ${esc(s.instagram.handle)}</a>` : '',
    filled(s.tiktok?.handle) && s.tiktok?.url ? `<a href="${safeUrl(s.tiktok.url)}" style="color:${BURGUNDY};text-decoration:none">TikTok ${esc(s.tiktok.handle)}</a>` : '',
    whatsappLink() && filled(s.whatsappDisplay) ? `<a href="${whatsappLink()}" style="color:${BURGUNDY};text-decoration:none">WhatsApp ${esc(s.whatsappDisplay)}</a>` : '',
  ].filter(Boolean)

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(opts.title)}</title></head>
<body style="margin:0;background:${CREAM};font-family:Montserrat,Helvetica,Arial,sans-serif;color:${BURGUNDY}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM}"><tr><td align="center" style="padding:36px 16px 40px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td align="center" style="padding:0 0 26px">
  ${url ? `<a href="${url}"><img src="${url}/media/email/sello.png" width="150" height="196" alt="Julietté · Romance hecho arte." style="display:block;border:0;width:150px;height:auto"></a>` : `<p style="margin:0;font-weight:700;font-size:22px;letter-spacing:2px">JULIETTÉ</p>`}
</td></tr>
<tr><td style="background:#ffffff;border:1px solid ${ROSE};border-radius:24px;padding:34px 30px 30px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td>
    <h1 style="margin:0 0 14px;font-family:${SERIF};font-weight:400;font-size:34px;line-height:1.12">${opts.title}</h1>
    <p style="margin:0;font-size:15px;line-height:1.75">${opts.intro}</p>
  </td></tr>
  ${opts.body}
  </table>
</td></tr>
<tr><td align="center" style="padding:28px 10px 0;font-size:12px;line-height:1.9">
  <p style="margin:0 0 6px;font-family:${SERIF};font-style:italic;font-size:20px">Romance hecho arte.</p>
  <p style="margin:0">Piezas pintadas a mano${filled(s.city) ? ` en ${esc(s.city)}` : ''}.</p>
  ${social.length ? `<p style="margin:8px 0 0">${social.join(' &nbsp;·&nbsp; ')}</p>` : ''}
  ${url ? `<p style="margin:8px 0 0"><a href="${url}" style="color:${BURGUNDY}">${esc(url.replace(/^https?:\/\//, ''))}</a></p>` : ''}
</td></tr>
</table></td></tr></table></body></html>`
}

/** Resume los detalles del diseño: lo básico en una línea y lo personal (texto, ocasión, notas) aparte. */
function compactDetails(details: string[]) {
  const basicKeys = ['Pieza', 'Motivo', 'Paleta', 'Tamaño']
  const basic: string[] = []
  const extra: string[] = []
  for (const d of details) {
    const k = d.indexOf(': ')
    if (k === -1) basic.push(esc(d))
    else if (basicKeys.includes(d.slice(0, k))) basic.push(esc(d.slice(k + 2)))
    else extra.push(`<strong>${esc(d.slice(0, k))}:</strong> ${esc(d.slice(k + 2))}`)
  }
  return `<p style="margin:0;font-size:13px;line-height:1.6">${basic.join(' · ')}</p>${extra.length ? `<p style="margin:6px 0 0;font-size:13px;line-height:1.6">${extra.join('<br>')}</p>` : ''}`
}

function itemsTable(o: MailOrder, opts: { owner: boolean }) {
  const rows = o.items
    .map((i) => {
      const img = i.previewUrl
        ? `<td width="96" valign="top" style="padding:16px 16px 12px 0"><img src="${safeUrl(i.previewUrl)}" width="80" alt="Boceto de tu pieza" style="display:block;width:80px;height:auto;border-radius:40px 40px 12px 12px;background:#5f272d;border:0"></td>`
        : ''
      const price = i.unitPrice === null ? 'Por cotizar' : money(i.unitPrice * i.qty)
      const links = [
        opts.owner && i.previewUrl ? `<a href="${safeUrl(i.previewUrl)}" style="color:${BURGUNDY}">Abrir boceto</a>` : '',
        opts.owner && i.referenceUrl ? `<a href="${safeUrl(i.referenceUrl)}" style="color:${BURGUNDY}">Ver referencia</a>` : '',
      ].filter(Boolean)
      const main = `<td valign="top" ${img ? '' : 'colspan="2"'} style="padding:16px 0 12px;font-size:14px;line-height:1.5">
    <strong style="font-size:15px">${i.qty} × ${esc(i.name)}</strong>
    ${i.optionLabel ? `<br><span style="font-size:13px">${esc(i.optionLabel)}</span>` : ''}
    ${i.idea ? `<br><span style="font-size:13px">“${esc(i.idea)}”</span>` : ''}
    <br><span style="font-size:13px;font-weight:600">${i.kind === 'custom' ? 'Se cotiza con boceto' : price}</span>
    ${links.length ? `<br><span style="font-size:12px">${links.join(' &nbsp;·&nbsp; ')}</span>` : ''}
  </td>`
      const details =
        i.details && i.details.length
          ? `<tr><td colspan="2" style="padding:0 0 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-radius:14px"><tr><td style="padding:12px 16px">${compactDetails(i.details)}</td></tr></table></td></tr>`
          : ''
      return `<tr>${img}${main}</tr>${details}<tr><td colspan="2" style="border-bottom:1px solid ${ROSE};font-size:0;line-height:0">&nbsp;</td></tr>`
    })
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
<tr><td colspan="2" style="padding:14px 0 0;font-size:15px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:15px"><strong>Subtotal</strong></td><td align="right" style="font-size:15px"><strong>${money(o.total)}</strong></td></tr></table></td></tr></table>`
}

function deliveryText(o: MailOrder) {
  return o.delivery === 'envio' && o.address
    ? `Envío a ${esc(o.address.street)}, ${esc(o.address.city)}, CP ${esc(o.address.zip)}${o.address.references ? ` (${esc(o.address.references)})` : ''}`
    : 'Entrega en persona (punto de entrega en ' + (filled(shopSettings().city) ? esc(shopSettings().city) : 'la ciudad') + ')'
}

/** Pasos que siguen, con el anticipo y los tiempos publicados en Ajustes. */
function nextSteps(o: MailOrder) {
  const s = shopSettings()
  const hasCustom = o.items.some((i) => i.kind === 'custom')
  const hasReady = o.items.some((i) => i.kind !== 'custom')
  const deposit = Number(s.depositPercent) > 0 ? `${Number(s.depositPercent)}%` : ''
  const steps: string[] = []
  if (hasCustom) {
    steps.push('Te escribimos por WhatsApp para afinar la idea y cotizar tu pieza.')
    steps.push('Recibes tu boceto. Lo ajustamos contigo hasta que te encante.')
    steps.push(`Al aprobarlo${deposit ? `, se aparta tu lugar con un anticipo del ${deposit}` : ', confirmamos el pago'}.`)
    steps.push(`Pintamos tu pieza a mano${filled(s.leadDaysCustom) ? ` en ${esc(s.leadDaysCustom)} días hábiles` : ''}.`)
  }
  if (hasReady) steps.push(`Las piezas listas se entregan${filled(s.readyShipDays) ? ` en ${esc(s.readyShipDays)} días hábiles` : ' en pocos días'} tras confirmar el pago.`)
  steps.push(o.delivery === 'envio' ? 'Te enviamos la guía de rastreo cuando salga del taller.' : 'Acordamos contigo el día y el punto de entrega.')
  const list = steps
    .map(
      (t, n) => `<tr><td width="34" valign="top" style="padding:6px 0"><span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:12px;background:${ROSE};font-size:12px;font-weight:700">${n + 1}</span></td><td style="padding:6px 0;font-size:14px;line-height:1.6">${t}</td></tr>`,
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${list}</table>`
}

function careList() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-radius:16px"><tr><td style="padding:16px 20px;font-size:14px;line-height:1.9">${CARE.map((c) => `♡ ${c}`).join('<br>')}</td></tr></table>`
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

export function orderEmails(o: MailOrder) {
  const admin = siteUrl() ? `${siteUrl()}/admin` : ''
  const phone = o.phone.replace(/\D/g, '')
  const waCustomer = phone ? `https://wa.me/${phone.length === 10 ? '52' + phone : phone}?text=${encodeURIComponent(`Hola, ${o.customer_name.split(' ')[0]}. Te escribimos de Julietté por tu pedido ${o.id}.`)}` : ''
  const hasCustom = o.items.some((i) => i.kind === 'custom')

  const ownerHtml = layout({
    preheader: `${o.customer_name} hizo un pedido${hasCustom ? ' a medida' : ''}.`,
    title: `Pedido nuevo`,
    intro: `<strong>${esc(o.customer_name)}</strong> acaba de hacer el pedido <strong>${esc(o.id)}</strong>.${hasCustom ? ' Incluye una pieza a medida para cotizar.' : ''}`,
    body: `${section('Piezas', itemsTable(o, { owner: true }))}
${section(
  'Cliente',
  `<p style="margin:0;font-size:14px;line-height:1.9"><strong>Correo:</strong> <a href="mailto:${esc(o.email)}" style="color:${BURGUNDY}">${esc(o.email)}</a><br><strong>Teléfono:</strong> ${esc(o.phone)}<br><strong>Entrega:</strong> ${deliveryText(o)}<br><strong>Pago elegido:</strong> ${esc(payLabel[o.payment] ?? o.payment)}${o.gift ? `<br><strong>Nota de regalo:</strong> ${esc(o.gift)}` : ''}</p>`,
)}
<tr><td style="padding:26px 0 0">${waCustomer ? button(waCustomer, 'Escribirle por WhatsApp') : ''}${admin ? button(admin, 'Ver en el panel', false) : ''}</td></tr>`,
  })

  const wa = whatsappLink(`Hola, Julietté. Te escribo por mi pedido ${o.id}.`)
  const customerHtml = layout({
    preheader: `Tu pedido ${o.id} quedó registrado. Te contamos cómo sigue.`,
    title: `Gracias, ${firstName(o.customer_name)}.`,
    intro: `Recibimos tu pedido <strong>${esc(o.id)}</strong>. Todavía no se ha hecho ningún cobro: primero confirmamos contigo los detalles por WhatsApp.`,
    body: `${section('Tu pedido', itemsTable(o, { owner: false }))}
${section('Cómo sigue', nextSteps(o))}
${section('Entrega y pago', `<p style="margin:0;font-size:14px;line-height:1.9"><strong>Entrega:</strong> ${deliveryText(o)}<br><strong>Pago:</strong> ${esc(payLabel[o.payment] ?? o.payment)}</p>`)}
<tr><td style="padding:26px 0 0">${wa ? button(wa, 'Escribir por WhatsApp') : ''}</td></tr>
<tr><td style="padding:10px 0 0;font-size:13px;line-height:1.7">¿Dudas? Responde a este correo y te contestamos en persona.</td></tr>`,
  })
  return { ownerHtml, customerHtml }
}

export async function sendOrderEmails(o: MailOrder) {
  const owner = ownerEmails()
  const { ownerHtml, customerHtml } = orderEmails(o)
  await Promise.allSettled([
    send({ to: owner, subject: `Pedido nuevo ${o.id} · ${o.customer_name}`, html: ownerHtml, replyTo: o.email }, 'email/owner'),
    send({ to: [o.email], subject: `Recibimos tu pedido ${o.id} · Julietté`, html: customerHtml, replyTo: owner[0] }, 'email/customer'),
  ])
}

const statusCopy: Record<string, { subject: string; title: string; text: string }> = {
  confirmado: { subject: 'Tu pedido está confirmado', title: 'Pedido confirmado', text: 'Confirmamos tu pedido. Muy pronto empezamos a pintarlo para ti.' },
  'en-proceso': { subject: 'Ya estamos pintando tu pieza', title: 'Tu pieza está en el taller', text: 'Cada trazo se hace a mano, así que le damos el tiempo que merece. Te avisamos en cuanto esté lista.' },
  enviado: { subject: 'Tu pedido va en camino', title: 'Va en camino', text: 'Tu pieza salió del taller con su tarjeta de bienvenida. Aquí tienes cómo cuidarla para que dure muchas historias.' },
  entregado: { subject: 'Tu pieza llegó', title: 'Ya es tuya', text: 'Esperamos que tu pieza te acompañe en muchas historias. Gracias por elegir algo hecho a mano.' },
  cancelado: { subject: 'Tu pedido fue cancelado', title: 'Pedido cancelado', text: 'Tu pedido fue cancelado. Si no lo esperabas o tienes dudas, responde a este correo y lo revisamos contigo.' },
}

export function statusEmail(o: { id: string; customer_name: string; items?: MailItem[] }, status: string) {
  const c = statusCopy[status]
  if (!c) return null
  const s = shopSettings()
  const preview = o.items?.find((i) => i.previewUrl)?.previewUrl
  const piece = o.items?.length ? o.items.map((i) => `${i.qty} × ${esc(i.name)}`).join('<br>') : ''
  const pieceBlock = piece
    ? `<tr><td style="padding:22px 0 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${ROSE};border-bottom:1px solid ${ROSE}"><tr>${preview ? `<td width="112" style="padding:14px 16px 14px 0"><img src="${safeUrl(preview)}" width="96" alt="" style="display:block;width:96px;height:auto;border-radius:48px 48px 14px 14px;background:#5f272d;border:0"></td>` : ''}<td style="padding:14px 0;font-size:14px;line-height:1.6">Pedido <strong>${esc(o.id)}</strong><br>${piece}</td></tr></table></td></tr>`
    : `<tr><td style="padding:18px 0 0;font-size:14px">Pedido <strong>${esc(o.id)}</strong></td></tr>`
  const insta = filled(s.instagram?.handle) && s.instagram?.url ? s.instagram : null
  let extra = ''
  if (status === 'confirmado' && filled(s.leadDaysCustom) && o.items?.some((i) => i.kind === 'custom'))
    extra = section('Tiempo estimado', `<p style="margin:0;font-size:14px;line-height:1.7">Las piezas a medida toman ${esc(s.leadDaysCustom)} días hábiles de elaboración, más el tiempo de entrega.</p>`)
  if (status === 'enviado' || status === 'entregado') extra = section('Cuidados de tu pieza', careList())
  if (status === 'entregado' && insta)
    extra += `<tr><td style="padding:22px 0 0;font-size:14px;line-height:1.7">Si compartes tu pieza en redes, etiquétanos en <strong>${esc(insta.handle)}</strong>. Nos encanta verlas en su nueva vida.</td></tr><tr><td style="padding:16px 0 0">${button(safeUrl(insta.url), 'Ver Instagram', false)}</td></tr>`
  return {
    subject: `${c.subject} · ${o.id}`,
    html: layout({ preheader: c.text, title: c.title, intro: `Hola, ${firstName(o.customer_name)}. ${c.text}`, body: pieceBlock + extra }),
  }
}

export async function sendStatusEmail(o: { id: string; customer_name: string; email: string; items?: MailItem[] }, status: string) {
  const m = statusEmail(o, status)
  if (!m) return false
  return send({ to: [o.email], subject: m.subject, html: m.html, replyTo: ownerEmails()[0] }, 'email/status')
}
