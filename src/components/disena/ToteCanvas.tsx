import { forwardRef, useId } from 'react'
import { Isotipo } from '../brand/Isotipo'
import { STAR_PATH } from '../ui'
import { fonts, palettes, sizes, surfaces, type Design, type MotifId, type Surface, type SurfaceKind } from '../../data/design'

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
  chamarra: { cy: 430, text: { arriba: 318, centro: 430, abajo: 560 }, k: 0.92, up: 460, down: 405 },
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
const JACKET_BODY =
  'M210 132 Q300 160 390 132 L468 168 Q514 186 534 244 L572 560 Q575 580 556 584 L506 590 Q490 591 488 575 L466 340 L468 632 Q468 652 448 652 H152 Q132 652 132 632 L134 340 L112 575 Q110 591 94 590 L44 584 Q25 580 28 560 L66 244 Q86 186 132 168 Z'

function bodyShape(kind: SurfaceKind) {
  if (kind === 'chamarra') return <path d={JACKET_BODY} />
  if (kind === 'cuadro') return <rect x={136} y={102} width={328} height={512} />
  if (kind === 'agenda') return <rect x={168} y={156} width={268} height={506} rx={14} />
  return <path d={TOTE_BODY} />
}

type Ids = Record<'weave' | 'noise' | 'twill' | 'grain' | 'side' | 'top' | 'soft' | 'paint' | 'clip' | 'wood' | 'pages' | 'strap' | 'elastic', string>

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
  const isDenim = s.id === 'tote-mezclilla' || s.kind === 'chamarra'
  const tex = isDenim ? { fill: `url(#${id.twill})` } : { fill: '#fff', filter: `url(#${id.noise})` }

  if (s.kind === 'chamarra') {
    const brass = '#c8933f'
    return (
      <g>
        {/* Gancho y gancho de madera */}
        <path d="M300 112 V80 Q300 58 320 58 Q340 58 340 78" fill="none" stroke="#9a9a9a" strokeWidth={4.5} strokeLinecap="round" />
        <path d="M300 80 V74" stroke="#cfcfcf" strokeWidth={2} strokeLinecap="round" />
        <path d="M150 158 Q300 100 450 158" fill="none" stroke="#000" strokeOpacity={0.25} strokeWidth={13} strokeLinecap="round" transform="translate(2 4)" />
        <path d="M150 158 Q300 100 450 158" fill="none" stroke={`url(#${id.wood})`} strokeWidth={13} strokeLinecap="round" />
        {/* Cuerpo */}
        <path d={JACKET_BODY} fill="#000" opacity={0.22} transform="translate(5 9)" filter={`url(#${id.soft})`} />
        <path d={JACKET_BODY} fill={s.fabric} />
        <path d={JACKET_BODY} fill={`url(#${id.twill})`} />
        <path d={JACKET_BODY} fill={`url(#${id.side})`} />
        <path d={JACKET_BODY} fill={`url(#${id.top})`} />
        {/* Desgaste claro al centro, típico de la mezclilla */}
        <ellipse cx={300} cy={430} rx={120} ry={170} fill="#fff" opacity={0.07} filter={`url(#${id.soft})`} />
        {/* Mangas: pliegues y costuras */}
        <g fill="none" strokeLinecap="round" filter={`url(#${id.soft})`}>
          <path d="M84 300 Q74 420 66 540" stroke="#000" strokeOpacity={0.14} strokeWidth={10} />
          <path d="M516 300 Q526 420 534 540" stroke="#000" strokeOpacity={0.14} strokeWidth={10} />
          <path d="M100 330 Q94 430 88 520" stroke="#fff" strokeOpacity={0.12} strokeWidth={6} />
          <path d="M500 330 Q506 430 512 520" stroke="#fff" strokeOpacity={0.12} strokeWidth={6} />
        </g>
        <path d="M134 340 L134 300 M466 340 L466 300" stroke="#000" strokeOpacity={0.18} strokeWidth={2} />
        <g fill="none" stroke={s.stitch} strokeWidth={1.4} strokeDasharray="4 3.5">
          <path d="M138 300 V630 M462 300 V630" />
          <path d="M70 250 L48 556 M530 250 L552 556" />
        </g>
        {/* Puños con botón */}
        <path d="M31 540 L113 552 L112 575 Q110 591 94 590 L44 584 Q25 580 28 560 Z" fill={s.trim} />
        <path d="M569 540 L487 552 L488 575 Q490 591 506 590 L556 584 Q575 580 572 560 Z" fill={s.trim} />
        <g fill="none" stroke={s.stitch} strokeWidth={1.3} strokeDasharray="3.5 3">
          <path d="M33 548 L111 559 M567 548 L489 559" />
        </g>
        <circle cx={96} cy={574} r={5.5} fill={brass} />
        <circle cx={504} cy={574} r={5.5} fill={brass} />
        {/* Canesú en pico con doble pespunte */}
        <path d="M70 232 L300 274 L530 232" fill="none" stroke="#000" strokeOpacity={0.22} strokeWidth={2.5} />
        <g fill="none" stroke={s.stitch} strokeWidth={1.5} strokeDasharray="4.5 3.5">
          <path d="M71 240 L300 282 L529 240" />
          <path d="M72 247 L300 289 L528 247" />
        </g>
        {/* Paneles de la espalda */}
        <g fill="none">
          <path d="M214 293 V610 M386 293 V610" stroke="#000" strokeOpacity={0.16} strokeWidth={2} />
          <g stroke={s.stitch} strokeWidth={1.4} strokeDasharray="4.5 3.5">
            <path d="M220 292 V610 M380 292 V610" />
          </g>
        </g>
        {/* Cuello */}
        <path d="M206 132 Q300 196 394 132 Q372 104 300 100 Q228 104 206 132 Z" fill="#000" opacity={0.2} transform="translate(0 6)" />
        <path d="M206 132 Q300 194 394 132 Q372 104 300 100 Q228 104 206 132 Z" fill={s.trim} />
        <path d="M206 132 Q300 194 394 132 Q372 104 300 100 Q228 104 206 132 Z" fill={`url(#${id.twill})`} />
        <path d="M216 134 Q300 184 384 134" fill="none" stroke={s.stitch} strokeWidth={1.4} strokeDasharray="4 3" />
        {/* Pretina con ajustadores */}
        <rect x={132} y={606} width={336} height={46} fill="#000" opacity={0.15} transform="translate(0 -3)" />
        <rect x={132} y={608} width={336} height={44} fill={s.trim} />
        <rect x={132} y={608} width={336} height={44} fill={`url(#${id.twill})`} />
        <g fill="none" stroke={s.stitch} strokeWidth={1.4} strokeDasharray="4 3">
          <path d="M134 614 H466 M134 646 H466" />
        </g>
        {[178, 422].map((cx) => (
          <g key={cx}>
            <rect x={cx - 24} y={616} width={48} height={24} rx={3} fill={s.trim} stroke="#000" strokeOpacity={0.2} />
            <circle cx={cx + (cx < 300 ? 14 : -14)} cy={628} r={6} fill={brass} />
            <circle cx={cx + (cx < 300 ? 14 : -14)} cy={628} r={2.2} fill="#7a5520" />
          </g>
        ))}
        {/* Parche de piel con el isotipo grabado */}
        <g>
          <rect x={312} y={612} width={50} height={36} rx={3} fill="#000" opacity={0.25} transform="translate(1.5 2)" />
          <rect x={312} y={612} width={50} height={36} rx={3} fill="#82001a" />
          <rect x={312} y={612} width={50} height={36} rx={3} fill={`url(#${id.grain})`} opacity={0.35} />
          <rect x={315} y={615} width={44} height={30} rx={2} fill="none" stroke="#ffffff" strokeWidth={0.9} strokeDasharray="2 2" opacity={0.8} />
          <Isotipo x={325} y={616} width={24} height={28} color="#ffffff" />
        </g>
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

/** Vista previa de la pieza: se actualiza en vivo con cada decisión. */
export const ToteCanvas = forwardRef<SVGSVGElement, { design: Design; showPedestal?: boolean }>(function ToteCanvas({ design, showPedestal = true }, ref) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = Object.fromEntries(
    (['weave', 'noise', 'twill', 'grain', 'side', 'top', 'soft', 'paint', 'clip', 'wood', 'pages', 'strap', 'elastic'] as const).map((k) => [k, `jl-${k}-${uid}`]),
  ) as Ids
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
  const showBack = design.back && surface.kind !== 'cuadro' && surface.kind !== 'chamarra'
  const isDenim = surface.id === 'tote-mezclilla' || surface.kind === 'chamarra'
  const cx = surface.kind === 'agenda' ? 312 : 300

  return (
    <svg ref={ref} viewBox="0 0 600 740" role="img" aria-label={label} className="w-full h-auto block" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Tejido de lona: trama fina horizontal y vertical */}
        <pattern id={id.weave} width={3} height={3} patternUnits="userSpaceOnUse">
          <rect width={3} height={1} fill="#000" opacity={surface.dark ? 0.05 : 0.035} />
          <rect width={1} height={3} fill="#fff" opacity={surface.dark ? 0.025 : 0.06} />
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
      </defs>

      <g key={surface.id} className="jl-svg-pop">
        <SurfaceBase s={surface} showPedestal={showPedestal} id={id} />
      </g>

      <g clipPath={`url(#${id.clip})`}>
        <g transform={`translate(${cx} ${motifY}) scale(${motifScale})`}>
          <g key={`${design.motif}-${design.palette}-${design.size}-${design.surface}-${design.reference ? 1 : 0}`} className="jl-svg-pop" filter={design.motif === 'mi-idea' ? undefined : `url(#${id.paint})`}>
            <MotifArt motif={design.motif} colors={palette} reference={design.reference} onDark={surface.dark} />
          </g>
        </g>

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
        {isDenim ? <rect x={0} y={0} width={600} height={740} fill={`url(#${id.twill})`} opacity={0.4} /> : <rect x={0} y={0} width={600} height={740} fill="#fff" filter={`url(#${id.noise})`} opacity={0.5} />}
      </g>

      {showBack && (
        <g transform="translate(300 652)">
          <rect x={-58} y={-14} width={116} height={28} rx={14} fill="#82001a" />
          <text textAnchor="middle" dominantBaseline="middle" fontFamily="Montserrat, sans-serif" fontSize={12} fontWeight={600} letterSpacing={1.5} fill="#fdf6ee">+ REVERSO</text>
        </g>
      )}
    </svg>
  )
})

/** Convierte la vista previa en imagen PNG (para el carrito o para descargar). */
export async function svgToPng(svg: SVGSVGElement, width = 900, background = '#5f272d'): Promise<string> {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(Math.round((width * 740) / 600)))
  const xml = new XMLSerializer().serializeToString(clone)
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
