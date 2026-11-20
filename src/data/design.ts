/** Opciones de la experiencia "Diseña la tuya". */
export type SurfaceId = 'tote-natural' | 'tote-negra' | 'tote-mezclilla' | 'sudadera-beige' | 'sudadera-negra' | 'cuadro' | 'agenda'
export type SurfaceKind = 'tote' | 'sudadera' | 'cuadro' | 'agenda'

export type Surface = {
  id: SurfaceId
  name: string
  sub: string
  kind: SurfaceKind
  fabric: string
  trim: string
  stitch: string
  dark: boolean
}

export const surfaces: Surface[] = [
  { id: 'tote-natural', name: 'Tote natural', sub: 'Lona de algodón beige', kind: 'tote', fabric: '#f4ecdf', trim: '#eee4d2', stitch: '#d9ccb5', dark: false },
  { id: 'tote-negra', name: 'Tote negra', sub: 'Lona de algodón negra', kind: 'tote', fabric: '#2b2626', trim: '#231f1f', stitch: '#4a4242', dark: true },
  { id: 'tote-mezclilla', name: 'Tote de mezclilla', sub: 'Mezclilla azul', kind: 'tote', fabric: '#557597', trim: '#4a6a8c', stitch: '#d9a441', dark: true },
  { id: 'sudadera-beige', name: 'Sudadera beige', sub: 'Con gorro, algodón afelpado', kind: 'sudadera', fabric: '#ece1cf', trim: '#e3d6c0', stitch: '#c9b99c', dark: false },
  { id: 'sudadera-negra', name: 'Sudadera negra', sub: 'Con gorro, algodón afelpado', kind: 'sudadera', fabric: '#2c2828', trim: '#242020', stitch: '#4b4343', dark: true },
  { id: 'cuadro', name: 'Cuadro', sub: 'Lienzo en bastidor', kind: 'cuadro', fabric: '#fbf7f0', trim: '#b08a5e', stitch: '#e7dfd2', dark: false },
  { id: 'agenda', name: 'Agenda', sub: 'Portada de tela pintada', kind: 'agenda', fabric: '#efe4d2', trim: '#e0d1b9', stitch: '#c9b79a', dark: false },
]

export type MotifId = 'cerezas' | 'celestial' | 'floral' | 'mariposas' | 'solo-texto' | 'mi-idea' | 'lienzo'

/** Trazos pintados a mano por el cliente, en coordenadas de la vista previa (600 × 740). */
export type BrushId = 'pincel' | 'plumon' | 'acuarela' | 'seca' | 'aerosol' | 'caligrafia' | 'marcador' | 'goma'
export type StickerId =
  | 'estrella' | 'destello' | 'estrella5' | 'corazon' | 'corazon-linea' | 'cereza' | 'flor' | 'margarita'
  | 'hoja' | 'mariposa' | 'luna' | 'sol' | 'nube' | 'mono' | 'nota' | 'gota' | 'galaxia'
/** @deprecated nombre anterior de los sellos */
export type StampKind = StickerId
export type Stroke =
  | { t: 'line'; c: string; w: number; p: number[]; b?: BrushId; o?: number }
  /** k: un sticker propio de Julietté o uno de la biblioteca ("categoria/nombre") */
  | { t: 'stamp'; c: string; k: StickerId | string; x: number; y: number; s: number; r?: number; f?: boolean }
export const MAX_POINTS = 14000
export type PaletteId = 'borgona' | 'lavanda' | 'tinta' | 'primavera'
export type FontId = 'serif' | 'script' | 'moderna'
export type PlacementId = 'arriba' | 'centro' | 'abajo'
export type SizeId = 's' | 'm' | 'l'

export type Design = {
  surface: SurfaceId
  motif: MotifId
  palette: PaletteId
  text: string
  font: FontId
  placement: PlacementId
  size: SizeId
  back: boolean
  occasion: string
  date: string
  notes: string
  /** Talla de la prenda, medida del cuadro o tamaño de la agenda */
  fit: string
  /** Imagen de referencia (data URL reducido) */
  reference: string | null
  /** Lo que el cliente pintó a mano sobre la pieza */
  strokes: Stroke[]
}

export const defaultDesign: Design = {
  surface: 'tote-natural',
  motif: 'cerezas',
  palette: 'borgona',
  text: '',
  font: 'serif',
  placement: 'abajo',
  size: 'm',
  back: false,
  occasion: '',
  date: '',
  notes: '',
  fit: '',
  reference: null,
  strokes: [],
}

export const motifs: { id: MotifId; name: string; sub: string }[] = [
  { id: 'cerezas', name: 'Cerezas y moño', sub: 'El clásico de la casa' },
  { id: 'celestial', name: 'Celestial', sub: 'Luna, estrellas y planetas' },
  { id: 'floral', name: 'Floral', sub: 'Flores sueltas y hojas' },
  { id: 'mariposas', name: 'Alas', sub: 'Mariposas y polillas' },
  { id: 'solo-texto', name: 'Solo palabras', sub: 'Tu frase como protagonista' },
  { id: 'lienzo', name: 'Dibújala tú', sub: 'Pinta con tu dedo o mouse' },
  { id: 'mi-idea', name: 'Mi propia idea', sub: 'Sube una referencia' },
]

export const palettes: { id: PaletteId; name: string; colors: [string, string, string] }[] = [
  { id: 'borgona', name: 'Borgoña', colors: ['#82001a', '#c23b4e', '#1a1a1a'] },
  { id: 'lavanda', name: 'Lavanda', colors: ['#6f5bb5', '#a99be0', '#1a1a1a'] },
  { id: 'tinta', name: 'Tinta', colors: ['#1a1a1a', '#5a5a5a', '#1a1a1a'] },
  { id: 'primavera', name: 'Primavera', colors: ['#d9576b', '#e8a33d', '#3f7a52'] },
]

export const fonts: { id: FontId; name: string; family: string; style: 'normal' | 'italic'; weight: number; transform: 'none' | 'uppercase' }[] = [
  { id: 'serif', name: 'Editorial', family: "'Cormorant Garamond', serif", style: 'italic', weight: 400, transform: 'none' },
  { id: 'script', name: 'Manuscrita', family: "'Pinyon Script', cursive", style: 'normal', weight: 400, transform: 'none' },
  { id: 'moderna', name: 'Moderna', family: "'Montserrat', sans-serif", style: 'normal', weight: 700, transform: 'uppercase' },
]

export const placements: { id: PlacementId; name: string }[] = [
  { id: 'arriba', name: 'Arriba' },
  { id: 'centro', name: 'Centro' },
  { id: 'abajo', name: 'Abajo' },
]

export const sizes: { id: SizeId; name: string; scale: number }[] = [
  { id: 's', name: 'Delicado', scale: 0.72 },
  { id: 'm', name: 'Equilibrado', scale: 1 },
  { id: 'l', name: 'Protagonista', scale: 1.25 },
]

export const occasions = ['Para mí', 'Cumpleaños', 'Aniversario', 'Graduación', 'Regalo especial', 'Otra ocasión']

/** Talla, medida o tamaño que se pide según la pieza (las totes tienen una sola medida). */
export const fitOptions: Partial<Record<SurfaceKind, { label: string; options: string[]; hint: string }>> = {
  sudadera: { label: 'Talla', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Llevo mi propia prenda'], hint: 'Si ya tienes la prenda que quieres pintar, elige "Llevo mi propia prenda".' },
  cuadro: { label: 'Medida', options: ['20 × 25 cm', '30 × 40 cm', '40 × 50 cm', '50 × 70 cm'], hint: 'Medida del lienzo en bastidor.' },
  agenda: { label: 'Tamaño', options: ['A6 · 10.5 × 14.8 cm', 'A5 · 14.8 × 21 cm'], hint: 'Tapa de tela pintada a mano.' },
}
export const fitFor = (id: SurfaceId) => fitOptions[surfaces.find((s) => s.id === id)?.kind ?? 'tote']
export const fitLabel = (id: SurfaceId) => fitFor(id)?.label ?? 'Medida'

export function describeDesign(d: Design) {
  const m = motifs.find((x) => x.id === d.motif)?.name ?? d.motif
  const p = palettes.find((x) => x.id === d.palette)?.name ?? d.palette
  const f = fonts.find((x) => x.id === d.font)?.name ?? d.font
  const sf = surfaces.find((x) => x.id === d.surface)
  const lines = [
    `Pieza: ${sf ? `${sf.name} (${sf.sub.toLowerCase()})` : d.surface}`,
    d.fit ? (d.fit === 'Llevo mi propia prenda' ? 'Prenda: la entrega el cliente' : `${fitLabel(d.surface)}: ${d.fit}`) : '',
    `Motivo: ${m}`,
    `Paleta: ${p}`,
    `Tamaño: ${sizes.find((s) => s.id === d.size)?.name}`,
    d.text ? `Texto: "${d.text}" (${f}, ${d.placement})` : 'Sin texto',
    sf?.kind === 'cuadro' ? '' : d.back ? 'Frente y reverso' : 'Solo frente',
  ]
  if (d.occasion) lines.push(`Ocasión: ${d.occasion}`)
  if (d.date) lines.push(`Fecha deseada: ${d.date}`)
  if (d.notes) lines.push(`Notas: ${d.notes}`)
  if (d.strokes?.length) lines.push(`Trazos a mano: ${d.strokes.length} (se ven en el boceto)`)
  if (d.reference) lines.push('Incluye imagen de referencia (la envío en el chat)')
  return lines.filter(Boolean)
}

/**
 * Lo que cambia el dibujo de la pieza (sin notas, fecha, talla ni ocasión). La vista 3D solo vuelve a
 * estampar el diseño cuando esto cambia, así escribir en otros campos no la vuelve lenta.
 */
export const designLook = (d: Design) =>
  JSON.stringify([d.surface, d.motif, d.palette, d.text, d.font, d.placement, d.size, d.back, d.reference ? `${d.reference.length}:${d.reference.slice(-48)}` : '', d.strokes])
