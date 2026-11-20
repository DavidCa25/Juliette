import { Suspense, lazy, useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Aviso } from '../Aviso'
import { MAX_POINTS, designLook, type BrushId, type Design, type Stroke } from '../../data/design'
import { ToteCanvas, type DrawTool } from './ToteCanvas'
import { PaintDefs, StickerArt, StrokesLayer, brushes, stickers, swatches } from './paint'
import { normalize, useStickerCategory, useStickerIndex } from './stickerLibrary'

const Tote3D = lazy(() => import('./Tote3D'))
const preload3D = () => {
  import('./Tote3D').then((m) => m.preload('tote')).catch(() => undefined)
}

type Tools = Omit<DrawTool, 'onAdd'>

const pointsOf = (strokes: Stroke[]) => strokes.reduce((n, st) => n + (st.t === 'line' ? st.p.length / 2 : 1), 0)

/** Muestra pequeña de cada pincel, dibujada con el mismo motor que el lienzo. */
function BrushSample({ b, color }: { b: BrushId; color: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const f = { paint: `bp-${uid}`, water: `bw-${uid}`, dry: `bd-${uid}` }
  const p = [8, 26, 22, 14, 38, 22, 54, 12, 70, 20, 84, 14]
  const sample: Stroke[] =
    b === 'goma'
      ? [{ t: 'line', b: 'plumon', c: '#cdbfb2', w: 8, o: 1, p: [6, 20, 90, 20] }, { t: 'line', b: 'goma', c: color, w: 6, o: 1, p: [40, 4, 54, 36] }]
      : [{ t: 'line', b, c: color, w: b === 'plumon' ? 3 : b === 'aerosol' ? 7 : 8, o: 1, p }]
  return (
    <svg viewBox="0 0 92 40" className="w-full h-[34px]" aria-hidden="true">
      <defs>
        <filter id={f.paint} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <PaintDefs water={f.water} dry={f.dry} />
      </defs>
      <StrokesLayer strokes={sample} uid={uid} f={f} />
    </svg>
  )
}

function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold tracking-[2px] uppercase">{title}</span>
        {aside}
      </div>
      {children}
    </div>
  )
}

function Slider({ label, value, min, max, step = 1, onChange, suffix = '' }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <label className="flex items-center gap-4 text-[13px]">
      <span className="w-[74px] flex-none font-semibold">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="jl-range flex-1 min-w-0" />
      <span className="w-[44px] text-right tabular-nums">
        {value}
        {suffix}
      </span>
    </label>
  )
}

/** Luminancia relativa de un color #rrggbb (0 = negro, 1 = blanco). */
function lum(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return 0.5
  const v = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]
}
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

export function PaintStudio({ open, onClose, design, setDesign, palette, surfaceName, fabric, kind }: { open: boolean; onClose: () => void; design: Design; setDesign: (fn: (d: Design) => Design) => void; palette: string[]; surfaceName: string; fabric: string; kind: string }) {
  // Pintar en plano (más preciso) o directo sobre la pieza en 3D
  const [view, setView] = useState<'plano' | '3d'>('plano')
  const can3d = kind === 'tote'
  const in3d = view === '3d' && can3d
  const layerRef = useRef<SVGSVGElement>(null)
  const getLayer = useCallback(() => layerRef.current, [])
  const version = useMemo(() => designLook(design), [design])
  const [tab, setTab] = useState<'pincel' | 'sticker'>('pincel')
  const [tools, setTools] = useState<Tools>({ mode: 'pincel', brush: 'pincel', color: '', size: 12, opacity: 1, sticker: 'estrella', stickerSize: 34, rotation: 0, mirror: false })
  const [redo, setRedo] = useState<Stroke[][]>([])
  // Categoría de stickers abierta: 'juliette' son los propios de la marca, el resto se descarga al abrirla
  // Stickers: primero se ven las categorías en cuadrícula; al tocar una, sus stickers. También hay buscador.
  const [cat, setCat] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const index = useStickerIndex(tab === 'sticker')
  const library = useStickerCategory(cat && cat !== 'juliette' ? cat : null)
  const q = normalize(query)
  const results =
    q.length >= 2
      ? [
          ...stickers.filter((k) => normalize(k.name).includes(q)).map((k) => ({ id: k.id as string, name: k.name })),
          ...(index ?? []).flatMap((c) => c.names.filter(([, n]) => normalize(n).includes(q)).map(([id, name]) => ({ id, name }))),
        ].slice(0, 60)
      : null
  const current = cat ? (cat === 'juliette' ? { name: 'Julietté', count: stickers.length } : index?.find((c) => c.id === cat)) : null
  const strokes = design.strokes ?? []
  const used = pointsOf(strokes)
  const colors = Array.from(new Set([...palette, ...swatches]))
  const color = tools.color || palette[0]
  // Las miniaturas se ven sobre el color de la tela; si el color elegido casi no contrasta, se muestran en otro tono
  const shown = contrast(color, fabric) >= 1.6 ? color : lum(fabric) < 0.35 ? '#fdf6ee' : '#82001a'
  const tileBg = { background: fabric }

  const set = <K extends keyof Tools>(k: K, v: Tools[K]) => setTools((t) => ({ ...t, [k]: v }))
  const past = useRef<Stroke[][]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const sel = selected != null && strokes[selected]?.t === 'stamp' ? (strokes[selected] as Extract<Stroke, { t: 'stamp' }>) : null
  /** Guarda el estado actual para poder deshacer el próximo cambio. */
  const snapshot = () => {
    past.current.push(strokes)
    if (past.current.length > 80) past.current.shift()
    setRedo([])
  }
  const add = (list: Stroke[]) => {
    snapshot()
    setDesign((d) => ({ ...d, strokes: [...(d.strokes ?? []), ...list] }))
    // El sticker recién puesto queda seleccionado para acomodarlo de inmediato
    if (list.length && list[0].t === 'stamp') setSelected(strokes.length)
  }
  const edit = (i: number, patch: Partial<Extract<Stroke, { t: 'stamp' }>> | null) =>
    setDesign((d) => {
      const list = [...(d.strokes ?? [])]
      if (!list[i] || list[i].t !== 'stamp') return d
      if (patch === null) list.splice(i, 1)
      else list[i] = { ...(list[i] as Extract<Stroke, { t: 'stamp' }>), ...patch }
      return { ...d, strokes: list }
    })
  const editSelected = (patch: Partial<Extract<Stroke, { t: 'stamp' }>> | null) => {
    if (selected == null) return
    snapshot()
    edit(selected, patch)
    if (patch === null) setSelected(null)
  }
  const duplicate = () => {
    if (!sel) return
    snapshot()
    setDesign((d) => ({ ...d, strokes: [...(d.strokes ?? []), { ...sel, x: sel.x + 22, y: sel.y + 22 }] }))
    setSelected(strokes.length)
  }
  const toFront = () => {
    if (!sel || selected == null) return
    snapshot()
    setDesign((d) => {
      const list = [...(d.strokes ?? [])]
      const [it] = list.splice(selected, 1)
      return { ...d, strokes: [...list, it] }
    })
    setSelected(strokes.length - 1)
  }
  const undo = () => {
    const prev = past.current.pop()
    if (!prev) return
    setRedo((r) => [...r, strokes])
    setSelected(null)
    setDesign((d) => ({ ...d, strokes: prev }))
  }
  const redoLast = () => {
    const next = redo[redo.length - 1]
    if (!next) return
    past.current.push(strokes)
    setRedo((r) => r.slice(0, -1))
    setSelected(null)
    setDesign((d) => ({ ...d, strokes: next }))
  }
  const clear = () => {
    if (!strokes.length) return
    if (!window.confirm('¿Borrar todo lo que pintaste?')) return
    snapshot()
    setSelected(null)
    setDesign((d) => ({ ...d, strokes: [] }))
  }

  // Teclado: Esc cierra, Ctrl/Cmd + Z deshace, Ctrl/Cmd + Shift + Z o Ctrl + Y rehace
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      const typing = (e.target as HTMLElement)?.tagName === 'INPUT'
      if (e.key === 'Escape') selected != null ? setSelected(null) : onClose()
      else if (!typing && selected != null && (e.key === 'Delete' || e.key === 'Backspace')) (e.preventDefault(), editSelected(null))
      else if (!typing && sel && e.key.startsWith('Arrow')) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 2
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        edit(selected!, { x: sel.x + dx, y: sel.y + dy })
      }
      else if (mod && e.key.toLowerCase() === 'z' && e.shiftKey) (e.preventDefault(), redoLast())
      else if (mod && e.key.toLowerCase() === 'z') (e.preventDefault(), undo())
      else if (mod && e.key.toLowerCase() === 'y') (e.preventDefault(), redoLast())
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  })

  const full = used >= MAX_POINTS
  // Aviso una sola vez cada vez que se llena el lienzo
  const [fullAsk, setFullAsk] = useState(false)
  const wasFull = useRef(full)
  useEffect(() => {
    if (full && !wasFull.current) setFullAsk(true)
    wasFull.current = full
  }, [full])

  if (!open) return null
  const draw: DrawTool = { ...tools, mode: tab, color, onAdd: add, selected: tab === 'sticker' ? selected : null, onSelect: setSelected, onEdit: edit, onEditStart: snapshot }

  const swatchRow = (
    <Section title="Color">
      <div className="grid grid-cols-8 gap-2">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Color ${c}`}
            aria-pressed={color === c}
            onClick={() => {
              set('color', c)
              if (sel) editSelected({ c })
            }}
            className={`aspect-square rounded-full cursor-pointer border-2 transition-transform ${color === c ? 'border-borgona scale-110 shadow-[0_0_0_2px_#fdf6ee_inset]' : 'border-borgona/15'}`}
            style={{ background: c }}
          />
        ))}
        <label className="relative aspect-square rounded-full cursor-pointer border-2 border-borgona/15 overflow-hidden" title="Otro color" style={{ background: 'conic-gradient(#e8798a,#e8a33d,#f3d36b,#9cc59a,#7fb2d9,#a99be0,#e8798a)' }}>
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(color) ? color : '#82001a'} onChange={(e) => {
            set('color', e.target.value)
            if (sel) edit(selected!, { c: e.target.value })
          }} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Elegir otro color" />
        </label>
      </div>
    </Section>
  )

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Estudio de pintura" className="fixed inset-0 z-[80] bg-crema text-borgona flex flex-col jl-fade">
      {/* Barra superior */}
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-borgona/15">
        <div className="min-w-0">
          <p className="m-0 font-display font-light text-[21px] sm:text-[30px] leading-none whitespace-nowrap">Estudio de pintura</p>
          <p className="m-0 mt-1 text-[12px] truncate">{surfaceName} · pinta directo sobre la pieza</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={undo} disabled={!strokes.length} title="Deshacer (Ctrl+Z)" className="h-11 px-3 sm:px-4 rounded-full border border-borgona/30 bg-transparent text-borgona text-[13px] font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
            ↶<span className="hidden sm:inline"> Deshacer</span>
          </button>
          <button type="button" onClick={redoLast} disabled={!redo.length} title="Rehacer (Ctrl+Shift+Z)" className="h-11 px-3 sm:px-4 rounded-full border border-borgona/30 bg-transparent text-borgona text-[13px] font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
            ↷<span className="hidden sm:inline"> Rehacer</span>
          </button>
          <button type="button" onClick={onClose} className="h-11 px-5 sm:px-7 rounded-full bg-borgona text-crema border-0 text-[14px] font-semibold cursor-pointer">
            Listo
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-[1fr_400px]">
        {/* Lienzo */}
        <div className="jl-studio relative flex items-center justify-center p-3 sm:p-6 h-[50vh] lg:h-auto flex-none lg:min-h-0">
          {can3d && (
            <div className="absolute top-3 left-3 z-10 flex p-1 rounded-full bg-[#2a0a10]/45 backdrop-blur-sm" role="group" aria-label="Dónde pintar">
              {(['plano', '3d'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onPointerEnter={v === '3d' ? preload3D : undefined}
                  onTouchStart={v === '3d' ? preload3D : undefined}
                  onClick={() => {
                    setView(v)
                    setSelected(null)
                  }}
                  className={`h-9 px-4 rounded-full border-0 text-[12px] font-semibold tracking-[1px] cursor-pointer transition-colors ${view === v ? 'bg-crema text-borgona' : 'bg-transparent text-crema'}`}
                >
                  {v === 'plano' ? 'Pintar en plano' : 'Pintar en 3D'}
                </button>
              ))}
            </div>
          )}
          <div className="relative h-full max-w-full" style={{ aspectRatio: '600 / 740' }}>
            {in3d ? (
              <Suspense fallback={<p className="absolute inset-0 m-0 flex items-center justify-center text-crema text-[13px] tracking-[2px] uppercase font-semibold">Cargando 3D…</p>}>
                <Tote3D kind={kind} surface={design.surface} getDesignSvg={getLayer} version={version} paint={full ? undefined : draw} />
              </Suspense>
            ) : (
              <ToteCanvas design={design} draw={full ? undefined : draw} showPedestal={false} zoom />
            )}
          </div>
          {in3d && (
            <div className="hidden" aria-hidden="true">
              <ToteCanvas ref={layerRef} design={design} layer="design" />
            </div>
          )}
          {full && <p className="absolute bottom-3 left-1/2 -translate-x-1/2 m-0 px-4 py-2 rounded-full bg-crema text-[12px] font-semibold">Ya no cabe ni una pincelada. Deshaz algún trazo para seguir.</p>}
          <Aviso
            open={fullAsk}
            onClose={() => setFullAsk(false)}
            eyebrow="Lienzo lleno"
            title="Ya no cabe"
            accent="ni una pincelada"
            body="Tu lienzo está lleno de ideas. Deshaz algunos trazos o usa la goma para hacerle espacio a la siguiente."
            primary={{ label: 'Deshacer el último', onClick: () => { undo(); setFullAsk(false) } }}
            secondary={{ label: 'Así me gusta', onClick: () => setFullAsk(false) }}
          />
        </div>

        {/* Herramientas */}
        <aside className="flex-1 min-h-0 overflow-y-auto border-t lg:border-t-0 lg:border-l border-borgona/15 px-4 sm:px-6 py-5 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-rosa/50" role="tablist">
            {(['pincel', 'sticker'] as const).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => {
                setTab(t)
                setSelected(null)
              }} className={`h-11 rounded-full border-0 text-[14px] font-semibold cursor-pointer transition-colors ${tab === t ? 'bg-borgona text-crema' : 'bg-transparent text-borgona'}`}>
                {t === 'pincel' ? 'Pinceles' : 'Stickers'}
              </button>
            ))}
          </div>

          {tab === 'pincel' ? (
            <>
              <Section title="Pincel">
                <div className="grid grid-cols-2 gap-2">
                  {brushes.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      aria-pressed={tools.brush === b.id}
                      onClick={() => set('brush', b.id)}
                      className={`text-left rounded-[16px] border p-2.5 cursor-pointer transition-colors flex flex-col gap-1 ${tools.brush === b.id ? 'border-borgona bg-rosa/50' : 'border-borgona/20 bg-transparent hover:border-borgona/50'} text-borgona`}
                    >
                      <span className="rounded-[10px] px-1" style={tileBg}>
                        <BrushSample b={b.id} color={shown} />
                      </span>
                      <span className="text-[13px] font-semibold leading-tight">{b.name}</span>
                      <span className="text-[11px] leading-tight opacity-80">{b.sub}</span>
                    </button>
                  ))}
                </div>
              </Section>
              {tools.brush !== 'goma' && swatchRow}
              <Section title="Ajustes">
                <Slider label="Grosor" value={tools.size} min={2} max={44} onChange={(v) => set('size', v)} />
                {tools.brush !== 'goma' && <Slider label="Opacidad" value={Math.round(tools.opacity * 100)} min={15} max={100} step={5} suffix="%" onChange={(v) => set('opacity', v / 100)} />}
                <div className="flex items-center justify-center h-[64px] rounded-[14px] border border-borgona/15" style={tileBg} aria-hidden="true">
                  <span className="rounded-full" style={{ width: tools.size, height: tools.size, background: tools.brush === 'goma' ? 'transparent' : color, opacity: tools.opacity, border: tools.brush === 'goma' ? '1.5px dashed #82001a' : '1px solid rgba(130,0,26,.2)' }} />
                </div>
              </Section>
            </>
          ) : (
            <>
              {sel ? (
                <div className="jl-fade rounded-[18px] border-2 border-borgona bg-rosa/40 p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold tracking-[2px] uppercase">Sticker seleccionado</span>
                    <button type="button" onClick={() => setSelected(null)} className="h-8 px-4 rounded-full bg-borgona text-crema border-0 text-[12px] font-semibold cursor-pointer">
                      Listo
                    </button>
                  </div>
                  <p className="m-0 text-[12px] leading-[1.5]">Arrástralo para moverlo. Usa el círculo de la esquina para girarlo y cambiar su tamaño, o los controles de abajo.</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { l: 'Duplicar', f: duplicate },
                      { l: 'Voltear', f: () => editSelected({ f: !sel.f }) },
                      { l: 'Al frente', f: toFront },
                      { l: 'Eliminar', f: () => editSelected(null) },
                    ].map((b) => (
                      <button key={b.l} type="button" onClick={b.f} className="h-10 rounded-full border border-borgona/40 bg-crema text-borgona text-[12px] font-semibold cursor-pointer hover:border-borgona">
                        {b.l}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="m-0 -mb-2 text-[12px] leading-[1.5]">Elige un sticker y toca la pieza para colocarlo. Toca cualquier sticker ya puesto para moverlo, girarlo o cambiar su tamaño.</p>
              )}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 h-12 px-4 rounded-full border border-borgona/30 focus-within:border-borgona bg-white/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar: reno, luna, calavera…"
                    aria-label="Buscar sticker"
                    className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[14px] text-borgona placeholder:text-borgona/50"
                  />
                  {query && (
                    <button type="button" onClick={() => setQuery('')} aria-label="Borrar búsqueda" className="bg-transparent border-0 p-0 text-borgona text-[18px] leading-none cursor-pointer">
                      ×
                    </button>
                  )}
                </label>

                {results ? (
                  <Section title={`${results.length} resultado${results.length === 1 ? '' : 's'}`} aside={<span className="text-[11px]">Toca la pieza para colocarlo</span>}>
                    {results.length === 0 ? (
                      <p className="m-0 text-[13px]">No encontramos ese sticker. Prueba con otra palabra o pinta el tuyo con los pinceles.</p>
                    ) : (
                      <div className="grid grid-cols-5 gap-2">
                        {results.map((k) => (
                          <button
                            key={k.id}
                            type="button"
                            aria-label={k.name}
                            title={k.name}
                            aria-pressed={tools.sticker === k.id}
                            onClick={() => set('sticker', k.id)}
                            className={`aspect-square rounded-[14px] flex items-center justify-center cursor-pointer transition-[box-shadow] ${tools.sticker === k.id ? 'border-2 border-borgona shadow-[0_0_0_3px_#fad9cd]' : 'border border-borgona/20 hover:border-borgona/60'}`}
                            style={tileBg}
                          >
                            <svg viewBox="-15 -15 30 30" className="w-[64%] h-[64%]" aria-hidden="true">
                              <StickerArt k={k.id} c={shown} />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </Section>
                ) : !cat ? (
                  <Section title="Categorías" aside={<span className="text-[11px]">{(index?.reduce((n, c) => n + c.count, 0) ?? 0) + stickers.length} stickers</span>}>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ id: 'juliette', name: 'Julietté', count: stickers.length, cover: null }, ...(index ?? [])].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCat(c.id)}
                          className="rounded-[16px] border border-borgona/20 hover:border-borgona bg-transparent text-borgona cursor-pointer p-2.5 flex flex-col items-center gap-1.5 text-center transition-colors"
                        >
                          <span className="w-12 h-12 rounded-full flex items-center justify-center border border-borgona/15" style={tileBg}>
                          <svg viewBox={c.cover ? `0 0 ${c.cover.w} ${c.cover.h}` : '-15 -15 30 30'} className="w-7 h-7" style={{ color: shown }} aria-hidden="true">
                            {c.cover ? <g dangerouslySetInnerHTML={{ __html: c.cover.body }} /> : <StickerArt k="cereza" c={shown} />}
                          </svg>
                          </span>
                          <span className="text-[12px] font-semibold leading-tight">{c.name}</span>
                          <span className="text-[11px] opacity-60">{c.count}</span>
                        </button>
                      ))}
                      {!index && Array.from({ length: 8 }, (_, i) => <span key={i} className="h-[92px] rounded-[16px] bg-borgona/5 animate-pulse" />)}
                    </div>
                  </Section>
                ) : (
                  <Section
                    title={`${current?.name ?? ''} · ${current?.count ?? ''}`}
                    aside={
                      <button type="button" onClick={() => setCat(null)} className="jl-link bg-transparent border-0 p-0 text-borgona text-[12px] font-semibold cursor-pointer">
                        ← Categorías
                      </button>
                    }
                  >
                    <div className="grid grid-cols-5 gap-2">
                      {(cat === 'juliette' ? stickers : library ?? []).map((k) => (
                        <button
                          key={k.id}
                          type="button"
                          aria-label={k.name}
                          title={k.name}
                          aria-pressed={tools.sticker === k.id}
                          onClick={() => set('sticker', k.id)}
                          className={`aspect-square rounded-[14px] flex items-center justify-center cursor-pointer transition-[box-shadow] ${tools.sticker === k.id ? 'border-2 border-borgona shadow-[0_0_0_3px_#fad9cd]' : 'border border-borgona/20 hover:border-borgona/60'}`}
                            style={tileBg}
                        >
                          <svg viewBox="-15 -15 30 30" className="w-[64%] h-[64%]" aria-hidden="true">
                            <StickerArt k={k.id} c={shown} />
                          </svg>
                        </button>
                      ))}
                      {cat !== 'juliette' && !library && Array.from({ length: current?.count ?? 10 }, (_, i) => <span key={i} className="aspect-square rounded-[14px] bg-borgona/5 animate-pulse" />)}
                    </div>
                    <p className="m-0 text-[11px]">Elige uno y toca la pieza para colocarlo.</p>
                  </Section>
                )}
              </div>
              {swatchRow}
              <Section title="Ajustes">
                {sel ? (
                  <>
                    <Slider label="Tamaño" value={Math.round(sel.s * 12)} min={5} max={140} onChange={(v) => edit(selected!, { s: v / 12 })} />
                    <Slider label="Giro" value={Math.round(sel.r ?? 0)} min={-180} max={180} step={5} suffix="°" onChange={(v) => edit(selected!, { r: v })} />
                  </>
                ) : (
                  <>
                    <Slider label="Tamaño" value={tools.stickerSize} min={10} max={110} onChange={(v) => set('stickerSize', v)} />
                    <Slider label="Giro" value={tools.rotation} min={-180} max={180} step={5} suffix="°" onChange={(v) => set('rotation', v)} />
                  </>
                )}
              </Section>
            </>
          )}

          <label className="flex items-start gap-3 cursor-pointer text-[13px] leading-[1.5]">
            <input type="checkbox" checked={tools.mirror} onChange={(e) => set('mirror', e.target.checked)} className="mt-1 w-5 h-5 accent-[#82001a]" />
            <span>
              <strong>Modo espejo</strong>
              <br />
              Lo que pintes de un lado se repite del otro, para diseños simétricos.
            </span>
          </label>

          <div className="flex flex-col gap-2 pt-2 border-t border-borgona/15">
            <div className="h-[4px] rounded-full bg-borgona/10 overflow-hidden" aria-hidden="true">
              <span className="block h-full bg-borgona transition-[width]" style={{ width: `${Math.min(100, (used / MAX_POINTS) * 100)}%` }} />
            </div>
            <div className="flex items-center justify-between gap-3 text-[12px]">
              <span>{strokes.length} trazos</span>
              <button type="button" onClick={clear} disabled={!strokes.length} className="jl-link bg-transparent border-0 p-0 text-borgona text-[12px] font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                Borrar todo
              </button>
            </div>
            <p className="m-0 text-[12px] leading-[1.6] opacity-90">Tu dibujo es la guía: Julietté lo convierte en un boceto y lo pinta a mano sobre la pieza real.</p>
            <p className="m-0 text-[10px] leading-[1.5] opacity-60">Stickers ilustrados basados en Fluent Emoji de Microsoft (licencia MIT).</p>
          </div>
        </aside>
      </div>
    </div>,
    document.body,
  )
}
