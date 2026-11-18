import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { customPricing, site } from '../config/site'
import { defaultDesign, describeDesign, fitFor, fonts, motifs, occasions, palettes, placements, sizes, surfaces, type Design } from '../data/design'
import { money, readJSON, writeJSON } from '../lib/format'
import { openWhatsApp } from '../lib/whatsapp'
import { track } from '../lib/analytics'
import { usePageMeta } from '../lib/usePageMeta'
import { useCart } from '../state/cart'
import { MotifArt, ToteCanvas, shrinkImage, svgToPng } from '../components/disena/ToteCanvas'
import { Arrow, Star, btnPrimary, container } from '../components/ui'

const KEY = 'jl-design-v1'
const steps = [
  { id: 'lienzo', label: 'Pieza', q: '¿Sobre qué pintamos?', hint: 'Julietté pinta procesos, no solo bolsas. Elige la pieza que quieres convertir en arte; si imaginas otra, cuéntanos en los detalles.' },
  { id: 'inspiracion', label: 'Inspiración', q: '¿Qué te inspira?', hint: 'Elige el motivo que dará vida a tu pieza. Todo se pinta a mano, así que el resultado final tendrá su propio carácter.' },
  { id: 'color', label: 'Color', q: 'Elige tu paleta', hint: 'Los tonos con los que trabajaremos el pincel. Puedes cambiarla cuantas veces quieras.' },
  { id: 'palabras', label: 'Palabras', q: '¿Quieres escribir algo?', hint: 'Un nombre, una fecha, una frase que solo tú entiendes. Opcional.' },
  { id: 'detalles', label: 'Detalles', q: 'Últimos detalles', hint: 'Cuéntanos para qué es y cuándo la necesitas. Si tienes una referencia, súbela aquí.' },
  { id: 'pieza', label: 'Tu pieza', q: 'Tu pieza está lista para pintarse', hint: 'Revisa tu diseño. Te enviaremos un boceto para aprobar antes de tocar la tela.' },
] as const

function Choice({ active, onClick, children, className = '', label }: { active: boolean; onClick: () => void; children: ReactNode; className?: string; label?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={`jl-opt relative text-left bg-transparent cursor-pointer border text-borgona transition-colors duration-500 ${active ? 'border-borgona bg-rosa/60' : 'border-borgona/25 hover:border-borgona'} ${className}`}
    >
      {children}
      {active && <Star size={14} color="#82001a" className="jl-pop absolute top-3 right-3" />}
    </button>
  )
}

export default function Disena() {
  usePageMeta('Diseña la tuya', 'Crea tu propia tote bag pintada a mano: elige motivo, paleta y palabras, y recibe un boceto antes de pintarla.')
  const [design, setDesign] = useState<Design>(() => {
    const saved = { ...defaultDesign, ...readJSON<Partial<Design>>(KEY, {}) }
    // Diseños guardados con piezas que ya no existen (ej. la chamarra de mezclilla) pasan a la opción más cercana
    if (!surfaces.some((x) => x.id === saved.surface)) saved.surface = String(saved.surface).startsWith('chamarra') ? 'sudadera-beige' : defaultDesign.surface
    return saved
  })
  const [step, setStep] = useState(0)
  const [saved, setSaved] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [fitError, setFitError] = useState(false)
  const [garmentOpen, setGarmentOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const headRef = useRef<HTMLHeadingElement>(null)
  const { add } = useCart()

  useEffect(() => {
    writeJSON(KEY, design)
    setSaved(true)
    const t = window.setTimeout(() => setSaved(false), 1400)
    return () => window.clearTimeout(t)
  }, [design])

  useEffect(() => {
    track('design_start')
  }, [])

  // Selector de prenda: se cierra con Esc y lleva el foco al diálogo
  useEffect(() => {
    if (!garmentOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setGarmentOpen(false)
    window.addEventListener('keydown', onKey)
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('[role=dialog] button')?.focus())
    return () => window.removeEventListener('keydown', onKey)
  }, [garmentOpen])

  const set = <K extends keyof Design>(k: K, v: Design[K]) => setDesign((d) => ({ ...d, [k]: v }))
  const pickSurface = (id: Design['surface']) => {
    const opts = fitFor(id)?.options ?? []
    setDesign((d) => ({ ...d, surface: id, fit: opts.includes(d.fit) ? d.fit : '' }))
    setFitError(false)
  }
  // Tarjetas del primer paso: la sudadera (beige o negra) es una sola tarjeta; el color se elige en una ventana
  const pieceCards = surfaces.filter((x) => x.id !== 'sudadera-negra')
  const fit = fitFor(design.surface)
  const missingFit = !!fit && !fit.options.includes(design.fit)
  const go = (i: number) => {
    const next = Math.max(0, Math.min(steps.length - 1, i))
    // La talla, medida o tamaño se elige antes de seguir
    if (next > 0 && missingFit) {
      setFitError(true)
      if (step !== 0) setStep(0)
      window.requestAnimationFrame(() => document.getElementById('jl-fit')?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
      return
    }
    if (next !== step) track('design_step', { step: steps[next].id, surface: design.surface })
    setStep(next)
    window.requestAnimationFrame(() => headRef.current?.focus())
  }
  const s = steps[step]
  const palette = palettes.find((p) => p.id === design.palette)!.colors
  const surface = surfaces.find((x) => x.id === design.surface) ?? surfaces[0]
  const garment = surface.kind === 'sudadera'
  const hasTwoSides = surface.kind === 'tote' || surface.kind === 'agenda' || surface.kind === 'sudadera'
  const estimate =
    customPricing.base === null ? null : customPricing.base + (design.text.trim() && customPricing.text ? customPricing.text : 0) + (design.back && customPricing.back ? customPricing.back : 0)

  async function onUpload(f?: File) {
    setUploadError('')
    if (!f) return
    if (!f.type.startsWith('image/')) return setUploadError('Sube una imagen (JPG, PNG o WEBP).')
    if (f.size > 12 * 1024 * 1024) return setUploadError('La imagen pesa más de 12 MB. Prueba con una más ligera.')
    try {
      const data = await shrinkImage(f)
      setDesign((d) => ({ ...d, reference: data, motif: d.motif === 'solo-texto' ? 'mi-idea' : d.motif }))
    } catch (e) {
      setUploadError((e as Error).message)
    }
  }

  const referenceUpload = (
    <div className="flex flex-col gap-3">
      <span className="jl-label">{design.motif === 'mi-idea' ? 'Tu imagen de referencia' : 'Imagen de referencia (opcional)'}</span>
      <label htmlFor="jl-ref" className="flex items-center gap-5 border border-dashed border-borgona rounded-[22px] p-5 cursor-pointer hover:bg-rosa/40 transition-colors">
        {design.reference ? (
          <img src={design.reference} alt="Tu referencia" className="w-16 h-20 object-cover rounded-t-full" />
        ) : (
          <span className="w-16 h-20 rounded-t-full bg-rosa flex items-center justify-center"><Star size={18} color="#82001a" /></span>
        )}
        <span className="flex flex-col gap-1">
          <span className="text-[15px] font-semibold">{design.reference ? 'Cambiar imagen' : 'Subir una imagen'}</span>
          <span className="text-[13px]">Se envía con tu pedido para que Julietté la vea antes de bocetar.</span>
        </span>
      </label>
      <input id="jl-ref" type="file" accept="image/*" className="sr-only" onChange={(e) => onUpload(e.target.files?.[0])} />
      {design.reference && (
        <button type="button" onClick={() => set('reference', null)} className="jl-link self-start bg-transparent border-0 p-0 text-borgona text-[13px] font-semibold cursor-pointer">
          Quitar imagen
        </button>
      )}
      {uploadError && <p role="alert" className="m-0 text-[13px] font-semibold">{uploadError}</p>}
    </div>
  )

  async function download() {
    if (!svgRef.current) return
    setBusy(true)
    try {
      const url = await svgToPng(svgRef.current, 1200)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mi-diseno-juliette.jpg'
      a.click()
    } finally {
      setBusy(false)
    }
  }

  async function addToCart() {
    if (missingFit) return go(1)
    if (!svgRef.current) return
    setBusy(true)
    try {
      const thumb = await svgToPng(svgRef.current, 360)
      track('design_complete', { via: 'carrito', surface: design.surface, motif: design.motif, palette: design.palette })
      add({ kind: 'custom', name: `${surface.name} a medida`, image: thumb, design: { ...design }, unitPrice: estimate, qty: 1 })
    } finally {
      setBusy(false)
    }
  }

  function sendWhatsApp() {
    if (missingFit) return go(1)
    track('design_complete', { via: 'whatsapp', surface: design.surface, motif: design.motif, palette: design.palette })
    openWhatsApp(['Hola, Julietté. Creé este diseño en su sitio y me gustaría un boceto:', '', ...describeDesign(design).map((l) => `• ${l}`)].join('\n'))
  }

  return (
    <div className="pb-[clamp(72px,9vw,130px)]">
      <section className={`${container} pt-[clamp(16px,3vw,40px)] pb-[clamp(32px,4vw,56px)] flex flex-wrap items-end justify-between gap-8`}>
        <div className="flex flex-col gap-5 max-w-[760px]">
          <p className="jl-fade m-0 flex items-center gap-[14px] jl-eyebrow">
            <span className="w-11 h-px bg-borgona" />
            Diseña la tuya
          </p>
          <h1 className="m-0 font-display font-light text-[clamp(52px,7vw,112px)] leading-[.9] tracking-[-1px]">
            <span className="jl-word"><span>Crea una pieza</span></span>
            <br />
            <span className="jl-word"><span className="italic" style={{ animationDelay: '.15s' }}>que solo existe</span></span>{' '}
            <span className="jl-word"><span style={{ animationDelay: '.3s' }}>para ti.</span></span>
          </h1>
        </div>
        <p className="jl-fade m-0 max-w-[380px] text-[16px] leading-[1.7]" style={{ animationDelay: '.4s' }}>
          Tote, sudadera, cuadro o agenda: elige, combina y escribe. Mientras decides, tu pieza se pinta en vivo. Después, Julietté la convierte en un boceto y la pinta a mano para ti.
        </p>
      </section>

      <div className={`${container} flex flex-wrap gap-[clamp(28px,5vw,80px)] items-start`}>
        <div className="flex-[1_1_460px] min-w-0 lg:sticky lg:top-6">
          <div className="jl-studio relative rounded-[32px] overflow-hidden px-[6%] pt-[6%] pb-[3%]">
            <Star size={22} color="#fad9cd" className="jl-star absolute left-[8%] top-[9%]" />
            <Star size={14} color="#fdf6ee" className="jl-star absolute right-[10%] top-[20%]" delay="1.3s" />
            <Star size={18} color="#fad9cd" className="jl-star absolute right-[14%] bottom-[16%]" delay="2.2s" />
            <div className="relative max-w-[520px] mx-auto">
              <ToteCanvas ref={svgRef} design={design} />
            </div>
            <div className="flex items-center justify-between gap-3 pt-3 text-crema text-[12px] tracking-[2px] uppercase font-semibold">
              <span>Vista previa · ilustrativa</span>
              <span aria-live="polite" className={`transition-opacity duration-500 ${saved ? 'opacity-100' : 'opacity-0'}`}>Guardado</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 pt-5 text-[14px] font-semibold">
            <button type="button" onClick={download} disabled={busy} className="jl-link bg-transparent border-0 p-0 text-borgona cursor-pointer">
              Descargar mi boceto
            </button>
            <button type="button" onClick={() => { setDesign(defaultDesign); go(0) }} className="jl-link bg-transparent border-0 p-0 text-borgona cursor-pointer">
              Empezar de nuevo
            </button>
          </div>
        </div>

        <div className="flex-[1_1_480px] min-w-0 flex flex-col gap-8">
          <ol className="m-0 p-0 list-none grid grid-cols-6 gap-2" aria-label="Pasos">
            {steps.map((st, i) => (
              <li key={st.id}>
                <button type="button" onClick={() => go(i)} aria-current={i === step ? 'step' : undefined} className="w-full bg-transparent border-0 p-0 text-left text-borgona cursor-pointer flex flex-col gap-2">
                  <span className={`h-[3px] rounded-full transition-colors duration-500 ${i <= step ? 'bg-borgona' : 'bg-borgona/20'}`} />
                  <span className={`text-[11px] sm:text-[12px] tracking-[1.5px] uppercase ${i === step ? 'font-bold' : 'font-medium opacity-70'}`}>
                    <span className="hidden sm:inline">0{i + 1} · </span>
                    {st.label}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div key={s.id} className="jl-fade flex flex-col gap-3">
            <h2 ref={headRef} tabIndex={-1} className="m-0 font-display font-light text-[clamp(40px,4.4vw,64px)] leading-[.98] outline-none">
              {s.q}
            </h2>
            <p className="m-0 text-[15px] leading-[1.7] max-w-[520px]">{s.hint}</p>
          </div>

          <div key={`body-${s.id}`} className="jl-fade" style={{ animationDelay: '.08s' }}>
            {s.id === 'lienzo' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pieceCards.map((sf) => {
                  // La sudadera es una sola tarjeta: al tocarla se abre una ventana para elegir el color
                  const isGarment = sf.kind === 'sudadera'
                  const current = isGarment ? (garment ? surface.id : 'sudadera-beige') : sf.id
                  return (
                    <Choice
                      key={sf.id}
                      active={isGarment ? garment : design.surface === sf.id}
                      onClick={() => (isGarment ? setGarmentOpen(true) : pickSurface(sf.id))}
                      className="rounded-[22px] p-3 flex flex-col gap-3"
                    >
                      <span className="jl-studio rounded-[16px] overflow-hidden px-3 pt-3 block" aria-hidden="true">
                        <ToteCanvas design={{ ...design, surface: current }} />
                      </span>
                      <span className="flex flex-col gap-1 px-1 pb-1">
                        <span className="text-[15px] font-semibold">{isGarment ? 'Sudadera con gorro' : sf.name}</span>
                        <span className="text-[12px] leading-snug">{isGarment ? (garment ? surface.name : 'Beige o negra') : sf.sub}</span>
                      </span>
                    </Choice>
                  )
                })}
              </div>
            )}
            {s.id === 'lienzo' && garment && (
              <p className="jl-fade m-0 mt-6 text-[14px]">
                <strong>{surface.name}</strong> ·{' '}
                <button type="button" onClick={() => setGarmentOpen(true)} className="jl-link bg-transparent border-0 p-0 text-borgona text-[14px] font-semibold cursor-pointer">
                  Cambiar color
                </button>
              </p>
            )}
            {garmentOpen && createPortal(
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#2a0a10]/55 jl-fade" onClick={() => setGarmentOpen(false)}>
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="jl-garment-title"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.key === 'Escape' && setGarmentOpen(false)}
                  className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto bg-crema text-borgona rounded-[28px] p-6 sm:p-8 flex flex-col gap-6 shadow-[0_30px_80px_-20px_rgba(42,10,16,.6)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <h3 id="jl-garment-title" className="m-0 font-display font-light text-[34px] leading-none">Elige tu sudadera</h3>
                      <p className="m-0 text-[13px]">Con gorro y bolsa canguro, pintada a mano.</p>
                    </div>
                    <button type="button" onClick={() => setGarmentOpen(false)} aria-label="Cerrar" className="w-10 h-10 rounded-full border border-borgona/30 bg-transparent text-borgona text-[18px] leading-none cursor-pointer flex-none">
                      ×
                    </button>
                  </div>
                  {(['sudadera'] as const).map((kind) => (
                    <div key={kind} className="flex flex-col gap-3">
                                            <div className="grid grid-cols-2 gap-3">
                        {surfaces
                          .filter((x) => x.kind === kind)
                          .map((x) => (
                            <Choice
                              key={x.id}
                              active={design.surface === x.id}
                              onClick={() => {
                                pickSurface(x.id)
                                setGarmentOpen(false)
                              }}
                              className="rounded-[20px] p-2 flex flex-col gap-2"
                              label={x.name}
                            >
                              <span className="jl-studio rounded-[14px] overflow-hidden px-2 pt-2 block" aria-hidden="true">
                                <ToteCanvas design={{ ...design, surface: x.id }} showPedestal={false} />
                              </span>
                              <span className="flex items-center gap-2 px-1 pb-1 text-[14px] font-semibold">
                                <span className="w-4 h-4 rounded-full border border-borgona/30 flex-none" style={{ background: x.fabric }} />
                                {x.dark ? 'Negra' : 'Beige'}
                              </span>
                            </Choice>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>,
              document.body,
            )}
            {s.id === 'lienzo' && fit && (
              <fieldset id="jl-fit" key={design.surface} className="jl-fade m-0 mt-8 p-0 border-0 flex flex-col gap-3">
                <legend className="pb-3 jl-label">{fit.label}</legend>
                <div className="flex flex-wrap gap-2">
                  {fit.options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={design.fit === o}
                      onClick={() => {
                        set('fit', o)
                        setFitError(false)
                      }}
                      className={`jl-opt min-h-[46px] min-w-[54px] px-4 rounded-full border text-[14px] font-semibold cursor-pointer transition-colors ${design.fit === o ? 'bg-borgona text-crema border-borgona' : 'bg-transparent text-borgona border-borgona/40 hover:border-borgona'}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
                <p role={fitError ? 'alert' : undefined} className={`m-0 text-[13px] leading-[1.6] ${fitError ? 'font-semibold' : ''}`}>
                  {fitError ? `Elige ${fit.label === 'Talla' ? 'una talla' : fit.label === 'Medida' ? 'una medida' : 'un tamaño'} para continuar.` : fit.hint}
                </p>
              </fieldset>
            )}

            {s.id === 'inspiracion' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {motifs.map((m) => (
                  <Choice key={m.id} active={design.motif === m.id} onClick={() => set('motif', m.id)} className="rounded-[22px] p-4 flex flex-col gap-3">
                    <svg viewBox="-130 -140 260 280" className="w-full h-[110px]" aria-hidden="true">
                      {m.id === 'solo-texto' ? (
                        <text textAnchor="middle" dominantBaseline="middle" fontFamily="'Pinyon Script', cursive" fontSize={74} fill={palette[0]}>Aa</text>
                      ) : (
                        <MotifArt motif={m.id} colors={palette} reference={design.reference} />
                      )}
                    </svg>
                    <span className="flex flex-col gap-1">
                      <span className="text-[15px] font-semibold">{m.name}</span>
                      <span className="text-[12px] leading-snug">{m.sub}</span>
                    </span>
                  </Choice>
                ))}
              </div>
            )}
            {s.id === 'inspiracion' && design.motif === 'mi-idea' && <div className="mt-6 jl-fade">{referenceUpload}</div>}

            {s.id === 'color' && (
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-3">
                  {palettes.map((p) => (
                    <Choice key={p.id} active={design.palette === p.id} onClick={() => set('palette', p.id)} className="rounded-[22px] p-5 flex items-center gap-4">
                      <span className="flex -space-x-2" aria-hidden="true">
                        {p.colors.map((c, i) => (
                          <span key={i} className="w-9 h-9 rounded-full border-2 border-crema" style={{ background: c }} />
                        ))}
                      </span>
                      <span className="text-[15px] font-semibold">{p.name}</span>
                    </Choice>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <span className="jl-label">Tamaño del motivo</span>
                  <div className="grid grid-cols-3 gap-3">
                    {sizes.map((z) => (
                      <Choice key={z.id} active={design.size === z.id} onClick={() => set('size', z.id)} className="rounded-full min-h-[52px] px-4 text-center text-[14px] font-semibold">
                        {z.name}
                      </Choice>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {s.id === 'palabras' && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <label htmlFor="jl-texto" className="jl-label">Tu texto</label>
                  <input id="jl-texto" value={design.text} maxLength={24} onChange={(e) => set('text', e.target.value)} placeholder="Ej. Romance, Sofía, 14.02" className="jl-field font-display text-[28px]!" autoComplete="off" />
                  <span className="text-[12px] self-end">{design.text.length}/24</span>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="jl-label">Estilo de letra</span>
                  <div className="grid grid-cols-3 gap-3">
                    {fonts.map((f) => (
                      <Choice key={f.id} active={design.font === f.id} onClick={() => set('font', f.id)} className="rounded-[22px] min-h-[96px] px-3 py-4 flex flex-col items-center justify-center gap-2 text-center">
                        <span style={{ fontFamily: f.family, fontStyle: f.style, fontWeight: f.weight, textTransform: f.transform, fontSize: f.id === 'script' ? 34 : f.id === 'moderna' ? 18 : 30, lineHeight: 1 }}>{design.text.trim() ? design.text.slice(0, 10) : 'Julietté'}</span>
                        <span className="text-[12px] font-semibold">{f.name}</span>
                      </Choice>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="jl-label">Ubicación</span>
                  <div className="grid grid-cols-3 gap-3">
                    {placements.map((p) => (
                      <Choice key={p.id} active={design.placement === p.id} onClick={() => set('placement', p.id)} className="rounded-full min-h-[52px] px-4 text-center text-[14px] font-semibold">
                        {p.name}
                      </Choice>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {s.id === 'detalles' && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <span className="jl-label">¿Para quién es?</span>
                  <div className="flex flex-wrap gap-2">
                    {occasions.map((o) => (
                      <Choice key={o} active={design.occasion === o} onClick={() => set('occasion', design.occasion === o ? '' : o)} className="rounded-full min-h-[46px] px-5 text-[14px] font-semibold">
                        {o}
                      </Choice>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="jl-fecha" className="jl-label">¿Para cuándo?</label>
                    <input id="jl-fecha" type="date" value={design.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => set('date', e.target.value)} className="jl-field" />
                  </div>
                  {hasTwoSides && (
                    <div className="flex flex-col gap-2">
                      <span className="jl-label">Diseño en</span>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Choice active={!design.back} onClick={() => set('back', false)} className="rounded-full min-h-[46px] px-3 text-center text-[13px] font-semibold">Solo frente</Choice>
                        <Choice active={design.back} onClick={() => set('back', true)} className="rounded-full min-h-[46px] px-3 text-center text-[13px] font-semibold">Frente y reverso</Choice>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="jl-notas" className="jl-label">Cuéntanos tu historia</label>
                  <textarea id="jl-notas" rows={3} maxLength={500} value={design.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Qué significa para ti, colores que no deben faltar, detalles que imaginas…" className="jl-field resize-y" />
                </div>
                {referenceUpload}
              </div>
            )}

            {s.id === 'pieza' && (
              <div className="flex flex-col gap-8">
                <ul className="m-0 p-0 list-none border-b border-borgona">
                  {describeDesign(design).map((l) => (
                    <li key={l} className="flex gap-4 py-[14px] border-t border-borgona text-[15px]">
                      <Star size={12} color="#82001a" className="mt-[5px] flex-none" />
                      {l}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap justify-between gap-4 text-[15px]">
                  <span>Precio estimado</span>
                  <span className="font-semibold">{estimate === null ? 'Se cotiza con tu boceto' : `Desde ${money(estimate)}`}</span>
                </div>
                <p className="m-0 text-[13px] leading-[1.7]">
                  Tiempo de elaboración: {site.leadDays.custom} días hábiles tras aprobar el boceto. Para iniciar se solicita un anticipo de [{site.depositPercent}%]. Consulta los <Link to="/terminos" className="underline underline-offset-4">términos</Link> y la <Link to="/reembolsos" className="underline underline-offset-4">política de cambios</Link> para piezas personalizadas.
                </p>
                <div className="flex flex-col gap-4">
                  <button type="button" onClick={addToCart} disabled={busy} className={`${btnPrimary} w-full min-h-[60px]`}>
                    Agregar mi diseño al carrito <Arrow />
                  </button>
                  <button type="button" onClick={sendWhatsApp} className="jl-link self-center bg-transparent border-0 p-0 text-borgona text-[14px] font-semibold cursor-pointer">
                    o enviarlo directo por WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-borgona pt-6">
            <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="jl-link bg-transparent border-0 p-0 text-borgona text-[15px] font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
              Atrás
            </button>
            {step < steps.length - 1 && (
              <button type="button" onClick={() => go(step + 1)} className={btnPrimary}>
                {step === steps.length - 2 ? 'Ver mi pieza' : 'Siguiente'} <Arrow />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
