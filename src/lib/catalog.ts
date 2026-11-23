import { useEffect, useState } from 'react'
import type { Product } from '../data/products'

/**
 * El catálogo se descarga aparte (no va en la carga inicial del sitio). Se pide una sola vez
 * y lo comparten todas las páginas.
 */
let pending: Promise<typeof import('../data/products')> | null = null
export const loadCatalog = () => (pending ??= import('../data/products'))

/** Piezas destacadas para el inicio; `null` mientras llegan. */
export function useFeatured() {
  const [list, setList] = useState<Product[] | null>(null)
  useEffect(() => {
    let on = true
    loadCatalog()
      .then((m) => on && setList(m.featuredProducts))
      .catch(() => on && setList([]))
    return () => {
      on = false
    }
  }, [])
  return list
}
