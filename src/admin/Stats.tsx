import { useEffect, useState } from 'react'
import { money } from '../lib/format'
import { api, type Stats as StatsData } from './client'

const steps: { type: string; label: string }[] = [
  { type: 'page_view', label: 'Visitaron el sitio' },
  { type: 'product_view', label: 'Vieron una pieza' },
  { type: 'design_start', label: 'Abrieron “Diseña la tuya”' },
  { type: 'add_to_cart', label: 'Agregaron al carrito' },
  { type: 'checkout_start', label: 'Iniciaron el pedido' },
  { type: 'order_submitted', label: 'Enviaron el pedido' },
]

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-2 border-t border-borgona pt-4">
      <span className="jl-label opacity-80">{label}</span>
      <span className="font-display text-[44px] leading-none">{value}</span>
      {sub && <span className="text-[12px] opacity-80">{sub}</span>}
    </div>
  )
}

/** Visitantes por día: una sola serie, barras finas con su valor al pasar el mouse. */
function DailyChart({ data }: { data: StatsData['daily'] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.visitors))
  const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  if (data.length === 0) return <p className="m-0 text-[14px]">Aún no hay visitas registradas en este periodo.</p>
  const h = hover !== null ? data[hover] : null
  return (
    <figure className="m-0 flex flex-col gap-3">
      <figcaption className="flex justify-between items-baseline gap-4">
        <span className="text-[15px] font-semibold">Visitantes por día</span>
        <span className="text-[13px] min-h-[20px]" aria-live="polite">{h ? `${fmt(h.day)} · ${h.visitors} visitantes · ${h.views} páginas vistas` : `Máximo: ${max}`}</span>
      </figcaption>
      <div className="relative h-[180px] flex items-end gap-[2px] border-b border-borgona/40" role="img" aria-label={`Visitantes por día en los últimos ${data.length} días. Máximo ${max}.`}>
        {data.map((d, i) => (
          <button
            key={d.day}
            type="button"
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onBlur={() => setHover(null)}
            aria-label={`${fmt(d.day)}: ${d.visitors} visitantes`}
            className="flex-1 h-full flex items-end bg-transparent border-0 p-0 cursor-default"
          >
            <span className="block w-full rounded-t-[4px] transition-opacity" style={{ height: `${Math.max(2, (d.visitors / max) * 100)}%`, background: '#82001a', opacity: hover === null || hover === i ? 1 : 0.45 }} />
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[12px] opacity-80">
        <span>{fmt(data[0].day)}</span>
        <span>{fmt(data[data.length - 1].day)}</span>
      </div>
    </figure>
  )
}

function Bars({ rows, total }: { rows: { label: string; value: number }[]; total: number }) {
  return (
    <ul className="m-0 p-0 list-none flex flex-col gap-3">
      {rows.map((r) => (
        <li key={r.label} className="flex flex-col gap-1">
          <span className="flex justify-between text-[13px]"><span>{r.label}</span><span className="font-semibold">{r.value}</span></span>
          <span className="h-[6px] rounded-full bg-borgona/10 overflow-hidden"><span className="block h-full rounded-full bg-borgona" style={{ width: `${total ? Math.max(2, (r.value / total) * 100) : 0}%` }} /></span>
        </li>
      ))}
      {rows.length === 0 && <li className="text-[13px]">Sin datos todavía.</li>}
    </ul>
  )
}

export function Stats({ productNames }: { productNames: Record<string, string> }) {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<StatsData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    api.stats(days).then(setData).catch((e) => setError((e as Error).message))
  }, [days])

  return (
    <section className="jl-fade flex flex-col gap-10" aria-label="Resumen">
      <div role="group" aria-label="Periodo" className="flex gap-2">
        {[7, 30, 90].map((d) => (
          <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)} className={`min-h-[40px] px-4 rounded-full border text-[13px] font-semibold cursor-pointer ${days === d ? 'bg-borgona text-crema border-borgona' : 'bg-transparent text-borgona border-borgona/40'}`}>
            {d} días
          </button>
        ))}
      </div>

      {error && <p role="alert" className="m-0 text-[14px]">{error}</p>}
      {!data && !error && <p className="m-0 text-[14px]" aria-busy="true">Cargando estadísticas…</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Tile label="Visitantes" value={String(data.totals.visitors)} sub={`${data.totals.views} páginas vistas`} />
            <Tile label="Pedidos" value={String(data.orders.orders)} sub={`${data.orders.pending} por atender`} />
            <Tile label="Ventas" value={data.orders.revenue ? money(data.orders.revenue) : '—'} sub="Pedidos con precio confirmado" />
            <Tile label="Conversión" value={data.totals.sessions ? `${((data.orders.orders / data.totals.sessions) * 100).toFixed(1)}%` : '—'} sub="Pedidos ÷ visitas" />
          </div>

          <DailyChart data={data.daily} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="flex flex-col gap-4">
              <h3 className="m-0 text-[15px] font-semibold">Recorrido de compra</h3>
              <Bars total={data.funnel.find((f) => f.type === 'page_view')?.sessions ?? 0} rows={steps.map((s) => ({ label: s.label, value: data.funnel.find((f) => f.type === s.type)?.sessions ?? 0 }))} />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="m-0 text-[15px] font-semibold">De dónde llegan</h3>
              <Bars total={Math.max(0, ...data.sources.map((s) => s.sessions))} rows={data.sources.map((s) => ({ label: s.source, value: s.sessions }))} />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="m-0 text-[15px] font-semibold">Dispositivo</h3>
              <Bars total={data.devices.reduce((n, d) => n + d.sessions, 0)} rows={data.devices.map((d) => ({ label: d.device ?? 'otro', value: d.sessions }))} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="m-0 text-[15px] font-semibold">Piezas más vistas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[14px] border-collapse">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 pr-4 font-semibold">Pieza</th>
                    <th className="py-2 pr-4 font-semibold text-right">Vistas</th>
                    <th className="py-2 pr-4 font-semibold text-right">Al carrito</th>
                    <th className="py-2 font-semibold text-right">Interés</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((p) => (
                    <tr key={p.slug} className="border-t border-borgona/25">
                      <td className="py-3 pr-4">{productNames[p.slug] ?? p.slug}</td>
                      <td className="py-3 pr-4 text-right">{p.views}</td>
                      <td className="py-3 pr-4 text-right">{p.adds}</td>
                      <td className="py-3 text-right">{p.views ? `${Math.round((p.adds / p.views) * 100)}%` : '—'}</td>
                    </tr>
                  ))}
                  {data.products.length === 0 && (
                    <tr className="border-t border-borgona/25"><td colSpan={4} className="py-3">Sin datos todavía.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="m-0 text-[15px] font-semibold">Clientes ({data.customers.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[14px] border-collapse min-w-[640px]">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 pr-4 font-semibold">Nombre</th>
                    <th className="py-2 pr-4 font-semibold">Contacto</th>
                    <th className="py-2 pr-4 font-semibold text-right">Pedidos</th>
                    <th className="py-2 pr-4 font-semibold text-right">Total</th>
                    <th className="py-2 font-semibold text-right">Último pedido</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers.map((c) => (
                    <tr key={c.email} className="border-t border-borgona/25">
                      <td className="py-3 pr-4">{c.name}</td>
                      <td className="py-3 pr-4"><a className="underline underline-offset-4" href={`mailto:${c.email}`}>{c.email}</a><br /><span className="text-[12px]">{c.phone}</span></td>
                      <td className="py-3 pr-4 text-right">{c.orders}</td>
                      <td className="py-3 pr-4 text-right">{c.spent ? money(c.spent) : '—'}</td>
                      <td className="py-3 text-right">{new Date(c.last).toLocaleDateString('es-MX')}</td>
                    </tr>
                  ))}
                  {data.customers.length === 0 && (
                    <tr className="border-t border-borgona/25"><td colSpan={5} className="py-3">Aún no hay pedidos.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <p className="m-0 text-[12px] opacity-80">Las visitas solo cuentan a quienes aceptaron las cookies de analítica, así que el número real es mayor.</p>
        </>
      )}
    </section>
  )
}
