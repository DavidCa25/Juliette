import { forwardRef } from 'react'
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
export function MotifArt({ motif, colors, reference }: { motif: MotifId; colors: [string, string, string]; reference?: string | null }) {
  const [c1, c2, c3] = colors
  switch (motif) {
    case 'cerezas':
      return (
        <g>
          <g fill="none" stroke={c1} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M0 -84 C-22 -112 -70 -122 -78 -100 C-86 -76 -40 -70 0 -84 Z" />
            <path d="M0 -84 C22 -112 70 -122 78 -100 C86 -76 40 -70 0 -84 Z" />
            <path d="M-4 -78 C-18 -56 -34 -42 -50 -30 M4 -78 C18 -56 34 -42 50 -30" />
            <path d="M-2 -78 C-10 -30 -26 0 -44 26" strokeWidth={3.6} />
            <path d="M2 -78 C14 -28 26 10 40 44" strokeWidth={3.6} />
          </g>
          <ellipse cx={0} cy={-82} rx={9} ry={8} fill={CREAM} stroke={c1} strokeWidth={3} />
          <circle cx={-48} cy={58} r={36} fill={c1} />
          <circle cx={44} cy={78} r={36} fill={c1} />
          <ellipse cx={-62} cy={44} rx={6} ry={12} transform="rotate(-30 -62 44)" fill={CREAM} />
          <ellipse cx={30} cy={64} rx={6} ry={12} transform="rotate(-30 30 64)" fill={CREAM} />
          <circle cx={-30} cy={80} r={4} fill={c2} />
          <circle cx={62} cy={100} r={4} fill={c2} />
        </g>
      )
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
  const swap = (c: string) => (['#1a1a1a', '#5a5a5a'].includes(c) ? (c === '#1a1a1a' ? '#fdf6ee' : '#d8d0c6') : c)
  return [swap(colors[0]), swap(colors[1]), swap(colors[2])]
}

function SurfaceBase({ s, showPedestal }: { s: Surface; showPedestal: boolean }) {
  const pedestal = showPedestal && (
    <g>
      <ellipse cx={300} cy={712} rx={230} ry={20} fill="#000" opacity={0.18} />
      <path d="M80 690 Q80 676 100 676 H500 Q520 676 520 690 V700 Q520 712 500 712 H100 Q80 712 80 700 Z" fill="#efe9e3" />
      <rect x={80} y={676} width={440} height={8} rx={4} fill="#ffffff" opacity={0.7} />
    </g>
  )

  if (s.kind === 'chamarra') {
    const body = 'M210 132 Q300 160 390 132 L468 168 Q514 186 534 244 L572 560 Q575 580 556 584 L506 590 Q490 591 488 575 L466 340 L468 632 Q468 652 448 652 H152 Q132 652 132 632 L134 340 L112 575 Q110 591 94 590 L44 584 Q25 580 28 560 L66 244 Q86 186 132 168 Z'
    return (
      <g>
        <path d="M300 104 V76 Q300 56 318 56 Q336 56 336 74" fill="none" stroke="#c9b48f" strokeWidth={5} strokeLinecap="round" />
        <path d="M186 140 Q300 92 414 140" fill="none" stroke="#c9b48f" strokeWidth={6} strokeLinecap="round" />
        <path d={body} fill={s.fabric} filter="url(#jl-lona)" />
        <path d={body} fill="url(#jl-sombra)" />
        <path d="M210 132 Q300 186 390 132 Q370 108 300 104 Q230 108 210 132 Z" fill={s.trim} />
        <path d="M134 262 Q300 302 466 262" fill="none" stroke={s.stitch} strokeWidth={2} strokeDasharray="5 5" />
        <path d="M134 270 Q300 310 466 270" fill="none" stroke={s.stitch} strokeWidth={2} strokeDasharray="5 5" />
        <rect x={132} y={612} width={336} height={40} fill={s.trim} />
        <path d="M132 616 H468" stroke={s.stitch} strokeWidth={2} strokeDasharray="5 5" />
        <path d="M66 250 L44 560 M534 250 L556 560" stroke={s.stitch} strokeWidth={1.6} strokeDasharray="5 6" fill="none" />
      </g>
    )
  }

  if (s.kind === 'cuadro') {
    return (
      <g>
        <g stroke="#b08a5e" strokeWidth={14} strokeLinecap="round">
          <path d="M230 90 L160 724" />
          <path d="M370 90 L440 724" />
          <path d="M300 70 L300 724" strokeWidth={10} opacity={0.7} />
        </g>
        <rect x={130} y={612} width={340} height={18} rx={4} fill="#9c774d" />
        <rect x={136} y={102} width={328} height={512} fill="#000" opacity={0.16} transform="translate(8 8)" />
        <rect x={136} y={102} width={328} height={512} fill={s.fabric} filter="url(#jl-lona)" />
        <rect x={136} y={102} width={328} height={512} fill="url(#jl-sombra)" />
        <rect x={456} y={102} width={8} height={512} fill={s.stitch} />
      </g>
    )
  }

  if (s.kind === 'agenda') {
    return (
      <g>
        {pedestal}
        <rect x={176} y={162} width={262} height={500} rx={14} fill="#f7f1e8" transform="translate(10 8)" />
        <path d="M444 180 V650" stroke="#e7dccb" strokeWidth={2} />
        <rect x={168} y={156} width={268} height={506} rx={14} fill={s.fabric} filter="url(#jl-lona)" />
        <rect x={168} y={156} width={268} height={506} rx={14} fill="url(#jl-sombra)" />
        <rect x={168} y={156} width={30} height={506} rx={10} fill={s.trim} />
        <path d="M198 156 V662" stroke={s.stitch} strokeWidth={1.5} strokeDasharray="4 5" />
        <rect x={404} y={156} width={12} height={506} fill="#82001a" />
        <path d="M360 662 L360 700 L370 690 L380 700 L380 662" fill="#82001a" />
      </g>
    )
  }

  return (
    <g>
      {pedestal}
      <g fill="none" stroke={s.trim} strokeWidth={22} strokeLinecap="round">
        <path d="M205 240 C205 70 285 70 285 240" />
        <path d="M315 240 C315 70 395 70 395 240" />
      </g>
      <g fill="none" stroke={s.stitch} strokeWidth={1.5} strokeDasharray="4 5">
        <path d="M197 240 C197 64 293 64 293 240" />
        <path d="M307 240 C307 64 403 64 403 240" />
      </g>
      <path d="M138 228 H462 L474 660 Q475 676 459 676 H141 Q125 676 126 660 Z" fill={s.fabric} filter="url(#jl-lona)" />
      <path d="M138 228 H462 L474 660 Q475 676 459 676 H141 Q125 676 126 660 Z" fill="url(#jl-sombra)" />
      <path d="M137 252 H463" stroke={s.stitch} strokeWidth={2} />
      <path d="M137 258 H463" stroke={s.stitch} strokeWidth={1} strokeDasharray="3 5" />
      {s.id === 'tote-mezclilla' && <path d="M146 236 V664 M454 236 L466 664" stroke={s.stitch} strokeWidth={1.6} strokeDasharray="5 6" fill="none" />}
    </g>
  )
}

/** Vista previa de la pieza: se actualiza en vivo con cada decisión. */
export const ToteCanvas = forwardRef<SVGSVGElement, { design: Design; showPedestal?: boolean }>(function ToteCanvas({ design, showPedestal = true }, ref) {
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
  const showTag = surface.kind === 'tote'
  const showBack = design.back && surface.kind !== 'cuadro' && surface.kind !== 'chamarra'

  return (
    <svg ref={ref} viewBox="0 0 600 740" role="img" aria-label={label} className="w-full h-auto block" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="jl-lona" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.28  0 0 0 0.10 0" result="t" />
          <feComposite in="t" in2="SourceGraphic" operator="in" result="tt" />
          <feBlend in="SourceGraphic" in2="tt" mode="multiply" />
        </filter>
        <linearGradient id="jl-sombra" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".10" />
          <stop offset=".18" stopColor="#000" stopOpacity="0" />
          <stop offset=".82" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".12" />
        </linearGradient>
      </defs>

      <g key={surface.id} className="jl-svg-pop">
        <SurfaceBase s={surface} showPedestal={showPedestal} />
      </g>

      <g transform={`translate(${surface.kind === 'agenda' ? 312 : 300} ${motifY}) scale(${motifScale})`}>
        <g key={`${design.motif}-${design.palette}-${design.size}-${design.surface}-${design.reference ? 1 : 0}`} className="jl-svg-pop">
          <MotifArt motif={design.motif} colors={palette} reference={design.reference} />
        </g>
      </g>

      {hasText && (
        <text
          key={`${design.font}-${design.placement}`}
          className="jl-svg-pop"
          x={surface.kind === 'agenda' ? 312 : 300}
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

      {showTag && (
        <g transform="translate(418 262)">
          <rect x={-18} y={0} width={36} height={46} rx={18} fill="#fdf6ee" stroke="#82001a" strokeWidth={3} />
          <circle cx={-6} cy={28} r={6} fill="#82001a" />
          <circle cx={6} cy={31} r={6} fill="#82001a" />
          <path d="M0 6 V0" stroke="#c9a96a" strokeWidth={2} />
        </g>
      )}

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
