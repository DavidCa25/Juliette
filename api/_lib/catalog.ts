import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

/** Lee el catálogo publicado para recalcular precios en el servidor (no se confía en el navegador). */
type Raw = { name?: string; price?: number | string | null; status?: string }
let cache: Map<string, { name: string; price: number | null; status: string }> | null = null

export function catalog() {
  if (cache) return cache
  cache = new Map()
  const dir = path.join(process.cwd(), 'content', 'products')
  try {
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.json')) continue
      const r = JSON.parse(readFileSync(path.join(dir, f), 'utf8')) as Raw
      const n = r.price === null || r.price === undefined || r.price === '' ? null : Number(r.price)
      cache.set(f.replace(/\.json$/, ''), { name: r.name ?? f, price: Number.isFinite(n) && (n as number) > 0 ? (n as number) : null, status: r.status ?? 'disponible' })
    }
  } catch {
    /* sin catálogo disponible: los precios quedan por confirmar */
  }
  return cache
}
