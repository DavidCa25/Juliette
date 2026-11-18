/**
 * Motor del estudio de pintura: pinceles, stickers y capa de trazos.
 * Todo se dibuja en SVG dentro de la vista previa (600 × 740), así el boceto exportado incluye lo que pintó el cliente.
 */
import { memo, type ReactNode } from 'react'
import type { BrushId, StickerId, Stroke } from '../../data/design'
import { isLibrarySticker, useLibrarySticker } from './stickerLibrary'

const CREAM = '#fdf6ee'

export const brushes: { id: BrushId; name: string; sub: string }[] = [
  { id: 'pincel', name: 'Pincel', sub: 'Redondo, con textura' },
  { id: 'plumon', name: 'Plumón', sub: 'Línea fina y limpia' },
  { id: 'acuarela', name: 'Acuarela', sub: 'Suave y transparente' },
  { id: 'seca', name: 'Brocha seca', sub: 'Cerdas marcadas' },
  { id: 'aerosol', name: 'Aerosol', sub: 'Puntitos difuminados' },
  { id: 'caligrafia', name: 'Caligrafía', sub: 'Punta biselada' },
  { id: 'marcador', name: 'Marcador', sub: 'Plano y translúcido' },
  { id: 'goma', name: 'Goma', sub: 'Borra lo que pintaste' },
]

export const stickers: { id: StickerId; name: string }[] = [
  { id: 'estrella', name: 'Estrella' },
  { id: 'destello', name: 'Destellos' },
  { id: 'estrella5', name: 'Estrella clásica' },
  { id: 'corazon', name: 'Corazón' },
  { id: 'corazon-linea', name: 'Corazón de línea' },
  { id: 'cereza', name: 'Cerezas' },
  { id: 'mono', name: 'Moño' },
  { id: 'flor', name: 'Flor' },
  { id: 'margarita', name: 'Margarita' },
  { id: 'hoja', name: 'Hoja' },
  { id: 'mariposa', name: 'Mariposa' },
  { id: 'galaxia', name: 'Galaxia' },
  { id: 'luna', name: 'Luna' },
  { id: 'sol', name: 'Sol' },
  { id: 'nube', name: 'Nube' },
  { id: 'nota', name: 'Nota musical' },
  { id: 'gota', name: 'Gota' },
]

/** Colores sugeridos: los de la marca primero, luego tonos de pintura textil. */
export const swatches = [
  '#82001a', '#c23b4e', '#e8798a', '#fad9cd', '#fdf6ee', '#ffffff',
  '#1a1a1a', '#5a5a5a', '#8a5a33', '#e8a33d', '#f3d36b', '#3f7a52',
  '#9cc59a', '#2f5d8a', '#7fb2d9', '#6f5bb5', '#a99be0', '#5f272d',
]

const STAR4 = 'M0 -12C1 -4 4 -1 12 0C4 1 1 4 0 12C-1 4 -4 1 -12 0C-4 -1 -1 -4 0 -12Z'
const STAR5 = 'M0 -12 L3.5 -3.7 L11.4 -3.7 L5 1.4 L7.1 9.7 L0 4.9 L-7.1 9.7 L-5 1.4 L-11.4 -3.7 L-3.5 -3.7 Z'
const HEART = 'M0 10 C-4.5 6.5 -12 1 -12 -4.5 C-12 -9.5 -6.5 -12 -3.2 -9.8 C-1.6 -8.7 -0.5 -7.4 0 -6 C0.5 -7.4 1.6 -8.7 3.2 -9.8 C6.5 -12 12 -9.5 12 -4.5 C12 1 4.5 6.5 0 10 Z'

/** Dibujo de cada sticker, centrado en (0,0) dentro de ±12. */
/** Sticker de la biblioteca: ilustración de un solo color que toma el tono elegido. */
export function LibraryStickerArt({ id, c }: { id: string; c: string }) {
  const it = useLibrarySticker(id)
  if (!it) return <circle r={6} fill={c} opacity={0.15} />
  const k = 24 / Math.max(it.w, it.h)
  return <g transform={`scale(${k}) translate(${-it.w / 2} ${-it.h / 2})`} style={{ color: c }} dangerouslySetInnerHTML={{ __html: it.body }} />
}

export function StickerArt({ k, c }: { k: StickerId | string; c: string }): ReactNode {
  if (isLibrarySticker(k)) return <LibraryStickerArt id={k} c={c} />
  switch (k) {
    case 'estrella':
      return <path d={STAR4} fill={c} />
    case 'destello':
      return (
        <g fill={c}>
          <path d={STAR4} transform="translate(-3 -2) scale(.7)" />
          <path d={STAR4} transform="translate(8 -8) scale(.34)" />
          <path d={STAR4} transform="translate(7 8) scale(.28)" />
        </g>
      )
    case 'estrella5':
      return <path d={STAR5} fill={c} strokeLinejoin="round" stroke={c} strokeWidth={1.2} />
    case 'corazon':
      return <path d={HEART} fill={c} />
    case 'corazon-linea':
      return <path d={HEART} fill="none" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
    case 'cereza':
      return (
        <g>
          <path d="M-4 3 C-2 -6 1 -10 6 -12 M3 5 C3.5 -3 4.5 -8 6 -12" fill="none" stroke={c} strokeWidth={1.3} strokeLinecap="round" />
          <path d="M6 -12 C9 -13 12 -11 11 -8 C8 -8 6 -10 6 -12 Z" fill={c} opacity={0.8} />
          <circle cx={-5} cy={7} r={5} fill={c} />
          <circle cx={4} cy={9} r={5} fill={c} />
          <ellipse cx={-6.7} cy={5.3} rx={1} ry={1.8} fill={CREAM} opacity={0.85} />
          <ellipse cx={2.3} cy={7.3} rx={1} ry={1.8} fill={CREAM} opacity={0.85} />
        </g>
      )
    case 'mono':
      return (
        <g fill="none" stroke={c} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 -4 C-3 -10 -12 -12 -12 -6 C-12 -1 -5 -1 0 -4 Z" />
          <path d="M0 -4 C3 -10 12 -12 12 -6 C12 -1 5 -1 0 -4 Z" />
          <path d="M-1 -3 C-4 2 -6 7 -9 11 M1 -3 C4 2 6 7 9 11" />
          <ellipse cx={0} cy={-4} rx={2.2} ry={2} fill={CREAM} />
        </g>
      )
    case 'flor':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={0} cy={-6} rx={4.2} ry={6.2} transform={`rotate(${a})`} fill={c} />
          ))}
          <circle r={3} fill={CREAM} />
        </g>
      )
    case 'margarita':
      return (
        <g>
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse key={i} cx={0} cy={-7} rx={2.2} ry={5.5} transform={`rotate(${i * 30})`} fill="#ffffff" stroke={c} strokeWidth={0.9} />
          ))}
          <circle r={3.6} fill={c} />
        </g>
      )
    case 'hoja':
      return (
        <g>
          <path d="M-10 10 C-12 -4 -2 -12 11 -11 C11 2 2 11 -10 10 Z" fill={c} />
          <path d="M-9 9 C-3 2 3 -4 9 -9" fill="none" stroke={CREAM} strokeWidth={1} opacity={0.7} strokeLinecap="round" />
        </g>
      )
    case 'mariposa':
      return (
        <g fill={c}>
          <ellipse cx={-5.5} cy={-4} rx={5.6} ry={7.4} transform="rotate(-25 -5.5 -4)" />
          <ellipse cx={5.5} cy={-4} rx={5.6} ry={7.4} transform="rotate(25 5.5 -4)" />
          <ellipse cx={-4} cy={5.5} rx={3.6} ry={4.6} transform="rotate(30 -4 5.5)" opacity={0.8} />
          <ellipse cx={4} cy={5.5} rx={3.6} ry={4.6} transform="rotate(-30 4 5.5)" opacity={0.8} />
          <rect x={-0.9} y={-8} width={1.8} height={17} rx={0.9} fill="#1a1a1a" opacity={0.75} />
          <circle cx={-5.6} cy={-4.6} r={1.6} fill={CREAM} opacity={0.75} />
          <circle cx={5.6} cy={-4.6} r={1.6} fill={CREAM} opacity={0.75} />
        </g>
      )
    case 'galaxia':
      return (
        <g fill="none" stroke={c} strokeLinecap="round">
          <path d="M0 0 C4 -2 6 2 3 5 C-2 9 -9 4 -8 -3 C-7 -10 3 -13 9 -8" strokeWidth={2.2} />
          <path d="M0 0 C-4 2 -6 -2 -3 -5 C2 -9 9 -4 8 3 C7 10 -3 13 -9 8" strokeWidth={2.2} opacity={0.75} />
          <circle r={2.4} fill={c} stroke="none" />
          <circle cx={-10} cy={-9} r={0.9} fill={c} stroke="none" />
          <circle cx={11} cy={9} r={0.9} fill={c} stroke="none" />
          <circle cx={10} cy={-11} r={0.6} fill={c} stroke="none" />
          <circle cx={-11} cy={10} r={0.6} fill={c} stroke="none" />
        </g>
      )
    case 'luna':
      return <path d="M2 -11 A11 11 0 1 0 11 5 A9 9 0 1 1 2 -11 Z" fill={c} />
    case 'sol':
      return (
        <g fill={c}>
          <circle r={5.5} />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={-1.1} y={-12} width={2.2} height={4.6} rx={1.1} transform={`rotate(${i * 45})`} />
          ))}
        </g>
      )
    case 'nube':
      return <path d="M-9 6 C-13 6 -13 0 -9 -1 C-9 -6 -3 -8 0 -4 C2 -9 10 -8 9 -2 C13 -2 13 6 9 6 Z" fill={c} />
    case 'nota':
      return (
        <g fill={c}>
          <ellipse cx={-5} cy={7} rx={4.2} ry={3.2} transform="rotate(-20 -5 7)" />
          <rect x={-2.2} y={-10} width={1.8} height={17} />
          <path d="M-0.4 -10 C4 -8 8 -6 7 0 C6 -4 3 -5 -0.4 -5 Z" />
        </g>
      )
    case 'gota':
      return (
        <g>
          <path d="M0 -12 C5 -4 9 1 9 5 C9 10 5 12 0 12 C-5 12 -9 10 -9 5 C-9 1 -5 -4 0 -12 Z" fill={c} />
          <ellipse cx={-3.5} cy={4} rx={1.4} ry={2.6} fill={CREAM} opacity={0.7} />
        </g>
      )
    default:
      return <path d={STAR4} fill={c} />
  }
}

/** Curva suave por los puntos medios. */
export function smoothPath(p: number[]) {
  if (p.length < 4) return `M${p[0]} ${p[1]} l0.1 0`
  let d = `M${p[0]} ${p[1]}`
  for (let i = 2; i < p.length - 2; i += 2) {
    const mx = (p[i] + p[i + 2]) / 2
    const my = (p[i + 1] + p[i + 3]) / 2
    d += ` Q${p[i]} ${p[i + 1]} ${mx.toFixed(1)} ${my.toFixed(1)}`
  }
  return d + ` L${p[p.length - 2]} ${p[p.length - 1]}`
}

/** Generador pseudoaleatorio con semilla, para que el aerosol se vea igual cada vez. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function sprayPath(p: number[], w: number, seed: number) {
  const rand = rng(seed)
  const n = Math.max(4, Math.round(w * 0.9))
  let d = ''
  for (let i = 0; i < p.length; i += 2) {
    for (let j = 0; j < n; j++) {
      const ang = rand() * Math.PI * 2
      const r = Math.sqrt(rand()) * w
      const x = p[i] + Math.cos(ang) * r
      const y = p[i + 1] + Math.sin(ang) * r
      const s = 0.5 + rand() * 0.9
      d += `M${(x - s).toFixed(1)} ${y.toFixed(1)}a${s.toFixed(1)} ${s.toFixed(1)} 0 1 0 ${(2 * s).toFixed(1)} 0a${s.toFixed(1)} ${s.toFixed(1)} 0 1 0 ${(-2 * s).toFixed(1)} 0`
    }
  }
  return d
}

/** Trazo de punta biselada (45°): un contorno que se ensancha según la dirección. */
function nibPath(p: number[], w: number) {
  const vx = Math.cos(-Math.PI / 4) * (w / 2)
  const vy = Math.sin(-Math.PI / 4) * (w / 2)
  const left: string[] = []
  const right: string[] = []
  for (let i = 0; i < p.length; i += 2) {
    left.push(`${(p[i] + vx).toFixed(1)} ${(p[i + 1] + vy).toFixed(1)}`)
    right.unshift(`${(p[i] - vx).toFixed(1)} ${(p[i + 1] - vy).toFixed(1)}`)
  }
  return `M${left.join(' L')} L${right.join(' L')} Z`
}

export type PaintFilters = { paint: string; water: string; dry: string }

function LineStroke({ st, i, f }: { st: Extract<Stroke, { t: 'line' }>; i: number; f: PaintFilters }) {
  const b = st.b ?? 'pincel'
  const o = st.o ?? 1
  const d = smoothPath(st.p)
  const round = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (b) {
    case 'plumon':
      return <path d={d} {...round} stroke={st.c} strokeWidth={st.w} opacity={o} />
    case 'acuarela':
      return (
        <g filter={`url(#${f.water})`} opacity={0.55 * o}>
          <path d={d} {...round} stroke={st.c} strokeWidth={st.w * 1.6} opacity={0.55} />
          <path d={d} {...round} stroke={st.c} strokeWidth={st.w * 0.8} opacity={0.6} />
        </g>
      )
    case 'seca':
      return <path d={d} {...round} stroke={st.c} strokeWidth={st.w * 1.2} opacity={o} filter={`url(#${f.dry})`} />
    case 'aerosol':
      return <path d={sprayPath(st.p, st.w, i * 7919 + st.p.length)} fill={st.c} opacity={0.85 * o} />
    case 'caligrafia':
      return <path d={nibPath(st.p, st.w)} fill={st.c} opacity={o} stroke={st.c} strokeWidth={0.6} strokeLinejoin="round" />
    case 'marcador':
      return <path d={d} fill="none" strokeLinecap="butt" strokeLinejoin="round" stroke={st.c} strokeWidth={st.w * 1.3} opacity={0.55 * o} />
    default:
      return <path d={d} {...round} stroke={st.c} strokeWidth={st.w} opacity={0.96 * o} filter={`url(#${f.paint})`} />
  }
}

function StickerStroke({ st }: { st: Extract<Stroke, { t: 'stamp' }> }) {
  return (
    <g transform={`translate(${st.x} ${st.y}) rotate(${st.r ?? 0}) scale(${st.f ? -st.s : st.s} ${st.s})`} filter={undefined}>
      <StickerArt k={st.k} c={st.c} />
    </g>
  )
}

/**
 * Capa de lo pintado. La goma usa máscaras en orden: cada borrón solo afecta a lo pintado antes,
 * así lo que se pinte después sobre esa zona sí se ve.
 */
export const StrokesLayer = memo(function StrokesLayer({ strokes, uid, f }: { strokes: Stroke[]; uid: string; f: PaintFilters }) {
  let content: ReactNode[] = []
  const masks: ReactNode[] = []
  strokes.forEach((st, i) => {
    if (st.t === 'line' && st.b === 'goma') {
      const id = `jl-erase-${uid}-${i}`
      masks.push(
        <mask key={id} id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={600} height={740}>
          <rect x={0} y={0} width={600} height={740} fill="#fff" />
          <path d={smoothPath(st.p)} fill="none" stroke="#000" strokeWidth={st.w * 1.4} strokeLinecap="round" strokeLinejoin="round" />
        </mask>,
      )
      content = [
        <g key={`m${i}`} mask={`url(#${id})`}>
          {content}
        </g>,
      ]
      return
    }
    content.push(st.t === 'line' ? <LineStroke key={i} st={st} i={i} f={f} /> : <StickerStroke key={i} st={st} />)
  })
  return (
    <>
      <defs>{masks}</defs>
      {content}
    </>
  )
})

/** Vista previa del trazo que se está pintando (sin filtros, para que responda rápido). */
export function LiveStroke({ p, brush, color, size, opacity }: { p: number[]; brush: BrushId; color: string; size: number; opacity: number }) {
  if (brush === 'goma') return <path d={smoothPath(p)} fill="none" stroke="#fdf6ee" strokeOpacity={0.85} strokeWidth={size * 1.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 6" />
  if (brush === 'caligrafia') return <path d={nibPath(p, size)} fill={color} opacity={opacity} />
  if (brush === 'aerosol') return <path d={sprayPath(p, size, 1)} fill={color} opacity={0.85 * opacity} />
  const w = brush === 'acuarela' ? size * 1.4 : brush === 'marcador' ? size * 1.3 : brush === 'seca' ? size * 1.2 : size
  const o = brush === 'acuarela' ? 0.4 : brush === 'marcador' ? 0.5 : 1
  return <path d={smoothPath(p)} fill="none" stroke={color} strokeWidth={w} opacity={o * opacity} strokeLinecap="round" strokeLinejoin="round" />
}

/** Filtros de textura para la acuarela y la brocha seca. */
export function PaintDefs({ water, dry }: { water: string; dry: string }) {
  return (
    <>
      <filter id={water} x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="11" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feGaussianBlur in="d" stdDeviation="1.6" />
      </filter>
      <filter id={dry} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.08" numOctaves="2" seed="4" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 9 -4.2" result="mask" />
        <feComposite in="SourceGraphic" in2="mask" operator="in" result="c" />
        <feDisplacementMap in="c" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </>
  )
}
