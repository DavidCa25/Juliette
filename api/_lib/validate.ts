/** Limpia y valida lo que llega del panel antes de guardarlo. */

const CATEGORIES = ['tote', 'prenda', 'cuadro', 'agenda', 'accesorio', 'hogar', 'otro']
const STATUS = ['disponible', 'bajo-pedido', 'agotado']

const str = (v: unknown, max = 400) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const num = (v: unknown) => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null
}
const int = (v: unknown, d: number) => {
  const n = Number(v)
  return Number.isFinite(n) ? Math.round(n) : d
}
const media = (v: unknown) => {
  const s = str(v, 600)
  return s.startsWith('https://') || s.startsWith('/media/') ? s : ''
}

export function cleanSlug(v: unknown) {
  return str(v, 80)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function cleanProduct(p: Record<string, unknown>) {
  const slug = cleanSlug(p.slug || p.name)
  const name = str(p.name, 80)
  if (!slug || !name) throw new Error('Cada producto necesita un nombre.')
  const images = (Array.isArray(p.images) ? p.images : [])
    .slice(0, 12)
    .map((i) => ({ src: media((i as Record<string, unknown>)?.src), alt: str((i as Record<string, unknown>)?.alt, 160) }))
    .filter((i) => i.src)
  if (images.length === 0) throw new Error(`"${name}" necesita al menos una foto.`)
  return {
    slug,
    name,
    code: str(p.code, 40),
    category: CATEGORIES.includes(String(p.category)) ? String(p.category) : 'otro',
    // Categoría de la tienda (ej. planners); vacía = la que corresponde a su tipo de pieza
    section: cleanSlug(p.section),
    // Fecha en que se agregó (para ordenar por "Más nuevas")
    added: /^\d{4}-\d{2}-\d{2}$/.test(String(p.added)) ? String(p.added) : '',
    collection: str(p.collection, 80) || 'Colección',
    price: num(p.price),
    status: STATUS.includes(String(p.status)) ? String(p.status) : 'disponible',
    featured: p.featured === true,
    order: int(p.order, 10),
    personalizable: p.personalizable !== false,
    short: str(p.short, 120),
    description: str(p.description, 2000),
    dimensions: str(p.dimensions, 160),
    material: str(p.material, 160),
    technique: str(p.technique, 160),
    sizes: (Array.isArray(p.sizes) ? p.sizes : [])
      .map((x) => str(x, 30))
      .filter(Boolean)
      .slice(0, 20),
    sizeLabel: ['Talla', 'Medida', 'Tamaño'].includes(String(p.sizeLabel)) ? String(p.sizeLabel) : 'Medida',
    images,
    video: media(p.video) || null,
  }
}

export function cleanSettings(s: Record<string, unknown>) {
  const o = (v: unknown) => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {})
  const ig = o(s.instagram)
  const tk = o(s.tiktok)
  const pol = o(s.policy)
  const legal = o(s.legal)
  return {
    whatsappDisplay: str(s.whatsappDisplay, 40),
    email: str(s.email, 120),
    instagram: { handle: str(ig.handle, 60), url: str(ig.url, 200) },
    tiktok: { handle: str(tk.handle, 60), url: str(tk.url, 200) },
    city: str(s.city, 80),
    shippingZone: str(s.shippingZone, 120),
    pickupPoint: str(s.pickupPoint, 160),
    weeklySlots: int(s.weeklySlots, 5),
    depositPercent: Math.min(100, Math.max(0, int(s.depositPercent, 50))),
    leadDaysReady: str(s.leadDaysReady, 20),
    leadDaysCustom: str(s.leadDaysCustom, 20),
    readyShipDays: str(s.readyShipDays, 20),
    shippingCost: num(s.shippingCost),
    freeShippingFrom: num(s.freeShippingFrom),
    customFrom: num(s.customFrom),
    nextDrop: str(s.nextDrop, 60),
    policy: {
      returnDays: int(pol.returnDays, 7),
      damageHours: int(pol.damageHours, 48),
      refundDays: int(pol.refundDays, 10),
      privacyDays: int(pol.privacyDays, 20),
      designFee: str(pol.designFee, 60),
    },
    legal: {
      owner: str(legal.owner, 160),
      taxId: str(legal.taxId, 40),
      address: str(legal.address, 240),
      country: str(legal.country, 60),
      updated: str(legal.updated, 60),
    },
    videos: (Array.isArray(s.videos) ? s.videos : [])
      .slice(0, 3)
      .map((v) => {
        const x = o(v)
        return { title: str(x.title, 80), tag: str(x.tag, 60), video: media(x.video), poster: media(x.poster) }
      })
      .filter((v) => v.video),
    categories: (Array.isArray(s.categories) ? s.categories : [])
      .slice(0, 40)
      .map((c) => {
        const x = o(c)
        const name = str(x.name, 60)
        return { id: cleanSlug(x.id || name).slice(0, 60), name, description: str(x.description, 280), cover: media(x.cover), hidden: x.hidden === true }
      })
      .filter((c, i, all) => c.id && c.name && all.findIndex((y) => y.id === c.id) === i),
  }
}
