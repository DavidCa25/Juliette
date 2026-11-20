import { useEffect, useMemo, useState } from 'react'
import { api, type Broadcast, type Subscriber } from './client'
import { Text, UploadButton } from './fields'

/** Plantillas de boletín: cada una llena el formulario con un punto de partida. */
const presets: Record<Broadcast['template'], { name: string; sub: string; value: Omit<Broadcast, 'template'> }> = {
  lanzamiento: {
    name: 'Lanzamiento',
    sub: 'Nueva colección o pieza',
    value: {
      subject: 'Nueva colección Julietté',
      title: 'Llegó algo nuevo',
      body: 'Pintamos a mano una nueva colección y queríamos que la vieras primero.\n\nCada pieza es única: los trazos, los colores y los pequeños detalles cambian de una a otra.',
      ctaLabel: 'Ver la colección',
      ctaUrl: 'https://juliette.com.mx/coleccion',
      note: 'Piezas limitadas: cuando se terminan, no se repiten igual.',
    },
  },
  promocion: {
    name: 'Promoción o dinámica',
    sub: 'Concurso, regalo o invitación',
    value: {
      subject: 'Diseña tu tote y gánala',
      title: 'La más creativa la pintamos gratis',
      body: 'Crea tu propia tote en nuestro estudio de pintura: pinceles, colores y más de 380 stickers.\n\nCompártela en tus historias etiquetándonos y elegiremos el diseño más creativo para pintarlo a mano.',
      ctaLabel: 'Diseñar la mía',
      ctaUrl: 'https://juliette.com.mx/design',
      note: 'Participación gratuita. El ganador se elige por creatividad.',
    },
  },
  temporada: {
    name: 'Aviso de temporada',
    sub: 'Fechas límite y cupo',
    value: {
      subject: 'Últimos días para pedidos navideños',
      title: 'Tu regalo, a tiempo para Navidad',
      body: 'Cada pieza se pinta a mano, así que el cupo por semana es limitado.\n\nSi quieres regalar algo único esta Navidad, este es el momento de pedirlo.',
      ctaLabel: 'Hacer mi pedido',
      ctaUrl: 'https://juliette.com.mx/design',
      note: 'Pedidos personalizados para Navidad: hasta el 12 de diciembre.',
    },
  },
}

const fmt = (d: string) => new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

function toCsv(list: Subscriber[]) {
  const rows = [['correo', 'fecha', 'origen', 'pais', 'estado'], ...list.map((s) => [s.email, s.created_at, s.source ?? '', s.country ?? '', s.status])]
  return rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
}

export function Newsletter() {
  const [data, setData] = useState<{ subscribers: Subscriber[]; total: number; ready: { key: boolean; segment: boolean } } | null>(null)
  const [error, setError] = useState('')
  const [b, setB] = useState<Broadcast>({ template: 'lanzamiento', ...presets.lanzamiento.value })
  const [preview, setPreview] = useState('')
  const [busy, setBusy] = useState<'' | 'preview' | 'test' | 'send'>('')
  const [msg, setMsg] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    api.newsletter().then(setData).catch((e: Error) => setError(e.message))
  }, [])

  // Vista previa: se actualiza un momento después de dejar de escribir
  useEffect(() => {
    const t = window.setTimeout(() => {
      api
        .newsletterAction('preview', b)
        .then((r) => setPreview(r.html ?? ''))
        .catch(() => undefined)
    }, 600)
    return () => window.clearTimeout(t)
  }, [b])

  const set = <K extends keyof Broadcast>(k: K, v: Broadcast[K]) => setB((x) => ({ ...x, [k]: v }))
  const list = useMemo(() => (data?.subscribers ?? []).filter((s) => !q || s.email.includes(q.toLowerCase())), [data, q])

  async function run(action: 'test' | 'send') {
    setMsg('')
    if (action === 'send' && !window.confirm(`¿Enviar "${b.subject}" a ${data?.total ?? 0} suscriptores? No se puede deshacer.`)) return
    setBusy(action)
    try {
      const r = await api.newsletterAction(action, b)
      setMsg(action === 'test' ? `Prueba enviada a ${r.to?.join(', ')}.` : 'Boletín enviado. Resend lo está entregando a tus suscriptores.')
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setBusy('')
    }
  }

  function download() {
    const blob = new Blob(['﻿' + toCsv(data?.subscribers ?? [])], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `suscriptores-juliette-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="jl-fade flex flex-col gap-10 py-6">
      {error && <p className="m-0 p-4 rounded-[16px] border border-borgona text-[14px]">{error}</p>}
      {data && (!data.ready.key || !data.ready.segment) && (
        <p className="m-0 p-4 rounded-[16px] border border-borgona text-[14px] leading-[1.7]">
          <strong>Configuración pendiente para enviar boletines:</strong>{' '}
          {!data.ready.key && 'falta la clave de Resend. '}
          {!data.ready.segment && 'falta RESEND_SEGMENT_ID (el segmento de Resend con tus suscriptores). '}
          Mientras tanto, las suscripciones se guardan aquí y puedes enviarte pruebas.
        </p>
      )}

      <div className="flex flex-wrap gap-x-12 gap-y-4 items-end">
        <div>
          <p className="m-0 text-[12px] tracking-[2px] uppercase font-semibold">Suscriptores activos</p>
          <p className="m-0 font-display font-light text-[64px] leading-none">{data?.total ?? '—'}</p>
        </div>
        <p className="m-0 max-w-[460px] text-[14px] leading-[1.7]">
          Se suscriben desde el pie de página del sitio y reciben un correo de bienvenida. Cada boletín incluye un enlace para darse de baja.
        </p>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_520px] gap-10 items-start">
        <div className="flex flex-col gap-6">
          <h2 className="m-0 font-display font-light text-[40px] leading-none">Nuevo boletín</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(presets) as Broadcast['template'][]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={b.template === k}
                onClick={() => setB({ template: k, ...presets[k].value })}
                className={`text-left rounded-[18px] border p-4 cursor-pointer bg-transparent text-borgona transition-colors ${b.template === k ? 'border-borgona bg-rosa/50' : 'border-borgona/25 hover:border-borgona'}`}
              >
                <span className="block text-[15px] font-semibold">{presets[k].name}</span>
                <span className="block text-[12px] mt-1">{presets[k].sub}</span>
              </button>
            ))}
          </div>
          <Text label="Asunto del correo" value={b.subject} onChange={(v) => set('subject', v)} />
          <Text label="Título" value={b.title} onChange={(v) => set('title', v)} />
          <Text label="Texto" multiline value={b.body} onChange={(v) => set('body', v)} hint="Deja una línea en blanco para separar párrafos." />
          <div className="flex flex-col gap-2">
            <span className="jl-label">Imagen (opcional)</span>
            <div className="flex flex-wrap items-center gap-4">
              {b.image && <img src={b.image} alt="" className="w-24 h-24 object-cover rounded-[14px]" />}
              <UploadButton accept="image/*" folder="ajustes" label={b.image ? 'Cambiar imagen' : 'Subir imagen'} onUploaded={(url) => set('image', url)} />
              {b.image && (
                <button type="button" onClick={() => set('image', '')} className="jl-link bg-transparent border-0 p-0 text-borgona text-[13px] font-semibold cursor-pointer">
                  Quitar
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Text label="Texto del botón" value={b.ctaLabel ?? ''} onChange={(v) => set('ctaLabel', v)} />
            <Text label="Enlace del botón" value={b.ctaUrl ?? ''} onChange={(v) => set('ctaUrl', v)} placeholder="https://juliette.com.mx/…" />
          </div>
          <Text label={b.template === 'temporada' ? 'Fecha o dato importante (se destaca)' : 'Nota final (opcional)'} value={b.note ?? ''} onChange={(v) => set('note', v)} />
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => run('test')} disabled={!!busy} className="min-h-[48px] px-6 rounded-full border border-borgona bg-transparent text-borgona text-[14px] font-semibold cursor-pointer disabled:opacity-50">
              {busy === 'test' ? 'Enviando…' : 'Enviarme una prueba'}
            </button>
            <button type="button" onClick={() => run('send')} disabled={!!busy || !data?.ready.segment || !data?.total} className="min-h-[48px] px-6 rounded-full border-0 bg-borgona text-crema text-[14px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              {busy === 'send' ? 'Enviando…' : `Enviar a ${data?.total ?? 0} suscriptores`}
            </button>
          </div>
          {msg && <p role="status" className="m-0 text-[14px] font-semibold">{msg}</p>}
        </div>

        <div className="flex flex-col gap-3 xl:sticky xl:top-6">
          <span className="jl-label">Vista previa</span>
          <iframe title="Vista previa del boletín" srcDoc={preview} className="w-full h-[720px] rounded-[20px] border border-borgona/20 bg-crema" sandbox="" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="m-0 font-display font-light text-[40px] leading-none">Suscriptores</h2>
          <div className="flex flex-wrap items-center gap-4">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar correo" className="jl-field !w-[220px]" />
            <button type="button" onClick={download} disabled={!data?.subscribers.length} className="jl-link bg-transparent border-0 p-0 text-borgona text-[14px] font-semibold cursor-pointer disabled:opacity-40">
              Descargar Excel (CSV)
            </button>
          </div>
        </div>
        {list.length === 0 ? (
          <p className="m-0 text-[14px]">{data ? 'Todavía no hay suscriptores.' : 'Cargando…'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px] border-collapse">
              <thead>
                <tr className="text-left text-[12px] tracking-[1.5px] uppercase">
                  <th className="py-2 pr-4 font-semibold">Correo</th>
                  <th className="py-2 pr-4 font-semibold">Desde</th>
                  <th className="py-2 pr-4 font-semibold">Origen</th>
                  <th className="py-2 pr-4 font-semibold">País</th>
                  <th className="py-2 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, 300).map((s) => (
                  <tr key={s.email} className="border-t border-borgona/15">
                    <td className="py-2.5 pr-4">{s.email}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">{fmt(s.created_at)}</td>
                    <td className="py-2.5 pr-4">{s.source ?? '—'}</td>
                    <td className="py-2.5 pr-4">{s.country ?? '—'}</td>
                    <td className="py-2.5">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
