/**
 * Los productos viven en content/products/*.json y se agregan o editan desde /admin.
 * Cada archivo es una pieza; el nombre del archivo es su dirección (ej. galaxia → /producto/galaxia).
 */
import { site } from '../config/site'

export type Media =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string; poster: string; alt: string }

export type ProductOption = {
  id: string
  label: string
  sub: string
  /** Precio adicional; null = se cotiza */
  extra: number | null
  extraLabel?: string
  needsIdea?: boolean
}

export type Category = 'tote' | 'prenda' | 'cuadro' | 'agenda' | 'accesorio' | 'hogar' | 'otro'
export type Status = 'disponible' | 'bajo-pedido' | 'agotado'

export const categories: Record<Category, string> = {
  tote: 'Tote bags',
  prenda: 'Prendas',
  cuadro: 'Cuadros',
  agenda: 'Agendas y papelería',
  accesorio: 'Accesorios',
  hogar: 'Hogar',
  otro: 'Otras piezas',
}

export type Product = {
  slug: string
  code: string
  name: string
  category: Category
  collection: string
  /** null = precio por confirmar */
  price: number | null
  status: Status
  featured: boolean
  order: number
  short: string
  description: string
  dimensions: string
  material: string
  technique: string
  media: Media[]
  cover: string
  options: ProductOption[]
}

type RawProduct = {
  name?: string
  code?: string
  category?: string
  collection?: string
  price?: number | string | null
  status?: string
  featured?: boolean
  order?: number
  personalizable?: boolean
  short?: string
  description?: string
  dimensions?: string
  material?: string
  technique?: string
  images?: ({ src?: string; alt?: string } | string)[]
  video?: string | null
}

const commonOptions: ProductOption[] = [
  { id: 'sin', label: 'Como en la foto', sub: 'Diseño de colección', extra: 0, extraLabel: 'Incluido' },
  { id: 'nombre', label: 'Con nombre o frase', sub: 'Agregamos tu texto a mano', extra: null, extraLabel: '+ [PRECIO]', needsIdea: true },
  { id: 'medida', label: 'Diseño a medida', sub: 'Boceto previo y un ajuste', extra: null, extraLabel: 'Cotizar', needsIdea: true },
]

const files = import.meta.glob<RawProduct>('../../content/products/*.json', { eager: true, import: 'default' })

function toNumber(v: RawProduct['price']): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

function normalize(path: string, r: RawProduct): Product | null {
  const slug = path.split('/').pop()!.replace(/\.json$/, '')
  if (!r.name) return null
  const images = (r.images ?? [])
    .map((i) => (typeof i === 'string' ? { src: i, alt: r.name! } : { src: i.src ?? '', alt: i.alt || r.name! }))
    .filter((i) => i.src)
  const cover = images[0]?.src ?? '/media/isotipo_burdeos_md.png'
  const media: Media[] = images.map((i) => ({ kind: 'image' as const, src: i.src, alt: i.alt }))
  if (r.video) media.push({ kind: 'video', src: r.video, poster: cover, alt: `Video de ${r.name}` })
  if (media.length === 0) media.push({ kind: 'image', src: cover, alt: r.name })
  const category = (r.category && r.category in categories ? r.category : 'otro') as Category
  const status = (['disponible', 'bajo-pedido', 'agotado'].includes(r.status ?? '') ? r.status : 'disponible') as Status
  return {
    slug,
    name: r.name,
    code: r.code ?? '',
    category,
    collection: r.collection ?? 'Colección',
    price: toNumber(r.price),
    status,
    featured: r.featured ?? false,
    order: r.order ?? 99,
    short: r.short ?? '',
    description: r.description ?? '',
    dimensions: r.dimensions ?? '[__]',
    material: r.material ?? '[__]',
    technique: r.technique ?? 'Pintura a mano',
    media,
    cover,
    options: r.personalizable === false ? [commonOptions[0]] : commonOptions,
  }
}

export const products: Product[] = Object.entries(files)
  .map(([path, r]) => normalize(path, r))
  .filter((p): p is Product => p !== null)
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

export const featuredProducts = (products.some((p) => p.featured) ? products.filter((p) => p.featured) : products).slice(0, 2)

export const getProduct = (slug: string) => products.find((p) => p.slug === slug)

export const showcaseVideos = site.videos.map((v) => ({
  src: v.video,
  poster: v.poster || '/media/isotipo_burdeos_md.png',
  title: v.title,
  tag: v.tag,
  label: `Video: ${v.title}`,
}))
