import { forwardRef, memo, useCallback, useId, useImperativeHandle, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { Isotipo } from '../brand/Isotipo'
import { STAR_PATH } from '../ui'
import { MAX_POINTS, fonts, palettes, sizes, surfaces, type BrushId, type Design, type MotifId, type StickerId, type Stroke, type Surface, type SurfaceKind } from '../../data/design'
import { LiveStroke, PaintDefs, StrokesLayer } from './paint'

const CREAM = '#fdf6ee'

function Butterfly({ x, y, r = 0, s = 1, c1, c2, c3 }: { x: number; y: number; r?: number; s?: number; c1: string; c2: string; c3: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <ellipse cx={-17} cy={-12} rx={18} ry={24} transform="rotate(-25 -17 -12)" fill={c1} />
      <ellipse cx={17} cy={-12} rx={18} ry={24} transform="rotate(25 17 -12)" fill={c1} />
      <ellipse cx={-12} cy={16} rx={11} ry={15} transform="rotate(30 -12 16)" fill={c2} />
      <ellipse cx={12} cy={16} rx={11} ry={15} transform="rotate(-30 12 16)" fill={c2} />
      <circle cx={-18} cy={-14} r={5} fill={CREAM} opacity={0.8} />
      <circle cx={18} cy={-14} r={5} fill={CREAM} opacity={0.8} />
      <path d="M0 -26 L0 30" stroke={c3} strokeWidth={4} strokeLinecap="round" />
      <path d="M0 -26 C-6 -40 -12 -44 -16 -46 M0 -26 C6 -40 12 -44 16 -46" stroke={c3} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </g>
  )
}

function Flower({ x, y, s = 1, c1, c2 }: { x: number; y: number; s?: number; c1: string; c2: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={0} cy={-15} rx={10} ry={15} transform={`rotate(${a})`} fill={c1} />
      ))}
      <circle r={7} fill={c2} />
    </g>
  )
}

/** Dibuja el motivo centrado en (0,0), dentro de un área aproximada de ±120. */
export function MotifArt({ motif, colors, reference, onDark = false }: { motif: MotifId; colors: [string, string, string]; reference?: string | null; onDark?: boolean }) {
  const [c1, c2, c3] = colors
  switch (motif) {
    case 'cerezas':
      // Isotipo oficial: en telas oscuras se usa la versión monocroma blanca (guía de marca: nunca bajo contraste)
      return <Isotipo x={-98} y={-130} width={196} height={259} color={onDark ? '#ffffff' : c1} />
    case 'celestial':
      return (
        <g>
          <path d="M-20 -110 A70 70 0 1 0 50 -10 A55 55 0 1 1 -20 -110 Z" fill={c1} />
          <path transform="translate(60 -90) scale(1.6)" d={STAR_PATH} fill={c2} />
          <path transform="translate(-95 10) scale(1.1)" d={STAR_PATH} fill={c1} />
          <path transform="translate(80 70) scale(.9)" d={STAR_PATH} fill={c2} />
          <path transform="translate(-40 90) scale(.7)" d={STAR_PATH} fill={c3} />
          <circle cx={30} cy={50} r={28} fill={c2} />
          <ellipse cx={30} cy={50} rx={50} ry={12} transform="rotate(-18 30 50)" fill="none" stroke={c3} strokeWidth={3} />
          <circle cx={-80} cy={-70} r={3} fill={c3} />
          <circle cx={100} cy={0} r={3} fill={c3} />
          <circle cx={-10} cy={110} r={3} fill={c1} />
        </g>
      )
    case 'floral':
      return (
        <g>
          <g stroke={c3} strokeWidth={3} fill="none" strokeLinecap="round">
            <path d="M-50 -40 C-40 20 -20 60 0 110" />
            <path d="M50 -60 C40 0 20 60 0 110" />
            <path d="M0 -10 C0 40 0 80 0 110" />
          </g>
          <ellipse cx={-26} cy={40} rx={9} ry={18} transform="rotate(-40 -26 40)" fill={c3} />
          <ellipse cx={28} cy={30} rx={9} ry={18} transform="rotate(40 28 30)" fill={c3} />
          <ellipse cx={10} cy={80} rx={8} ry={16} transform="rotate(30 10 80)" fill={c3} />
          <Flower x={-50} y={-50} s={1.25} c1={c1} c2={c2} />
          <Flower x={50} y={-70} s={1.1} c1={c2} c2={c1} />
          <Flower x={0} y={-20} s={1.4} c1={c1} c2={CREAM} />
          <Flower x={-80} y={50} s={0.7} c1={c2} c2={c1} />
          <Flower x={78} y={40} s={0.8} c1={c1} c2={c2} />
        </g>
      )
    case 'mariposas':
      return (
        <g>
          <Butterfly x={-30} y={-50} r={-14} s={1.5} c1={c1} c2={c2} c3={c3} />
          <Butterfly x={62} y={30} r={18} s={1.05} c1={c2} c2={c1} c3={c3} />
          <Butterfly x={-62} y={70} r={-6} s={0.85} c1={c1} c2={c2} c3={c3} />
          <path d="M-70 -110 C-20 -130 60 -120 100 -70" stroke={c3} strokeWidth={1.6} strokeDasharray="2 7" fill="none" strokeLinecap="round" />
        </g>
      )
    case 'lienzo':
      // Muestra para la tarjeta "Dibújala tú": un trazo libre con un pincel
      return (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-96 40 C-70 -40 -30 -70 0 -30 C26 6 46 40 76 -6 C92 -30 100 -56 92 -86" stroke={c1} strokeWidth={14} />
          <path d="M-80 86 C-40 64 10 92 60 70" stroke={c2} strokeWidth={9} />
          <g transform="translate(70 -96) rotate(38)">
            <rect x={-7} y={0} width={14} height={92} rx={7} fill="#b2875a" stroke="none" />
            <rect x={-8} y={-10} width={16} height={18} rx={3} fill="#c9ccd1" stroke="none" />
            <path d="M-8 -10 Q0 -42 8 -10 Z" fill={c1} stroke="none" />
          </g>
        </g>
      )
    case 'mi-idea':
      return reference ? (
        <g>
          <clipPath id="jl-ref-clip">
            <rect x={-115} y={-135} width={230} height={270} rx={18} />
          </clipPath>
          <image href={reference} x={-115} y={-135} width={230} height={270} preserveAspectRatio="xMidYMid slice" clipPath="url(#jl-ref-clip)" style={{ mixBlendMode: 'multiply' }} />
        </g>
      ) : (
        <g>
          <rect x={-110} y={-120} width={220} height={240} rx={18} fill="none" stroke={c1} strokeWidth={2} strokeDasharray="6 8" />
          <path transform="translate(0 -20) scale(1.6)" d={STAR_PATH} fill={c1} />
          <text y={40} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize={15} fontWeight={600} fill={c1}>Tu referencia</text>
          <text y={62} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize={15} fontWeight={600} fill={c1}>aparecerá aquí</text>
        </g>
      )
    default:
      return null
  }
}

/** Zona pintable de cada tipo de pieza: centro, posiciones del texto y escala del motivo. */
const geometry: Record<SurfaceKind, { cy: number; text: Record<'arriba' | 'centro' | 'abajo', number>; k: number; up: number; down: number }> = {
  tote: { cy: 455, text: { arriba: 318, centro: 455, abajo: 612 }, k: 1, up: 490, down: 425 },
  sudadera: { cy: 362, text: { arriba: 284, centro: 362, abajo: 440 }, k: 0.62, up: 382, down: 338 },
  cuadro: { cy: 360, text: { arriba: 200, centro: 360, abajo: 530 }, k: 1, up: 395, down: 330 },
  agenda: { cy: 395, text: { arriba: 238, centro: 395, abajo: 560 }, k: 0.8, up: 425, down: 370 },
}

/** En telas oscuras, los tonos casi negros se vuelven crema para que el motivo se vea. */
function adaptColors(colors: [string, string, string], dark: boolean): [string, string, string] {
  if (!dark) return colors
  // Sobre tela oscura el borgoña se pierde: se usa el rosa durazno de la marca; el negro pasa a crema
  const map: Record<string, string> = { '#1a1a1a': '#fdf6ee', '#5a5a5a': '#d8d0c6', '#82001a': '#fad9cd' }
  const swap = (c: string) => map[c] ?? c
  return [swap(colors[0]), swap(colors[1]), swap(colors[2])]
}

/** Contorno pintable de cada pieza (para recortar la textura que se pone encima de la pintura). */
const TOTE_BODY = 'M138 228 H462 L474 660 Q475 676 459 676 H141 Q125 676 126 660 Z'
const SWEAT_BODY =
  'M190 196 Q150 200 128 214 Q84 236 72 290 L36 560 L32 596 Q31 612 48 614 L94 618 Q110 619 112 602 L132 380 L130 616 Q130 626 140 626 H460 Q470 626 470 616 L468 380 L488 602 Q490 619 506 618 L552 614 Q569 612 568 596 L564 560 L528 290 Q516 236 472 214 Q450 200 410 196 Q360 250 300 252 Q240 250 190 196 Z'
const HOOD_OUTER = 'M180 206 Q166 82 300 66 Q434 82 420 206 Q384 246 300 252 Q216 246 180 206 Z'
const HOOD_INNER = 'M220 200 Q214 110 300 100 Q386 110 380 200 Q352 230 300 236 Q248 230 220 200 Z'

function bodyShape(kind: SurfaceKind) {
  if (kind === 'sudadera') return <path d={SWEAT_BODY} />
  if (kind === 'cuadro') return <rect x={136} y={102} width={328} height={512} />
  if (kind === 'agenda') return <rect x={168} y={156} width={268} height={506} rx={14} />
  return <path d={TOTE_BODY} />
}

type Ids = Record<'water' | 'dry' | 'rib' | 'weave' | 'noise' | 'twill' | 'grain' | 'side' | 'top' | 'soft' | 'paint' | 'clip' | 'wood' | 'pages' | 'strap' | 'elastic', string>

/** Etiqueta tejida con el isotipo real, cosida a la pieza. */
function BrandLabel({ x, y, w, h, bg, fg, stitch, r = 0 }: { x: number; y: number; w: number; h: number; bg: string; fg: string; stitch: string; r?: number }) {
  return (
    <g transform={`rotate(${r} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 1.5} y={y + 2.5} width={w} height={h} rx={2.5} fill="#000" opacity={0.22} />
      <rect x={x} y={y} width={w} height={h} rx={2.5} fill={bg} />
      <rect x={x} y={y} width={w} height={h * 0.45} rx={2.5} fill="#fff" opacity={0.08} />
      <rect x={x + 2.5} y={y + 2.5} width={w - 5} height={h - 5} rx={1.5} fill="none" stroke={stitch} strokeWidth={0.9} strokeDasharray="2 2" opacity={0.85} />
      <Isotipo x={x + w * 0.16} y={y + h * 0.12} width={w * 0.68} height={h * 0.76} color={fg} />
    </g>
  )
}

function Pedestal() {
  return (
    <g>
      <ellipse cx={300} cy={716} rx={250} ry={18} fill="#000" opacity={0.22} />
      <path d="M80 690 Q80 676 100 676 H500 Q520 676 520 690 V700 Q520 712 500 712 H100 Q80 712 80 700 Z" fill="#efe9e3" />
      <path d="M80 696 H520 V700 Q520 712 500 712 H100 Q80 712 80 700 Z" fill="#d9d1c8" />
      <rect x={84} y={677} width={432} height={5} rx={2.5} fill="#ffffff" opacity={0.85} />
    </g>
  )
}

/** Asa de tela con grosor, brillo y doble pespunte en los bordes. */
function Handle({ dx, s, id }: { dx: number; s: Surface; id: Ids }) {
  return (
    <g transform={`translate(${dx} 0)`}>
      <path d="M205 250 C205 70 285 70 285 250" fill="none" stroke="#000" strokeOpacity={0.25} strokeWidth={24} strokeLinecap="butt" transform="translate(3 4)" />
      <path d="M205 250 C205 70 285 70 285 250" fill="none" stroke={s.trim} strokeWidth={24} strokeLinecap="butt" />
      <path d="M205 250 C205 70 285 70 285 250" fill="none" stroke={`url(#${id.strap})`} strokeWidth={24} strokeLinecap="butt" />
      <path d="M201 250 C201 66 289 66 289 250" fill="none" stroke="#fff" strokeOpacity={s.dark ? 0.1 : 0.35} strokeWidth={3} />
      <g fill="none" stroke={s.stitch} strokeWidth={1.3} strokeDasharray="3.5 3">
        <path d="M196 250 C196 60 294 60 294 250" />
        <path d="M214 250 C214 82 276 82 276 250" />
      </g>
    </g>
  )
}

/** Extremo del asa cosido al frente con refuerzo en X, como en una tote real. */
function StrapEnd({ x, s }: { x: number; s: Surface }) {
  return (
    <g>
      <rect x={x - 12} y={226} width={24} height={78} fill="#000" opacity={0.18} transform="translate(1.5 2.5)" />
      <rect x={x - 12} y={226} width={24} height={78} fill={s.trim} />
      <rect x={x - 12} y={226} width={6} height={78} fill="#000" opacity={0.06} />
      <rect x={x + 6} y={226} width={6} height={78} fill="#fff" opacity={s.dark ? 0.04 : 0.18} />
      <g fill="none" stroke={s.stitch} strokeWidth={1.3}>
        <rect x={x - 8} y={262} width={16} height={36} strokeDasharray="3 2.5" />
        <path d="M-8 262 L8 298 M8 262 L-8 298" transform={`translate(${x} 0)`} strokeDasharray="3 2.5" />
        <path d={`M${x - 8} 226 V258 M${x + 8} 226 V258`} strokeDasharray="3.5 3" />
      </g>
    </g>
  )
}

function SurfaceBase({ s, showPedestal, id }: { s: Surface; showPedestal: boolean; id: Ids }) {
  const pedestal = showPedestal && <Pedestal />
  const isDenim = s.id === 'tote-mezclilla'
  const tex = isDenim ? { fill: `url(#${id.twill})` } : { fill: '#fff', filter: `url(#${id.noise})` }

  if (s.kind === 'sudadera') {
    const label = s.dark ? { bg: '#fdf6ee', fg: '#82001a', stitch: '#82001a' } : { bg: '#82001a', fg: '#ffffff', stitch: '#ffffff' }
    const cuffL = 'M33 566 L113 576 L110 604 Q108 618 93 617 L47 613 Q31 611 31 595 Z'
    const cuffR = 'M567 566 L487 576 L490 604 Q492 618 507 617 L553 613 Q569 611 569 595 Z'
    const pocket = 'M206 462 H394 L426 560 Q428 568 420 568 H180 Q172 568 174 560 Z'
    const shade = s.dark ? 0.35 : 0.12
    return (
      <g>
        {/* Sombra general */}
        <path d={SWEAT_BODY} fill="#000" opacity={0.26} transform="translate(6 10)" filter={`url(#${id.soft})`} />
        {/* Cuerpo afelpado */}
        <path d={SWEAT_BODY} fill={s.fabric} />
        <path d={SWEAT_BODY} fill="#fff" filter={`url(#${id.noise})`} />
        <path d={SWEAT_BODY} fill={`url(#${id.side})`} />
        <path d={SWEAT_BODY} fill={`url(#${id.top})`} />
        <g fill="none" strokeLinecap="round" filter={`url(#${id.soft})`}>
          <path d="M88 320 Q78 440 70 550" stroke="#000" strokeOpacity={shade + 0.04} strokeWidth={12} />
          <path d="M512 320 Q522 440 530 550" stroke="#000" strokeOpacity={shade + 0.04} strokeWidth={12} />
          <path d="M102 340 Q96 440 92 530" stroke="#fff" strokeOpacity={s.dark ? 0.06 : 0.25} strokeWidth={7} />
          <path d="M498 340 Q504 440 508 530" stroke="#fff" strokeOpacity={s.dark ? 0.06 : 0.25} strokeWidth={7} />
          <ellipse cx={300} cy={360} rx={110} ry={130} fill="#fff" opacity={s.dark ? 0.03 : 0.1} stroke="none" />
        </g>
        {/* Hombro caído y costura de manga */}
        <path d="M150 206 Q122 290 132 380 M450 206 Q478 290 468 380" fill="none" stroke="#000" strokeOpacity={shade + 0.04} strokeWidth={2} />
        <g fill="none" stroke={s.stitch} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.9}>
          <path d="M155 208 Q128 290 137 380 M445 208 Q472 290 463 380" />
        </g>
        {/* Bolsa canguro */}
        <path d={pocket} fill="#000" opacity={shade * 0.6} transform="translate(0 4)" filter={`url(#${id.soft})`} />
        <path d={pocket} fill={s.fabric} />
        <path d={pocket} fill="#fff" filter={`url(#${id.noise})`} />
        <path d={pocket} fill={`url(#${id.top})`} />
        <path d="M206 462 L174 560 M394 462 L426 560" stroke="#000" strokeOpacity={shade + 0.12} strokeWidth={3} strokeLinecap="round" />
        <path d="M206 462 H394" stroke="#fff" strokeOpacity={s.dark ? 0.08 : 0.35} strokeWidth={1.5} />
        <g fill="none" stroke={s.stitch} strokeWidth={1.2} strokeDasharray="3 3">
          <path d="M210 468 H390 M213 470 L183 562 M387 470 L417 562" />
        </g>
        {/* Puños de punto */}
        {[cuffL, cuffR].map((d) => (
          <g key={d}>
            <path d={d} fill={s.trim} />
            <path d={d} fill={`url(#${id.rib})`} />
            <path d={d} fill="#000" opacity={0.08} />
          </g>
        ))}
        {/* Pretina de punto */}
        <rect x={130} y={576} width={340} height={6} fill="#000" opacity={shade} />
        <path d="M130 580 H470 V616 Q470 626 460 626 H140 Q130 626 130 616 Z" fill={s.trim} />
        <path d="M130 580 H470 V616 Q470 626 460 626 H140 Q130 626 130 616 Z" fill={`url(#${id.rib})`} />
        <path d="M130 580 H470" stroke="#fff" strokeOpacity={s.dark ? 0.08 : 0.35} strokeWidth={1.5} />
        {/* Gorro: exterior, interior y cruce al frente */}
        <path d={HOOD_OUTER} fill="#000" opacity={0.25} transform="translate(0 6)" filter={`url(#${id.soft})`} />
        <path d={HOOD_OUTER} fill={s.fabric} />
        <path d={HOOD_OUTER} fill="#fff" filter={`url(#${id.noise})`} />
        <path d={HOOD_OUTER} fill={`url(#${id.side})`} />
        <path d={HOOD_INNER} fill={s.trim} />
        <path d={HOOD_INNER} fill="#000" opacity={s.dark ? 0.45 : 0.16} />
        <path d="M232 120 Q300 92 368 120" fill="none" stroke="#000" strokeOpacity={s.dark ? 0.35 : 0.12} strokeWidth={10} filter={`url(#${id.soft})`} />
        <path d="M300 100 V236" stroke="#000" strokeOpacity={shade} strokeWidth={1.5} />
        <path d="M222 204 Q262 236 312 262 L300 252 Q250 236 222 204 Z" fill="#000" opacity={shade + 0.05} />
        <path d="M378 204 Q338 238 290 264" fill="none" stroke={s.fabric} strokeWidth={10} strokeLinecap="round" />
        <path d="M378 204 Q338 238 290 264" fill="none" stroke="#000" strokeOpacity={shade} strokeWidth={1.5} transform="translate(0 6)" />
        <path d="M222 204 Q260 232 300 250" fill="none" stroke={s.stitch} strokeWidth={1.2} strokeDasharray="3 3" />
        {/* Etiqueta tejida con el isotipo real */}
        <BrandLabel x={414} y={584} w={30} h={40} r={0} {...label} />
      </g>
    )
  }

  if (s.kind === 'cuadro') {
    return (
      <g>
        {/* Caballete */}
        <g strokeLinecap="round">
          <path d="M228 84 L156 728" stroke="#000" strokeOpacity={0.22} strokeWidth={15} transform="translate(4 4)" />
          <path d="M372 84 L444 728" stroke="#000" strokeOpacity={0.22} strokeWidth={15} transform="translate(4 4)" />
          <path d="M300 66 L300 728" stroke={`url(#${id.wood})`} strokeWidth={11} opacity={0.85} />
          <path d="M228 84 L156 728" stroke={`url(#${id.wood})`} strokeWidth={15} />
          <path d="M372 84 L444 728" stroke={`url(#${id.wood})`} strokeWidth={15} />
          <path d="M206 660 H394" stroke="#8d6a43" strokeWidth={8} />
        </g>
        {/* Sombra del lienzo */}
        <rect x={136} y={102} width={328} height={512} fill="#000" opacity={0.3} transform="translate(10 12)" filter={`url(#${id.soft})`} />
        {/* Canto del bastidor */}
        <path d="M464 104 L476 112 V622 L464 614 Z" fill="#d9cfbf" />
        <path d="M464 104 L476 112 V622 L464 614 Z" fill="#000" opacity={0.12} />
        <path d="M138 614 L464 614 L476 622 H150 Z" fill="#cfc4b2" />
        {/* Lienzo */}
        <rect x={136} y={102} width={328} height={512} fill={s.fabric} />
        <rect x={136} y={102} width={328} height={512} fill="#fff" filter={`url(#${id.noise})`} />
        <rect x={136} y={102} width={328} height={512} fill={`url(#${id.top})`} />
        <rect x={136} y={102} width={328} height={512} fill="none" stroke="#000" strokeOpacity={0.06} />
        {/* Prensa superior y repisa */}
        <rect x={280} y={70} width={40} height={44} rx={4} fill={`url(#${id.wood})`} />
        <rect x={280} y={108} width={40} height={6} fill="#000" opacity={0.18} />
        <rect x={118} y={612} width={364} height={20} rx={4} fill="#000" opacity={0.2} transform="translate(2 4)" />
        <rect x={118} y={612} width={364} height={20} rx={4} fill={`url(#${id.wood})`} />
        <rect x={118} y={612} width={364} height={5} rx={2.5} fill="#fff" opacity={0.18} />
        {/* Firma de la artista: isotipo real */}
        <Isotipo x={424} y={566} width={24} height={32} color="#82001a" />
      </g>
    )
  }

  if (s.kind === 'agenda') {
    return (
      <g>
        {pedestal}
        <rect x={168} y={156} width={268} height={506} rx={14} fill="#000" opacity={0.28} transform="translate(8 12)" filter={`url(#${id.soft})`} />
        {/* Bloque de hojas */}
        <rect x={178} y={164} width={266} height={494} rx={10} fill="#fbf8f2" />
        <rect x={432} y={168} width={12} height={486} fill={`url(#${id.pages})`} />
        {/* Tapa de tela */}
        <rect x={168} y={156} width={268} height={506} rx={14} fill={s.fabric} />
        <rect x={168} y={156} width={268} height={506} rx={14} fill="#fff" filter={`url(#${id.noise})`} />
        <rect x={168} y={156} width={268} height={506} rx={14} fill={`url(#${id.side})`} />
        <rect x={168} y={156} width={268} height={506} rx={14} fill={`url(#${id.top})`} />
        {/* Lomo */}
        <rect x={168} y={156} width={32} height={506} rx={12} fill={s.trim} />
        <rect x={168} y={156} width={32} height={506} rx={12} fill="#fff" filter={`url(#${id.noise})`} />
        <rect x={196} y={156} width={5} height={506} fill="#000" opacity={0.12} />
        <path d="M201 160 V658" stroke="#fff" strokeOpacity={0.35} strokeWidth={1.2} />
        <g stroke="#000" strokeOpacity={0.12} strokeWidth={2}>
          <path d="M172 196 H196 M172 202 H196 M172 616 H196 M172 622 H196" />
        </g>
        {/* Esquinas reforzadas */}
        <path d="M436 186 V170 Q436 156 422 156 H406 Z" fill={s.trim} />
        <path d="M436 632 V648 Q436 662 422 662 H406 Z" fill={s.trim} />
        {/* Liga elástica */}
        <rect x={402} y={150} width={14} height={518} rx={3} fill="#000" opacity={0.25} transform="translate(2 0)" />
        <rect x={402} y={150} width={14} height={518} rx={3} fill="#82001a" />
        <rect x={402} y={150} width={14} height={518} rx={3} fill={`url(#${id.elastic})`} />
        {/* Listón separador */}
        <path d="M352 650 L352 708 L362 698 L372 708 L372 650 Z" fill="#000" opacity={0.2} transform="translate(2 2)" />
        <path d="M352 650 L352 708 L362 698 L372 708 L372 650 Z" fill="#82001a" />
        <path d="M357 650 V700" stroke="#fff" strokeOpacity={0.2} strokeWidth={2} />
        {/* Isotipo en borgoña sobre la tapa crema */}
        <Isotipo x={296} y={608} width={32} height={42} color="#82001a" />
      </g>
    )
  }

  // Tote
  const label = s.dark ? { bg: '#fdf6ee', fg: '#82001a', stitch: '#82001a' } : { bg: '#82001a', fg: '#ffffff', stitch: '#ffffff' }
  return (
    <g>
      {pedestal}
      {/* Asa trasera asoma por dentro */}
      <path d="M140 230 H460 L456 244 H144 Z" fill="#000" opacity={0.25} />
      <Handle dx={0} s={s} id={id} />
      <Handle dx={110} s={s} id={id} />
      {/* Cuerpo */}
      <path d={TOTE_BODY} fill="#000" opacity={0.25} transform="translate(6 8)" filter={`url(#${id.soft})`} />
      <path d={TOTE_BODY} fill={s.fabric} />
      <path d={TOTE_BODY} {...tex} />
      <path d={TOTE_BODY} fill={`url(#${id.side})`} />
      <path d={TOTE_BODY} fill={`url(#${id.top})`} />
      {/* Pliegues suaves de la tela */}
      <g fill="none" strokeLinecap="round" filter={`url(#${id.soft})`}>
        <path d="M176 300 Q192 430 168 600" stroke="#000" strokeOpacity={0.07} strokeWidth={14} />
        <path d="M430 320 Q414 460 436 620" stroke="#000" strokeOpacity={0.08} strokeWidth={14} />
        <path d="M196 320 Q210 440 190 590" stroke="#fff" strokeOpacity={s.dark ? 0.05 : 0.22} strokeWidth={8} />
        <path d="M360 640 Q300 600 230 648" stroke="#000" strokeOpacity={0.06} strokeWidth={12} />
      </g>
      {/* Base con fuelle */}
      <path d="M127 636 Q300 652 473 636 L474 660 Q475 676 459 676 H141 Q125 676 126 660 Z" fill="#000" opacity={0.08} />
      <path d="M128 640 Q300 656 472 640" fill="none" stroke={s.stitch} strokeWidth={1.2} strokeDasharray="3.5 3" opacity={0.8} />
      {/* Costuras laterales */}
      <path d="M140 232 L128 662 M460 232 L472 662" stroke="#000" strokeOpacity={0.14} strokeWidth={2.5} />
      {s.id === 'tote-mezclilla' && (
        <g fill="none" stroke={s.stitch} strokeWidth={1.5} strokeDasharray="4.5 3.5">
          <path d="M147 268 L137 664 M453 268 L463 664" />
        </g>
      )}
      {/* Dobladillo superior con doble pespunte */}
      <path d="M138 228 H462 L463.3 272 H136.7 Z" fill={s.trim} />
      <path d="M138 228 H462 L463.3 272 H136.7 Z" {...tex} />
      <rect x={137} y={228} width={326} height={5} fill="#fff" opacity={s.dark ? 0.06 : 0.3} />
      <rect x={137} y={272} width={327} height={7} fill="#000" opacity={0.07} />
      <path d="M137 272 H463" stroke="#000" strokeOpacity={0.16} strokeWidth={1.5} />
      <g fill="none" stroke={s.stitch} strokeWidth={1.3} strokeDasharray="4 3">
        <path d="M139 238 H461" />
        <path d="M138 264 H462" />
      </g>
      {/* Asas cosidas al frente */}
      <StrapEnd x={205} s={s} />
      <StrapEnd x={285} s={s} />
      <StrapEnd x={315} s={s} />
      <StrapEnd x={395} s={s} />
      {/* Etiqueta tejida con el isotipo real */}
      <BrandLabel x={411} y={278} w={44} h={60} r={-2} {...label} />
    </g>
  )
}

type LiveHandle = { set: (p: number[] | null) => void }

/**
 * Encuadre cercano para pintar: muestra solo el cuerpo de la pieza (sin el espacio vacío de alrededor),
 * así se ve más grande. Conserva la proporción 600 × 740 para que el lienzo no cambie de tamaño.
 */
const PAINT_FRAME: Partial<Record<SurfaceKind, string>> = {
  tote: '95 196 410 506',
  cuadro: '76 82 448 552',
  agenda: '80 136 443 546',
}

/** Capa ligera encima de la pieza que solo muestra el trazo mientras se pinta. */
const LiveOverlay = forwardRef<LiveHandle, { draw: DrawTool; mirrorX: (x: number) => number; kind: SurfaceKind; viewBox: string }>(function LiveOverlay({ draw, mirrorX, kind, viewBox }, ref) {
  const [p, setP] = useState<number[] | null>(null)
  const clipId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  useImperativeHandle(ref, () => ({ set: setP }), [])
  if (!p) return null
  return (
    <svg viewBox={viewBox} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
      <defs>
        <clipPath id={`lc-${clipId}`}>{bodyShape(kind)}</clipPath>
      </defs>
      <g clipPath={`url(#lc-${clipId})`}>
        <LiveStroke p={p} brush={draw.brush} color={draw.color} size={draw.size} opacity={draw.opacity} />
        {draw.mirror && <LiveStroke p={p.map((v, i) => (i % 2 === 0 ? mirrorX(v) : v))} brush={draw.brush} color={draw.color} size={draw.size} opacity={draw.opacity} />}
      </g>
    </svg>
  )
})

/** Zona del frente de la tote (x, y, ancho, alto) que se usa como textura en 3D. */
export const DESIGN_BOX = [126, 228, 348, 448] as const

/** Herramienta activa del estudio de pintura. */
export type DrawTool = {
  mode: 'pincel' | 'sticker'
  brush: BrushId
  color: string
  size: number
  opacity: number
  sticker: StickerId | string
  stickerSize: number
  rotation: number
  mirror: boolean
  onAdd: (strokes: Stroke[]) => void
  /** Sticker seleccionado para moverlo, girarlo o cambiar su tamaño (índice en design.strokes) */
  selected?: number | null
  onSelect?: (i: number | null) => void
  /** Cambia un sticker ya colocado (null lo elimina) */
  onEdit?: (i: number, patch: Partial<Extract<Stroke, { t: 'stamp' }>> | null) => void
  /** Se llama al empezar a arrastrar, para que se pueda deshacer el movimiento */
  onEditStart?: () => void
}

/** Puntos de control del sticker seleccionado: asa de tamaño/giro y botón de borrar. */
function stickerHandles(st: Extract<Stroke, { t: 'stamp' }>) {
  const half = 13 * st.s + 6
  const r = ((st.r ?? 0) * Math.PI) / 180
  const rot = (x: number, y: number) => [st.x + x * Math.cos(r) - y * Math.sin(r), st.y + x * Math.sin(r) + y * Math.cos(r)]
  return { half, handle: rot(half, -half), remove: rot(-half, -half), corners: [rot(-half, -half), rot(half, -half), rot(half, half), rot(-half, half)] }
}

/** La pieza (tela, costuras, etiqueta) no cambia mientras se pinta: se dibuja una vez y se reutiliza. */
const MemoSurface = memo(SurfaceBase)

/** Vista previa de la pieza: se actualiza en vivo con cada decisión. */
/** layer="design": solo lo pintado (motivo, texto y trazos), recortado al frente de la tote y sin fondo; sirve como textura del modelo 3D. */
export const ToteCanvas = forwardRef<SVGSVGElement, { design: Design; showPedestal?: boolean; draw?: DrawTool; layer?: 'design'; zoom?: boolean }>(function ToteCanvas({ design, showPedestal = true, draw, layer, zoom }, ref) {
  // Pintar a mano: los trazos se guardan en coordenadas de la vista previa
  const local = useRef<SVGSVGElement | null>(null)
  const setRefs = useCallback(
    (el: SVGSVGElement | null) => {
      local.current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) ref.current = el
    },
    [ref],
  )
  // Trazo en curso: se guarda en una referencia y se dibuja en una capa aparte, sin filtros,
  // para que la pieza (con sus texturas pesadas) no se vuelva a dibujar en cada movimiento
  const liveRef = useRef<number[] | null>(null)
  const overlay = useRef<LiveHandle>(null)
  const frameRef = useRef(0)
  const pushLive = () => {
    if (frameRef.current) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      overlay.current?.set(liveRef.current ? liveRef.current.slice() : null)
    })
  }
  // Mover un sticker también se agrupa por cuadro de animación (como mucho un cambio por cuadro)
  const editRef = useRef<{ i: number; patch: Partial<Extract<Stroke, { t: 'stamp' }>> } | null>(null)
  const editFrame = useRef(0)
  const queueEdit = (i: number, patch: Partial<Extract<Stroke, { t: 'stamp' }>>) => {
    editRef.current = { i, patch: { ...(editRef.current?.i === i ? editRef.current.patch : {}), ...patch } }
    if (editFrame.current) return
    editFrame.current = requestAnimationFrame(() => {
      editFrame.current = 0
      const e = editRef.current
      editRef.current = null
      if (e) draw?.onEdit?.(e.i, e.patch)
    })
  }
  const used = (design.strokes ?? []).reduce((n, st) => n + (st.t === 'line' ? st.p.length / 2 : 1), 0)
  const toPoint = (e: RPointerEvent<SVGSVGElement>) => {
    const svg = local.current
    const m = svg?.getScreenCTM()
    if (!svg || !m) return null
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const r = pt.matrixTransform(m.inverse())
    return [Math.round(r.x * 10) / 10, Math.round(r.y * 10) / 10]
  }
  const mirrorX = (x: number) => Math.round((2 * (surfaces.find((x2) => x2.id === design.surface)?.kind === 'agenda' ? 312 : 300) - x) * 10) / 10
  type Drag = { kind: 'move'; i: number; dx: number; dy: number } | { kind: 'scale'; i: number; s0: number; r0: number; d0: number; a0: number }
  const drag = useRef<Drag | null>(null)
  const stamps = (design.strokes ?? []).map((st, i) => ({ st, i })).filter((x): x is { st: Extract<Stroke, { t: 'stamp' }>; i: number } => x.st.t === 'stamp')
  const hitSticker = (x: number, y: number) => {
    for (let k = stamps.length - 1; k >= 0; k--) {
      const { st, i } = stamps[k]
      if (Math.hypot(x - st.x, y - st.y) <= 13 * st.s + 4) return i
    }
    return null
  }
  const capture = (e: RPointerEvent<SVGSVGElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* algunos navegadores no permiten capturar este puntero */
    }
  }
  const onDown = (e: RPointerEvent<SVGSVGElement>) => {
    if (!draw) return
    const p = toPoint(e)
    if (!p) return
    e.preventDefault()
    if (draw.mode === 'sticker') {
      const sel = draw.selected != null ? design.strokes?.[draw.selected] : undefined
      // 1) Asas del sticker seleccionado
      if (sel && sel.t === 'stamp' && draw.selected != null) {
        const h = stickerHandles(sel)
        if (Math.hypot(p[0] - h.remove[0], p[1] - h.remove[1]) <= 13) {
          draw.onEditStart?.()
          draw.onEdit?.(draw.selected, null)
          draw.onSelect?.(null)
          return
        }
        if (Math.hypot(p[0] - h.handle[0], p[1] - h.handle[1]) <= 14) {
          draw.onEditStart?.()
          drag.current = { kind: 'scale', i: draw.selected, s0: sel.s, r0: sel.r ?? 0, d0: Math.hypot(p[0] - sel.x, p[1] - sel.y), a0: Math.atan2(p[1] - sel.y, p[0] - sel.x) }
          capture(e)
          return
        }
      }
      // 2) Tocar un sticker ya puesto lo selecciona y permite arrastrarlo
      const hit = hitSticker(p[0], p[1])
      if (hit != null) {
        const st = design.strokes![hit] as Extract<Stroke, { t: 'stamp' }>
        draw.onSelect?.(hit)
        draw.onEditStart?.()
        drag.current = { kind: 'move', i: hit, dx: p[0] - st.x, dy: p[1] - st.y }
        capture(e)
        return
      }
      // 3) En un lugar vacío se coloca uno nuevo (y queda seleccionado para acomodarlo)
      if (draw.selected != null) draw.onSelect?.(null)
      if (used >= MAX_POINTS) return
      const st: Stroke = { t: 'stamp', c: draw.color, k: draw.sticker, x: p[0], y: p[1], s: draw.stickerSize / 12, r: draw.rotation }
      draw.onAdd(draw.mirror ? [st, { ...st, x: mirrorX(p[0]), r: -draw.rotation, f: true }] : [st])
      return
    }
    if (used >= MAX_POINTS) return
    capture(e)
    liveRef.current = [p[0], p[1]]
    pushLive()
  }
  const onMove = (e: RPointerEvent<SVGSVGElement>) => {
    if (!draw) return
    const p = toPoint(e)
    if (!p) return
    const d = drag.current
    if (d) {
      if (d.kind === 'move') queueEdit(d.i, { x: Math.round((p[0] - d.dx) * 10) / 10, y: Math.round((p[1] - d.dy) * 10) / 10 })
      else {
        const st = design.strokes?.[d.i]
        if (!st || st.t !== 'stamp') return
        const dist = Math.hypot(p[0] - st.x, p[1] - st.y)
        const ang = Math.atan2(p[1] - st.y, p[0] - st.x)
        const s2 = Math.max(0.4, Math.min(12, (d.s0 * dist) / Math.max(4, d.d0)))
        const r2 = Math.round(d.r0 + ((ang - d.a0) * 180) / Math.PI)
        queueEdit(d.i, { s: Math.round(s2 * 100) / 100, r: ((r2 + 540) % 360) - 180 })
      }
      return
    }
    const live = liveRef.current
    if (!live) return
    const lx = live[live.length - 2]
    const ly = live[live.length - 1]
    if (Math.hypot(p[0] - lx, p[1] - ly) < (draw.brush === 'aerosol' ? 4 : 2.2)) return
    live.push(p[0], p[1])
    pushLive()
  }
  const onUp = () => {
    if (drag.current) {
      drag.current = null
      return
    }
    const live = liveRef.current
    if (!draw || !live) return
    const pts = live.length >= 4 ? live : [...live, live[0] + 0.1, live[1]]
    const st: Stroke = { t: 'line', b: draw.brush, c: draw.color, w: draw.size, o: draw.opacity, p: pts }
    draw.onAdd(draw.mirror ? [st, { ...st, p: pts.map((v, i) => (i % 2 === 0 ? mirrorX(v) : v)) }] : [st])
    liveRef.current = null
    pushLive()
  }

  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = useMemo(
    () => Object.fromEntries((['rib', 'weave', 'noise', 'twill', 'grain', 'side', 'top', 'soft', 'paint', 'clip', 'wood', 'pages', 'strap', 'elastic', 'water', 'dry'] as const).map((k) => [k, `jl-${k}-${uid}`])) as Ids,
    [uid],
  )
  const surface = surfaces.find((x) => x.id === design.surface) ?? surfaces[0]
  const g = geometry[surface.kind]
  const palette = adaptColors(palettes.find((p) => p.id === design.palette)!.colors, surface.dark)
  const font = fonts.find((f) => f.id === design.font)!
  const scale = sizes.find((s) => s.id === design.size)!.scale
  const hasText = design.text.trim().length > 0
  const soloTexto = design.motif === 'solo-texto'
  const textY = soloTexto ? g.cy : g.text[design.placement]
  const motifY = !hasText || design.placement === 'centro' ? g.cy : design.placement === 'arriba' ? g.up : g.down
  const motifScale = scale * g.k * (hasText && design.placement !== 'centro' ? 0.82 : 1)
  const len = Math.max(design.text.length, 1)
  const fontSize = Math.round(Math.min(soloTexto ? 72 : 54, Math.max(24, (soloTexto ? 560 : 470) / len)) * (font.id === 'script' ? 1.25 : 1) * (font.id === 'moderna' ? 0.78 : 1) * (surface.kind === 'agenda' ? 0.82 : 1))
  const label = `Vista previa de tu pieza (${surface.name}): motivo ${design.motif}, paleta ${design.palette}${hasText ? `, con el texto ${design.text}` : ''}`
  const showBack = design.back && surface.kind !== 'cuadro'
  const isDenim = surface.id === 'tote-mezclilla'
  const cx = surface.kind === 'agenda' ? 312 : 300
  const viewBox = layer ? DESIGN_BOX.join(' ') : (zoom && PAINT_FRAME[surface.kind]) || '0 0 600 740'

  return (
    <div className="relative">
    <svg
      ref={setRefs}
      viewBox={viewBox}
      role="img"
      aria-label={label}
      className="w-full h-auto block"
      xmlns="http://www.w3.org/2000/svg"
      style={draw ? { touchAction: 'none', cursor: 'crosshair' } : undefined}
      onPointerDown={draw ? onDown : undefined}
      onPointerMove={draw ? onMove : undefined}
      onPointerUp={draw ? onUp : undefined}
      onPointerCancel={draw ? onUp : undefined}
    >
      <defs>
        {/* Tejido de lona: trama fina horizontal y vertical */}
        <pattern id={id.weave} width={3} height={3} patternUnits="userSpaceOnUse">
          <rect width={3} height={1} fill="#000" opacity={surface.dark ? 0.05 : 0.035} />
          <rect width={1} height={3} fill="#fff" opacity={surface.dark ? 0.025 : 0.06} />
        </pattern>
        {/* Puño y pretina de punto acanalado */}
        <pattern id={id.rib} width={5} height={8} patternUnits="userSpaceOnUse">
          <rect width={2.2} height={8} fill="#000" opacity={surface.dark ? 0.22 : 0.07} />
          <rect x={2.6} width={1.2} height={8} fill="#fff" opacity={surface.dark ? 0.05 : 0.22} />
        </pattern>
        {/* Sarga de mezclilla: diagonales claras y oscuras */}
        <pattern id={id.twill} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
          <rect width={6} height={2.2} fill="#fff" opacity={0.09} />
          <rect y={3} width={6} height={1.6} fill="#000" opacity={0.08} />
        </pattern>
        <pattern id={id.grain} width={5} height={5} patternUnits="userSpaceOnUse">
          <circle cx={1.5} cy={1.5} r={0.8} fill="#000" opacity={0.25} />
          <circle cx={4} cy={3.5} r={0.6} fill="#fff" opacity={0.2} />
        </pattern>
        <pattern id={id.pages} width={2} height={8} patternUnits="userSpaceOnUse">
          <rect width={2} height={8} fill="#f3ede2" />
          <rect width={0.7} height={8} fill="#cfc4b1" />
        </pattern>
        {/* Volumen: costados en sombra y luz suave arriba */}
        <linearGradient id={id.side} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".2" />
          <stop offset=".14" stopColor="#000" stopOpacity=".04" />
          <stop offset=".42" stopColor="#fff" stopOpacity=".06" />
          <stop offset=".6" stopColor="#fff" stopOpacity="0" />
          <stop offset=".88" stopColor="#000" stopOpacity=".05" />
          <stop offset="1" stopColor="#000" stopOpacity=".24" />
        </linearGradient>
        <linearGradient id={id.top} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".1" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".14" />
        </linearGradient>
        <linearGradient id={id.strap} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".18" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".08" />
          <stop offset="1" stopColor="#000" stopOpacity=".2" />
        </linearGradient>
        <linearGradient id={id.wood} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c99d6b" />
          <stop offset=".45" stopColor="#b2875a" />
          <stop offset="1" stopColor="#8c6640" />
        </linearGradient>
        <linearGradient id={id.elastic} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".3" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".18" />
          <stop offset="1" stopColor="#000" stopOpacity=".3" />
        </linearGradient>
        <filter id={id.noise} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.15 0.75" numOctaves="2" seed="5" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.28  0 0 0 0 0.22  0 0 0 0 0.16  0 0 0 0.2 -0.06" result="t" />
          <feComposite in="t" in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={id.soft} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        {/* Pintura absorbida por la tela: bordes con leve irregularidad de pincel */}
        <filter id={id.paint} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <clipPath id={id.clip}>{bodyShape(surface.kind)}</clipPath>
        <PaintDefs water={id.water} dry={id.dry} />
      </defs>

      {!layer && (
        <g key={surface.id} className="jl-svg-pop">
          <MemoSurface s={surface} showPedestal={showPedestal} id={id} />
        </g>
      )}

      <g clipPath={`url(#${id.clip})`}>
        <g transform={`translate(${cx} ${motifY}) scale(${motifScale})`}>
          <g key={`${design.motif}-${design.palette}-${design.size}-${design.surface}-${design.reference ? 1 : 0}`} className="jl-svg-pop" filter={design.motif === 'mi-idea' ? undefined : `url(#${id.paint})`}>
            {design.motif === 'lienzo' ? null : <MotifArt motif={design.motif} colors={palette} reference={design.reference} onDark={surface.dark} />}
          </g>
        </g>

        {/* Lo que pintó el cliente: cada pincel con su propia textura */}
        <StrokesLayer strokes={design.strokes ?? []} uid={uid} f={{ paint: id.paint, water: id.water, dry: id.dry }} />
        {draw?.mirror && <line x1={cx} y1={60} x2={cx} y2={700} stroke={palette[0]} strokeOpacity={0.35} strokeWidth={1.2} strokeDasharray="4 6" pointerEvents="none" />}
        {!layer && design.motif === 'lienzo' && !design.strokes?.length && (
          <g pointerEvents="none" opacity={0.75}>
            <rect x={cx - 110} y={g.cy - 120} width={220} height={240} rx={18} fill="none" stroke={palette[0]} strokeWidth={2} strokeDasharray="6 8" />
            <text x={cx} y={g.cy - 8} textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontStyle="italic" fontSize={34} fill={palette[0]}>Pinta aquí</text>
            <text x={cx} y={g.cy + 24} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize={13} fontWeight={600} letterSpacing={1.5} fill={palette[0]}>CON TU DEDO O MOUSE</text>
          </g>
        )}

        {hasText && (
          <text
            key={`${design.font}-${design.placement}`}
            className="jl-svg-pop"
            x={cx}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily={font.family}
            fontStyle={font.style}
            fontWeight={font.weight}
            fontSize={fontSize}
            letterSpacing={font.id === 'moderna' ? 3 : 0}
            fill={palette[0]}
            stroke={surface.fabric}
            strokeWidth={design.placement === 'centro' && !soloTexto ? 8 : 0}
            paintOrder="stroke"
          >
            {font.transform === 'uppercase' ? design.text.toUpperCase() : design.text}
          </text>
        )}

        {/* La trama de la tela se ve a través de la pintura */}
        {!layer && (isDenim ? <rect x={0} y={0} width={600} height={740} fill={`url(#${id.twill})`} opacity={0.4} /> : <rect x={0} y={0} width={600} height={740} fill="#fff" filter={`url(#${id.noise})`} opacity={0.5} />)}
      </g>

      {!layer && draw?.mode === 'sticker' && draw.selected != null && design.strokes?.[draw.selected]?.t === 'stamp' && (() => {
        const st = design.strokes![draw.selected!] as Extract<Stroke, { t: 'stamp' }>
        const h = stickerHandles(st)
        return (
          <g pointerEvents="none">
            <polygon points={h.corners.map((c) => c.join(',')).join(' ')} fill="none" stroke="#fdf6ee" strokeWidth={3.5} />
            <polygon points={h.corners.map((c) => c.join(',')).join(' ')} fill="none" stroke="#82001a" strokeWidth={1.6} strokeDasharray="5 4" />
            <circle cx={h.handle[0]} cy={h.handle[1]} r={11} fill="#82001a" stroke="#fdf6ee" strokeWidth={2.5} />
            <path d={`M${h.handle[0] - 4} ${h.handle[1] + 1} a4 4 0 1 1 4 3.6 M${h.handle[0] + 0.4} ${h.handle[1] + 4.6} l-1.8 -2.2 2.6 -.8`} fill="none" stroke="#fdf6ee" strokeWidth={1.6} strokeLinecap="round" />
            <circle cx={h.remove[0]} cy={h.remove[1]} r={10} fill="#fdf6ee" stroke="#82001a" strokeWidth={1.8} />
            <path d={`M${h.remove[0] - 3.6} ${h.remove[1] - 3.6} l7.2 7.2 M${h.remove[0] + 3.6} ${h.remove[1] - 3.6} l-7.2 7.2`} stroke="#82001a" strokeWidth={2} strokeLinecap="round" />
          </g>
        )
      })()}

      {!layer && showBack && (
        <g transform="translate(300 652)">
          <rect x={-58} y={-14} width={116} height={28} rx={14} fill="#82001a" />
          <text textAnchor="middle" dominantBaseline="middle" fontFamily="Montserrat, sans-serif" fontSize={12} fontWeight={600} letterSpacing={1.5} fill="#fdf6ee">+ REVERSO</text>
        </g>
      )}
    </svg>
      {draw && <LiveOverlay ref={overlay} draw={draw} mirrorX={mirrorX} kind={surface.kind} viewBox={viewBox} />}
    </div>
  )
})

/**
 * Las imágenes SVG no pueden usar las fuentes web de la página, así que al convertir el diseño a imagen
 * se incrustan Cormorant, Montserrat y Pinyon Script (solo los caracteres latinos) como datos dentro del SVG.
 */
let fontCss: Promise<string> | null = null
function embeddedFonts() {
  fontCss ??= (async () => {
    const link = document.querySelector<HTMLLinkElement>('link[href*="fonts.googleapis.com/css2"]')
    if (!link) return ''
    const css = await fetch(link.href).then((r) => r.text())
    // Cada bloque @font-face va precedido de un comentario con el subconjunto; se toman solo los latinos
    const blocks = css.split('/*').filter((b) => /^\s*latin\s*\*\//.test(b)).map((b) => b.slice(b.indexOf('@font-face')))
    const out = await Promise.all(
      blocks.map(async (b) => {
        const url = /url\((https:[^)]+)\)/.exec(b)?.[1]
        if (!url) return ''
        const buf = await fetch(url).then((r) => r.arrayBuffer())
        let bin = ''
        const bytes = new Uint8Array(buf)
        for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
        return b.replace(url, `data:font/woff2;base64,${btoa(bin)}`)
      }),
    )
    // Un bloque @font-face por línea, para poder elegir después solo las familias necesarias
    return out.map((b) => b.replace(/\s*\n\s*/g, ' ').trim()).join('\n')
  })().catch(() => '')
  return fontCss
}

/** Serializa un SVG con las fuentes incrustadas, listo para dibujarlo como imagen. */
export async function serializeWithFonts(svg: SVGSVGElement) {
  // Solo se incrustan las familias que el dibujo usa de verdad (sin texto, no se incrusta nada):
  // así la imagen pesa decenas de KB en lugar de cientos y se prepara mucho más rápido
  const used = new Set<string>()
  svg.querySelectorAll('text, tspan').forEach((t) => {
    const f = `${t.getAttribute('font-family') ?? ''} ${(t as SVGElement).style.fontFamily}`
    if (/cormorant/i.test(f)) used.add('Cormorant')
    if (/montserrat/i.test(f)) used.add('Montserrat')
    if (/pinyon/i.test(f)) used.add('Pinyon')
  })
  const css = used.size
    ? (await embeddedFonts())
        .split('\n')
        .filter((b) => [...used].some((u) => b.includes(`font-family: '${u}`)))
        .join('\n')
    : ''
  if (css) {
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    style.textContent = css
    svg.insertBefore(style, svg.firstChild)
  }
  return new XMLSerializer().serializeToString(svg)
}

/** Convierte la vista previa en imagen PNG (para el carrito o para descargar). */
export async function svgToPng(svg: SVGSVGElement, width = 900, background = '#5f272d'): Promise<string> {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(Math.round((width * 740) / 600)))
  const xml = await serializeWithFonts(clone)
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = new Image()
    img.decoding = 'async'
    await new Promise<void>((res, rej) => {
      img.onload = () => res()
      img.onerror = () => rej(new Error('No se pudo generar la imagen'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = Math.round((width * 740) / 600)
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.86)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Reduce una imagen subida para guardarla sin ocupar demasiado espacio. */
export function shrinkImage(file: File, max = 700): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Formato de imagen no compatible'))
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * k)
        c.height = Math.round(img.height * k)
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.82))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
