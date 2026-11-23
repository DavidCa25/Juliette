/**
 * Categorías de la tienda (lo que ve la clienta en la Colección: "Planners", "Navidad", "Tote bags"…).
 * Se crean, renombran, ordenan y ocultan desde el panel; viven en content/settings.json.
 *
 * Son distintas del "tipo de pieza" de cada producto (tote, prenda, cuadro…), que sigue
 * decidiendo cosas como si se pide talla o medida.
 */
export type ShopCategory = {
  /** Dirección de la categoría: /coleccion/<id> */
  id: string
  name: string
  description?: string
  /** Foto de portada (opcional) */
  cover?: string
  /** Oculta: no aparece en la Colección, pero sus productos siguen en "Todas" */
  hidden?: boolean
}

/** Categorías iniciales (las mismas de antes), para tiendas que aún no las han editado. */
export const defaultCategories: ShopCategory[] = [
  { id: 'tote-bags', name: 'Tote bags' },
  { id: 'prendas', name: 'Prendas' },
  { id: 'cuadros', name: 'Cuadros' },
  { id: 'agendas-y-papeleria', name: 'Agendas y papelería' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'hogar', name: 'Hogar' },
  { id: 'otras-piezas', name: 'Otras piezas' },
]

/** Categoría que toma un producto que todavía no tiene una asignada, según su tipo de pieza. */
export const categoryForType: Record<string, string> = {
  tote: 'tote-bags',
  prenda: 'prendas',
  cuadro: 'cuadros',
  agenda: 'agendas-y-papeleria',
  accesorio: 'accesorios',
  hogar: 'hogar',
  otro: 'otras-piezas',
}

/** Convierte un nombre en dirección: "Agendas y papelería" → "agendas-y-papeleria". */
export function categorySlug(v: string) {
  return v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** Lista válida de categorías a partir de lo guardado (o las iniciales si no hay ninguna). */
export function readCategories(raw: unknown): ShopCategory[] {
  const list = Array.isArray(raw) ? raw : []
  const seen = new Set<string>()
  const out: ShopCategory[] = []
  for (const c of list) {
    if (!c || typeof c !== 'object') continue
    const x = c as Record<string, unknown>
    const name = typeof x.name === 'string' ? x.name.trim() : ''
    const id = categorySlug(typeof x.id === 'string' && x.id ? x.id : name)
    if (!name || !id || seen.has(id)) continue
    seen.add(id)
    out.push({
      id,
      name,
      description: typeof x.description === 'string' ? x.description : '',
      cover: typeof x.cover === 'string' ? x.cover : '',
      hidden: x.hidden === true,
    })
  }
  return out.length ? out : defaultCategories
}
