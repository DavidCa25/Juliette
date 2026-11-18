import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { campaign, track, visitorId } from '../lib/analytics'
import { Link, useNavigate } from 'react-router-dom'
import { site } from '../config/site'
import { describeDesign } from '../data/design'
import { useCart, type CartLine } from '../state/cart'
import { money, orderId, writeJSON } from '../lib/format'
import { usePageMeta } from '../lib/usePageMeta'
import { Arrow, btnPrimary, container } from '../components/ui'

type Form = {
  name: string
  phone: string
  email: string
  delivery: 'envio' | 'local'
  street: string
  city: string
  zip: string
  references: string
  payment: 'transferencia' | 'enlace' | 'efectivo'
  gift: string
  accept: boolean
}

const empty: Form = { name: '', phone: '', email: '', delivery: 'envio', street: '', city: '', zip: '', references: '', payment: 'transferencia', gift: '', accept: false }

export type StoredOrder = { id: string; createdAt: string; message: string; total: string; customer: { name: string; email: string } }
export const ORDER_KEY = 'jl-last-order'

function lineText(l: CartLine) {
  if (l.kind === 'product') {
    return `• ${l.qty} × ${l.name}${l.size ? ` (${l.size})` : ''} — ${l.optionLabel}${l.idea ? ` (“${l.idea}”)` : ''} — ${l.unitPrice === null ? 'por confirmar' : money(l.unitPrice * l.qty)}`
  }
  return [`• ${l.qty} × ${l.name} — se cotiza con boceto`, ...describeDesign(l.design).map((d) => `   – ${d}`)].join('\n')
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="jl-label">{label}</label>
      {children}
      {error && <span id={`${id}-err`} role="alert" className="text-[13px] font-semibold">{error}</span>}
    </div>
  )
}

function Radio({ name, value, checked, onChange, title, sub }: { name: string; value: string; checked: boolean; onChange: () => void; title: string; sub: string }) {
  return (
    <label className={`jl-opt flex items-start gap-4 p-4 border cursor-pointer rounded-[20px] ${checked ? 'border-borgona bg-rosa/60' : 'border-borgona/25'}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="mt-1 accent-[#82001a] w-4 h-4" />
      <span className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold">{title}</span>
        <span className="text-[13px] leading-snug">{sub}</span>
      </span>
    </label>
  )
}

export default function Checkout() {
  usePageMeta('Confirmar pedido')
  const { lines, subtotal, clear } = useCart()
  const nav = useNavigate()
  const [f, setF] = useState<Form>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const [sending, setSending] = useState(false)
  const [website, setWebsite] = useState('')
  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((x) => ({ ...x, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  useEffect(() => {
    if (lines.length) track('checkout_start', { items: lines.length })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (lines.length === 0) {
    return (
      <section className={`${container} pt-[clamp(24px,4vw,56px)] pb-[clamp(72px,9vw,130px)] flex flex-col items-start gap-6`}>
        <h1 className="m-0 font-display font-light text-[clamp(48px,6vw,88px)] leading-[.92]">Tu carrito está vacío</h1>
        <Link to="/coleccion" className={btnPrimary}>Ver la colección <Arrow /></Link>
      </section>
    )
  }

  function validate() {
    const e: Partial<Record<keyof Form, string>> = {}
    if (f.name.trim().length < 2) e.name = 'Escribe tu nombre.'
    if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Escribe un teléfono de al menos 10 dígitos.'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Escribe un correo válido.'
    if (f.delivery === 'envio') {
      if (f.street.trim().length < 4) e.street = 'Escribe la calle y número.'
      if (f.city.trim().length < 2) e.city = 'Escribe la ciudad.'
      if (!/^\d{4,6}$/.test(f.zip.trim())) e.zip = 'Escribe un código postal válido.'
    }
    if (!f.accept) e.accept = 'Necesitamos que aceptes los términos para continuar.'
    setErrors(e)
    const first = Object.keys(e)[0]
    if (first) document.getElementById(`co-${first}`)?.focus()
    return !first
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setSending(true)
    let id = orderId()
    // Registra el pedido en la base de datos (si está configurada). Si falla, el pedido sigue por WhatsApp.
    try {
      const ctrl = new AbortController()
      const t = window.setTimeout(() => ctrl.abort(), 20000)
      const r = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          website,
          customer: { name: f.name, phone: f.phone, email: f.email },
          delivery: f.delivery,
          address: f.delivery === 'envio' ? { street: f.street, city: f.city, zip: f.zip, references: f.references } : null,
          payment: f.payment,
          gift: f.gift,
          items: lines.map((l) =>
            l.kind === 'product'
              ? { kind: 'product', slug: l.slug, name: l.name, optionId: l.optionId, optionLabel: l.optionLabel, idea: l.idea, size: l.size, qty: l.qty }
              : {
                  kind: 'custom',
                  name: l.name,
                  qty: l.qty,
                  design: { ...l.design, reference: null, strokes: [] },
                  details: describeDesign({ ...l.design, reference: null }),
                  // Boceto y referencia viajan como imagen para guardarse con el pedido
                  preview: l.image?.startsWith('data:image/') ? l.image : null,
                  reference: l.design.reference?.startsWith('data:image/') ? l.design.reference : null,
                },
          ),
          visitorId: visitorId(),
          source: campaign() ?? null,
        }),
      })
      window.clearTimeout(t)
      if (r.ok) {
        const data = (await r.json()) as { id?: string }
        if (data.id) id = data.id
      }
    } catch {
      /* sin conexión con la base de datos: se usa el número local */
    }
    track('order_submitted', { items: lines.length })
    const total = subtotal === null ? 'Por confirmar' : money(subtotal)
    const payment = { transferencia: 'Transferencia bancaria', enlace: 'Tarjeta con enlace de pago', efectivo: 'Efectivo al recoger' }[f.payment]
    const message = [
      `Hola, Julietté. Quiero confirmar mi pedido ${id}:`,
      '',
      ...lines.map(lineText),
      '',
      `Subtotal: ${total}`,
      `Entrega: ${f.delivery === 'envio' ? `Envío a ${f.street}, ${f.city}, CP ${f.zip}${f.references ? ` (${f.references})` : ''}` : `Recoger en ${site.pickupPoint}`}`,
      `Pago: ${payment}`,
      f.gift ? `Nota de regalo: ${f.gift}` : '',
      '',
      `Nombre: ${f.name}`,
      `Teléfono: ${f.phone}`,
      `Correo: ${f.email}`,
    ]
      .filter((x, i, arr) => !(x === '' && arr[i - 1] === ''))
      .join('\n')

    if (site.endpoints.order) {
      try {
        await fetch(site.endpoints.order, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            id,
            createdAt: new Date().toISOString(),
            customer: { name: f.name, phone: f.phone, email: f.email },
            delivery: f.delivery,
            address: f.delivery === 'envio' ? { street: f.street, city: f.city, zip: f.zip, references: f.references } : null,
            payment: f.payment,
            gift: f.gift,
            items: lines.map((l) => (l.kind === 'custom' ? { ...l, image: undefined, design: { ...l.design, reference: l.design.reference ? 'adjunta en el chat' : null, strokes: [] } } : { ...l, image: undefined })),
            subtotal,
            message,
          }),
          keepalive: true,
        })
      } catch {
        /* El pedido se completa igualmente por WhatsApp */
      }
    }

    const stored: StoredOrder = { id, createdAt: new Date().toISOString(), message, total, customer: { name: f.name, email: f.email } }
    writeJSON(ORDER_KEY, stored)
    clear()
    nav('/pedido/confirmado', { replace: true })
  }

  const err = (k: keyof Form) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `co-${k}-err` } : {})

  return (
    <section className={`${container} pt-[clamp(24px,4vw,56px)] pb-[clamp(72px,9vw,130px)]`}>
      <nav aria-label="Ruta" className="flex gap-3 text-[13px] mb-8">
        <Link className="jl-link" to="/carrito">Carrito</Link>
        <span aria-hidden="true">/</span>
        <span className="font-semibold" aria-current="page">Confirmar pedido</span>
      </nav>
      <h1 className="m-0 font-display font-light text-[clamp(48px,6vw,92px)] leading-[.92] mb-10">
        Confirma tu <span className="italic">pedido</span>
      </h1>

      <form onSubmit={onSubmit} noValidate className="flex flex-wrap gap-[clamp(32px,6vw,96px)] items-start">
        <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
          <label htmlFor="co-website">Deja este campo vacío</label>
          <input id="co-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <div className="flex-[1.5_1_520px] min-w-0 flex flex-col gap-12">
          <fieldset className="m-0 p-0 border-0 flex flex-col gap-6">
            <legend className="jl-eyebrow mb-6">01 · Tus datos</legend>
            <Field id="co-name" label="Nombre completo" error={errors.name}>
              <input id="co-name" autoComplete="name" value={f.name} onChange={(e) => set('name', e.target.value)} className="jl-field" {...err('name')} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field id="co-phone" label="WhatsApp" error={errors.phone}>
                <input id="co-phone" type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} className="jl-field" {...err('phone')} />
              </Field>
              <Field id="co-email" label="Correo" error={errors.email}>
                <input id="co-email" type="email" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} className="jl-field" {...err('email')} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="m-0 p-0 border-0 flex flex-col gap-4">
            <legend className="jl-eyebrow mb-6">02 · Entrega</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Radio name="delivery" value="envio" checked={f.delivery === 'envio'} onChange={() => set('delivery', 'envio')} title="Envío a domicilio" sub={`Disponible en ${site.shippingZone}. Costo según destino.`} />
              <Radio name="delivery" value="local" checked={f.delivery === 'local'} onChange={() => set('delivery', 'local')} title="Recoger en persona" sub={`En ${site.pickupPoint}, con cita.`} />
            </div>
            {f.delivery === 'envio' && (
              <div className="jl-fade flex flex-col gap-6 pt-4">
                <Field id="co-street" label="Calle y número" error={errors.street}>
                  <input id="co-street" autoComplete="street-address" value={f.street} onChange={(e) => set('street', e.target.value)} className="jl-field" {...err('street')} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field id="co-city" label="Ciudad" error={errors.city}>
                    <input id="co-city" autoComplete="address-level2" value={f.city} onChange={(e) => set('city', e.target.value)} className="jl-field" {...err('city')} />
                  </Field>
                  <Field id="co-zip" label="Código postal" error={errors.zip}>
                    <input id="co-zip" inputMode="numeric" autoComplete="postal-code" value={f.zip} onChange={(e) => set('zip', e.target.value)} className="jl-field" {...err('zip')} />
                  </Field>
                </div>
                <Field id="co-references" label="Referencias (opcional)">
                  <input id="co-references" value={f.references} onChange={(e) => set('references', e.target.value)} className="jl-field" />
                </Field>
              </div>
            )}
          </fieldset>

          <fieldset className="m-0 p-0 border-0 flex flex-col gap-3">
            <legend className="jl-eyebrow mb-6">03 · Pago</legend>
            <Radio name="payment" value="transferencia" checked={f.payment === 'transferencia'} onChange={() => set('payment', 'transferencia')} title="Transferencia bancaria" sub="Te enviamos los datos por WhatsApp al confirmar." />
            <Radio name="payment" value="enlace" checked={f.payment === 'enlace'} onChange={() => set('payment', 'enlace')} title="Tarjeta con enlace de pago" sub="Recibes un enlace seguro para pagar con tarjeta." />
            <Radio name="payment" value="efectivo" checked={f.payment === 'efectivo'} onChange={() => set('payment', 'efectivo')} title="Efectivo al recoger" sub="Solo para entregas en persona." />
            <p className="m-0 pt-2 text-[13px] leading-[1.7]">No cobramos nada en este paso. Primero confirmamos disponibilidad, envío y, en piezas personalizadas, el boceto.</p>
          </fieldset>

          <fieldset className="m-0 p-0 border-0 flex flex-col gap-6">
            <legend className="jl-eyebrow mb-6">04 · Regalo (opcional)</legend>
            <Field id="co-gift" label="Nota de regalo escrita a mano">
              <textarea id="co-gift" rows={2} maxLength={240} value={f.gift} onChange={(e) => set('gift', e.target.value)} className="jl-field resize-y" />
            </Field>
          </fieldset>
        </div>

        <aside className="flex-[1_1_360px] min-w-0 flex flex-col gap-5 lg:sticky lg:top-6" aria-label="Tu pedido">
          <h2 className="m-0 jl-eyebrow">Tu pedido</h2>
          <ul className="m-0 p-0 list-none border-b border-borgona">
            {lines.map((l) => (
              <li key={l.id} className="flex gap-4 py-4 border-t border-borgona">
                <img src={l.image} alt="" className="w-14 h-[70px] object-cover rounded-t-full bg-vino flex-none" />
                <div className="flex-1 min-w-0 flex justify-between gap-3">
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-[22px] leading-none">{l.name}</span>
                    <span className="text-[12px]">Cantidad: {l.qty}</span>
                  </span>
                  <span className="text-[14px] font-semibold whitespace-nowrap">{l.unitPrice === null ? 'Por cotizar' : money(l.unitPrice * l.qty)}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between text-[15px]"><span>Subtotal</span><span className="font-semibold">{subtotal === null ? 'Por confirmar' : money(subtotal)}</span></div>
          <div className="flex justify-between text-[15px]"><span>Envío</span><span>{f.delivery === 'local' ? 'Sin costo' : site.shippingCost === null ? 'Por confirmar' : money(site.shippingCost)}</span></div>

          <label className="flex items-start gap-3 text-[13px] leading-[1.6] cursor-pointer pt-2">
            <input id="co-accept" type="checkbox" checked={f.accept} onChange={(e) => set('accept', e.target.checked)} className="mt-[3px] w-4 h-4 accent-[#82001a] flex-none" {...err('accept')} />
            <span>
              Acepto los <Link to="/terminos" className="underline underline-offset-4">términos y condiciones</Link>, la <Link to="/reembolsos" className="underline underline-offset-4">política de cambios y reembolsos</Link> y el <Link to="/privacidad" className="underline underline-offset-4">aviso de privacidad</Link>.
            </span>
          </label>
          {errors.accept && <span id="co-accept-err" role="alert" className="text-[13px] font-semibold">{errors.accept}</span>}

          <button type="submit" disabled={sending} className={`${btnPrimary} w-full min-h-[60px]`}>
            {sending ? 'Enviando…' : 'Confirmar pedido'} <Arrow />
          </button>
          <p className="m-0 text-[12px] leading-[1.6] text-center">Al confirmar, te llevamos a WhatsApp con el resumen de tu pedido.</p>
        </aside>
      </form>
    </section>
  )
}
