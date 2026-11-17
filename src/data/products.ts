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

export type Product = {
  slug: string
  code: string
  name: string
  collection: string
  /** null = precio por confirmar */
  price: number | null
  status: 'disponible' | 'bajo-pedido' | 'agotado'
  short: string
  description: string
  dimensions: string
  material: string
  technique: string
  media: Media[]
  options: ProductOption[]
}

const commonOptions: ProductOption[] = [
  { id: 'sin', label: 'Como en la foto', sub: 'Diseño de colección', extra: 0, extraLabel: 'Incluido' },
  { id: 'nombre', label: 'Con nombre o frase', sub: 'Agregamos tu texto a mano', extra: null, extraLabel: '+ [PRECIO]', needsIdea: true },
  { id: 'medida', label: 'Diseño a medida', sub: 'Boceto previo y un ajuste', extra: null, extraLabel: 'Cotizar', needsIdea: true },
]

export const products: Product[] = [
  {
    slug: 'galaxia',
    code: 'JLT-TB-001',
    name: 'Galaxia',
    collection: 'Colección 01',
    price: null,
    status: 'disponible',
    short: 'Lona de algodón · [__] × [__] cm',
    description:
      'Tote bag de lona de algodón con ilustración pintada a mano: trazos en tonos lavanda con detalles en negro y blanco. Por ser una pieza a mano, cada ejemplar tiene variaciones propias.',
    dimensions: '[__] × [__] cm · asas de [__] cm',
    material: 'Lona de algodón [gramaje], color natural',
    technique: 'Pintura textil a mano, fijada con calor',
    media: [
      { kind: 'image', src: '/media/still_bts.webp', alt: 'Tote bag Galaxia completa sobre pedestal' },
      { kind: 'image', src: '/media/still_bts_detalle.webp', alt: 'Acercamiento al diseño pintado a mano' },
      { kind: 'video', src: '/media/bts_totebag.mp4', poster: '/media/still_bts.webp', alt: 'Video de la pieza' },
    ],
    options: commonOptions,
  },
  {
    slug: 'polillas',
    code: 'JLT-TB-002',
    name: 'Polillas',
    collection: 'Colección 01',
    price: null,
    status: 'disponible',
    short: 'Lona de algodón · [__] × [__] cm',
    description:
      'Tote bag de lona de algodón con polillas y mariposas pintadas a mano en negro sobre lona natural. Un diseño original de Julietté; cada ejemplar conserva el trazo de su elaboración.',
    dimensions: '[__] × [__] cm · asas de [__] cm',
    material: 'Lona de algodón [gramaje], color natural',
    technique: 'Pintura textil a mano, fijada con calor',
    media: [
      { kind: 'image', src: '/media/still_polillas.webp', alt: 'Tote bag Polillas completa sobre pedestal' },
      { kind: 'image', src: '/media/still_polillas_detalle.webp', alt: 'Acercamiento a las polillas pintadas a mano' },
      { kind: 'video', src: '/media/polillas_totebag.mp4', poster: '/media/still_polillas.webp', alt: 'Video de la pieza' },
    ],
    options: commonOptions,
  },
]

export const getProduct = (slug: string) => products.find((p) => p.slug === slug)

export const showcaseVideos = [
  { src: '/media/polillas_totebag.mp4', poster: '/media/still_polillas.webp', title: 'Polillas', tag: 'Diseño Julietté', label: 'Video de la tote Polillas' },
  { src: '/media/snoopy_totebag.mp4', poster: '/media/still_snoopy.webp', title: 'Pedido personalizado', tag: 'A tu medida', label: 'Video de una tote personalizada' },
  { src: '/media/bts_totebag.mp4', poster: '/media/still_bts.webp', title: 'Galaxia', tag: 'Colección 01', label: 'Video de la tote Galaxia' },
]
