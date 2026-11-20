import { Resend } from 'resend'
import { button, esc, from, layout, section, send, siteUrl } from './email.js'
import { reportServer } from './monitor.js'
import { filled, shopSettings } from './settings.js'

/**
 * Newsletter con Resend: cada suscriptor se agrega a los contactos de Resend (y al segmento, si existe)
 * y se le manda un correo de bienvenida. Los boletines se envían como "Broadcasts" de Resend.
 *
 * Para contactos y boletines Resend pide una clave con acceso completo (Full access).
 * Se usa RESEND_MARKETING_KEY si existe; si no, RESEND_API_KEY.
 */
const BURGUNDY = '#82001a'
const CREAM = '#fdf6ee'

const marketingKey = () => process.env.RESEND_MARKETING_KEY || process.env.RESEND_API_KEY || ''
export const segmentId = () => process.env.RESEND_SEGMENT_ID || ''
export const newsletterReady = () => ({ key: !!marketingKey(), segment: !!segmentId() })

function client() {
  const k = marketingKey()
  return k ? new Resend(k) : null
}

/** Agrega el correo a los contactos de Resend. Devuelve el id del contacto o null. */
export async function addContact(email: string) {
  const r = client()
  if (!r) return null
  try {
    const seg = segmentId()
    const { data, error } = await r.contacts.create({ email, unsubscribed: false, ...(seg ? { segments: [{ id: seg }] } : {}) })
    if (error) {
      // Si ya existía no es un error para el cliente
      if (/already exists/i.test(error.message)) return null
      throw new Error(`${error.name}: ${error.message}`)
    }
    return data?.id ?? null
  } catch (e) {
    await reportServer(e, { route: 'newsletter/contact' })
    return null
  }
}

export function welcomeEmail() {
  const s = shopSettings()
  const url = siteUrl()
  const insta = filled(s.instagram?.handle) && s.instagram?.url ? s.instagram : null
  return layout({
    preheader: 'Gracias por unirte. Te contamos primero de cada lanzamiento.',
    title: 'Bienvenida a Julietté',
    intro: 'Gracias por unirte. Aquí recibirás primero las nuevas colecciones, las fechas de pedidos por temporada y las dinámicas de la comunidad. Escribimos poco y solo cuando vale la pena.',
    body: `${section(
      'Mientras tanto',
      `<p style="margin:0;font-size:14px;line-height:1.75">Diseña tu propia pieza en nuestro estudio: elige la tote, la sudadera o el cuadro, pinta con pinceles y stickers, y recibe un boceto antes de que la pintemos a mano.</p>`,
    )}
<tr><td style="padding:24px 0 0">${url ? button(`${url}/design`, 'Diseña la tuya') : ''}${insta ? button(esc(insta.url), `Síguenos en ${esc(insta.handle)}`, false) : ''}</td></tr>`,
  })
}

export async function sendWelcome(email: string) {
  return send({ to: [email], subject: 'Bienvenida a Julietté', html: welcomeEmail() }, 'newsletter/welcome')
}

export type BroadcastInput = {
  template: 'lanzamiento' | 'promocion' | 'temporada'
  subject: string
  title: string
  body: string
  image?: string | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  note?: string | null
}

const preheaders: Record<BroadcastInput['template'], string> = {
  lanzamiento: 'Nueva colección pintada a mano.',
  promocion: 'Una invitación especial de Julietté.',
  temporada: 'Fechas importantes para tus pedidos.',
}
const eyebrow: Record<BroadcastInput['template'], string> = {
  lanzamiento: 'Nuevo lanzamiento',
  promocion: 'Para nuestra comunidad',
  temporada: 'Aviso de temporada',
}

const safeHttps = (u?: string | null) => (u && /^https:\/\//.test(u) ? esc(u) : '')
const paragraphs = (t: string) =>
  t
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.75">${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('')

/** Arma el HTML del boletín con la misma marca que los correos de pedidos. */
export function broadcastHtml(b: BroadcastInput, opts: { unsubscribe: boolean }) {
  const img = safeHttps(b.image)
  const cta = b.ctaLabel && safeHttps(b.ctaUrl) ? button(safeHttps(b.ctaUrl), esc(b.ctaLabel)) : ''
  const note =
    b.note && b.template === 'temporada'
      ? `<tr><td style="padding:18px 0 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-radius:16px;border-left:4px solid ${BURGUNDY}"><tr><td style="padding:16px 20px;font-size:15px;line-height:1.6"><strong>${esc(b.note)}</strong></td></tr></table></td></tr>`
      : b.note
        ? `<tr><td style="padding:18px 0 0;font-size:13px;line-height:1.7;opacity:.85">${esc(b.note)}</td></tr>`
        : ''
  return layout({
    preheader: preheaders[b.template],
    title: esc(b.title),
    intro: `<span style="display:block;margin:-4px 0 14px;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700">${eyebrow[b.template]}</span>`,
    body: `${img ? `<tr><td style="padding:6px 0 20px"><img src="${img}" width="500" alt="" style="display:block;width:100%;max-width:500px;height:auto;border-radius:18px;border:0"></td></tr>` : ''}
<tr><td>${paragraphs(b.body)}</td></tr>
${note}
${cta ? `<tr><td style="padding:22px 0 0">${cta}</td></tr>` : ''}`,
    footer: opts.unsubscribe
      ? `<p style="margin:14px 0 0;font-size:11px;opacity:.75">Recibes este correo porque te suscribiste en nuestra página. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${BURGUNDY}">Darte de baja</a></p>`
      : '',
  })
}

/** Envía el boletín a todo el segmento como Broadcast de Resend. */
export async function sendBroadcast(b: BroadcastInput) {
  const r = client()
  const seg = segmentId()
  if (!r) throw new Error('Falta configurar Resend en Vercel.')
  if (!seg) throw new Error('Falta RESEND_SEGMENT_ID en Vercel (el segmento de Resend al que se envían los boletines).')
  const { data, error } = await r.broadcasts.create({ segmentId: seg, from: from(), subject: b.subject, html: broadcastHtml(b, { unsubscribe: true }), name: `${b.template} · ${b.subject}`.slice(0, 120) })
  if (error || !data?.id) throw new Error(error ? `${error.name}: ${error.message}` : 'Resend no creó el boletín.')
  const sent = await r.broadcasts.send(data.id)
  if (sent.error) throw new Error(`${sent.error.name}: ${sent.error.message}`)
  return data.id
}
