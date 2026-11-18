import { useCallback, useEffect, useState } from 'react'
import { money } from '../lib/format'
import { api, type Order } from './client'

const STATUS: { id: string; label: string }[] = [
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'confirmado', label: 'Confirmado' },
  { id: 'en-proceso', label: 'En proceso' },
  { id: 'enviado', label: 'Enviado' },
  { id: 'entregado', label: 'Entregado' },
  { id: 'cancelado', label: 'Cancelado' },
]
const PAYMENT: { id: string; label: string }[] = [
  { id: 'pendiente', label: 'Pago pendiente' },
  { id: 'anticipo', label: 'Anticipo recibido' },
  { id: 'pagado', label: 'Pagado' },
  { id: 'reembolsado', label: 'Reembolsado' },
]
const label = (list: { id: string; label: string }[], id: string) => list.find((x) => x.id === id)?.label ?? id

function OrderDetail({ order, onSaved }: { order: Order; onSaved: (o: Order) => void }) {
  const [notes, setNotes] = useState(order.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [notify, setNotify] = useState(true)
  const phone = order.phone.replace(/\D/g, '')

  async function save(patch: { status?: string; payment_status?: string; notes?: string }) {
    setBusy(true)
    setMsg('')
    try {
      const r = await api.updateOrder(order.id, { ...patch, notify })
      onSaved({ ...order, ...r.order } as Order)
      setMsg(r.emailed ? 'Guardado. Le avisamos al cliente por correo.' : 'Guardado.')
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="jl-fade grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 py-6">
      <div className="flex flex-col gap-4">
        <ul className="m-0 p-0 list-none border-b border-borgona/25">
          {order.items.map((i, k) => (
            <li key={k} className="flex justify-between gap-4 py-3 border-t border-borgona/25 text-[14px]">
              {i.previewUrl && (
                <a href={i.previewUrl} target="_blank" rel="noopener noreferrer" className="flex-none" title="Abrir boceto">
                  <img src={i.previewUrl} alt="Boceto del cliente" className="w-[72px] h-auto rounded-t-full rounded-b-[12px] bg-vino block" />
                </a>
              )}
              <span className="flex-1 min-w-0">
                <strong>{i.qty} × {i.name}</strong>
                {i.size && <span> · {i.size}</span>}
                {i.optionLabel && <span> · {i.optionLabel}</span>}
                {i.idea && <span className="block text-[13px]">“{i.idea}”</span>}
                {i.details?.length ? (
                  <span className="block text-[12px] leading-[1.7] opacity-85 mt-1">{i.details.map((d) => <span key={d} className="block">{d}</span>)}</span>
                ) : i.design && (
                  <span className="block text-[12px] opacity-80">
                    {Object.entries(i.design)
                      .filter(([k2, v]) => v && !['reference'].includes(k2))
                      .map(([k2, v]) => `${k2}: ${String(v)}`)
                      .join(' · ')}
                  </span>
                )}
                {(i.previewUrl || i.referenceUrl) && (
                  <span className="flex flex-wrap gap-4 mt-2 text-[12px] font-semibold">
                    {i.previewUrl && <a className="jl-link" href={i.previewUrl} target="_blank" rel="noopener noreferrer">Abrir boceto</a>}
                    {i.referenceUrl && <a className="jl-link" href={i.referenceUrl} target="_blank" rel="noopener noreferrer">Ver referencia del cliente</a>}
                  </span>
                )}
              </span>
              <span className="whitespace-nowrap font-semibold">{i.unitPrice === null ? 'Por cotizar' : money(i.unitPrice * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="text-[14px] leading-[1.8]">
          <p className="m-0"><strong>Entrega:</strong> {order.delivery === 'envio' && order.address ? `${order.address.street}, ${order.address.city}, CP ${order.address.zip}${order.address.references ? ` (${order.address.references})` : ''}` : 'Recoge en persona'}</p>
          <p className="m-0"><strong>Pago elegido:</strong> {order.payment}</p>
          {order.gift && <p className="m-0"><strong>Nota de regalo:</strong> {order.gift}</p>}
          {order.source && <p className="m-0"><strong>Campaña:</strong> {Object.values(order.source).join(' · ')}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-3 text-[14px] font-semibold">
          <a className="jl-link" href={`https://wa.me/${phone.length === 10 ? '52' + phone : phone}?text=${encodeURIComponent(`Hola, ${order.customer_name.split(' ')[0]}. Te escribimos de Julietté por tu pedido ${order.id}.`)}`} target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>
          <a className="jl-link" href={`mailto:${order.email}?subject=${encodeURIComponent(`Tu pedido ${order.id} · Julietté`)}`}>Enviar correo</a>
        </div>
        <label className="flex flex-col gap-1">
          <span className="jl-label">Estado del pedido</span>
          <select value={order.status} disabled={busy} onChange={(e) => save({ status: e.target.value })} className="jl-field cursor-pointer">
            {STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-3 text-[13px] cursor-pointer -mt-2">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="w-4 h-4 accent-[#82001a]" />
          Avisar al cliente por correo cuando cambie el estado
        </label>
        <label className="flex flex-col gap-1">
          <span className="jl-label">Pago</span>
          <select value={order.payment_status} disabled={busy} onChange={(e) => save({ payment_status: e.target.value })} className="jl-field cursor-pointer">
            {PAYMENT.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="jl-label">Notas internas</span>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="jl-field resize-y" />
        </label>
        <div className="flex items-center gap-4">
          <button type="button" disabled={busy || notes === (order.notes ?? '')} onClick={() => save({ notes })} className="min-h-[44px] px-6 rounded-full bg-borgona text-crema text-[14px] font-semibold border-0 cursor-pointer disabled:opacity-40">Guardar notas</button>
          <span aria-live="polite" className="text-[13px]">{msg}</span>
        </div>
      </div>
    </div>
  )
}

export function Orders() {
  const [status, setStatus] = useState('')
  const [term, setTerm] = useState('')
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [open, setOpen] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setError('')
    api
      .orders({ status, q: term })
      .then((r) => {
        setOrders(r.orders)
        setCounts(Object.fromEntries(r.counts.map((c) => [c.status, c.n])))
      })
      .catch((e) => setError((e as Error).message))
  }, [status, term])

  useEffect(() => {
    const t = window.setTimeout(load, term ? 300 : 0)
    return () => window.clearTimeout(t)
  }, [load, term])

  return (
    <section className="jl-fade flex flex-col gap-6" aria-label="Pedidos">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
          {[{ id: '', label: 'Todos' }, ...STATUS].map((s) => (
            <button key={s.id || 'todos'} type="button" aria-pressed={status === s.id} onClick={() => setStatus(s.id)} className={`min-h-[40px] px-4 rounded-full border text-[13px] font-semibold cursor-pointer ${status === s.id ? 'bg-borgona text-crema border-borgona' : 'bg-transparent text-borgona border-borgona/40'}`}>
              {s.label}{s.id && counts[s.id] ? ` · ${counts[s.id]}` : ''}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 border-b border-borgona min-w-[240px]">
          <span className="sr-only">Buscar pedido</span>
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar por nombre, correo o número" className="flex-1 bg-transparent border-0 outline-none py-3 text-[14px] text-borgona" />
        </label>
      </div>

      {error && <p role="alert" className="m-0 text-[14px]">{error}</p>}
      {!orders && !error && <p className="m-0 text-[14px]" aria-busy="true">Cargando pedidos…</p>}
      {orders && orders.length === 0 && <p className="m-0 text-[14px] border-t border-borgona pt-6">No hay pedidos con este filtro.</p>}

      {orders && orders.length > 0 && (
        <ul className="m-0 p-0 list-none border-b border-borgona">
          {orders.map((o) => (
            <li key={o.id} className="border-t border-borgona">
              <button type="button" aria-expanded={open === o.id} onClick={() => setOpen(open === o.id ? null : o.id)} className="jl-opt w-full grid grid-cols-[1fr_auto] sm:grid-cols-[150px_1fr_140px_130px_24px] items-center gap-3 py-4 px-2 bg-transparent border-0 text-borgona text-left cursor-pointer">
                <span className="text-[13px] font-semibold">{o.id}</span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-semibold">{o.customer_name}</span>
                  <span className="text-[12px]">{new Date(o.created_at).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })} · {o.items.reduce((n, i) => n + i.qty, 0)} piezas</span>
                </span>
                <span className="hidden sm:inline text-[13px]">{label(STATUS, o.status)} · {label(PAYMENT, o.payment_status)}</span>
                <span className="hidden sm:inline text-[14px] font-semibold text-right">{o.total === null ? 'Por cotizar' : money(o.total)}</span>
                <span aria-hidden="true" className="hidden sm:inline">{open === o.id ? '−' : '+'}</span>
              </button>
              {open === o.id && <OrderDetail order={o} onSaved={(n) => setOrders((list) => (list ? list.map((x) => (x.id === n.id ? n : x)) : list))} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
