/** Opciones de la experiencia "Diseña la tuya". */
export type MotifId = 'cerezas' | 'celestial' | 'floral' | 'mariposas' | 'solo-texto' | 'mi-idea'
export type PaletteId = 'borgona' | 'lavanda' | 'tinta' | 'primavera'
export type FontId = 'serif' | 'script' | 'moderna'
export type PlacementId = 'arriba' | 'centro' | 'abajo'
export type SizeId = 's' | 'm' | 'l'

export type Design = {
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
  /** Imagen de referencia (data URL reducido) */
  reference: string | null
}

export const defaultDesign: Design = {
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
  reference: null,
}

export const motifs: { id: MotifId; name: string; sub: string }[] = [
  { id: 'cerezas', name: 'Cerezas y moño', sub: 'El clásico de la casa' },
  { id: 'celestial', name: 'Celestial', sub: 'Luna, estrellas y planetas' },
  { id: 'floral', name: 'Floral', sub: 'Flores sueltas y hojas' },
  { id: 'mariposas', name: 'Alas', sub: 'Mariposas y polillas' },
  { id: 'solo-texto', name: 'Solo palabras', sub: 'Tu frase como protagonista' },
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

export function describeDesign(d: Design) {
  const m = motifs.find((x) => x.id === d.motif)?.name ?? d.motif
  const p = palettes.find((x) => x.id === d.palette)?.name ?? d.palette
  const f = fonts.find((x) => x.id === d.font)?.name ?? d.font
  const lines = [
    `Motivo: ${m}`,
    `Paleta: ${p}`,
    `Tamaño: ${sizes.find((s) => s.id === d.size)?.name}`,
    d.text ? `Texto: "${d.text}" (${f}, ${d.placement})` : 'Sin texto',
    d.back ? 'Frente y reverso' : 'Solo frente',
  ]
  if (d.occasion) lines.push(`Ocasión: ${d.occasion}`)
  if (d.date) lines.push(`Fecha deseada: ${d.date}`)
  if (d.notes) lines.push(`Notas: ${d.notes}`)
  if (d.reference) lines.push('Incluye imagen de referencia (la envío en el chat)')
  return lines
}
