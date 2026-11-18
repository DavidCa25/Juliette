import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import type { Design } from '../data/design'
import { readJSON, writeJSON } from '../lib/format'
import { track } from '../lib/analytics'

export type ProductLine = {
  id: string
  kind: 'product'
  slug: string
  name: string
  image: string
  optionId: string
  optionLabel: string
  unitPrice: number | null
  idea?: string
  /** Talla o medida elegida, con su etiqueta (ej. "Talla M") */
  size?: string
  qty: number
}

export type CustomLine = {
  id: string
  kind: 'custom'
  name: string
  image: string
  design: Design
  unitPrice: number | null
  qty: number
}

export type CartLine = ProductLine | CustomLine
export type NewLine = Omit<ProductLine, 'id'> | Omit<CustomLine, 'id'>

type Action =
  | { type: 'add'; line: CartLine }
  | { type: 'remove'; id: string }
  | { type: 'qty'; id: string; qty: number }
  | { type: 'clear' }
  | { type: 'set'; lines: CartLine[] }

const KEY = 'jl-cart-v1'
const MAX_QTY = 10

function reducer(state: CartLine[], a: Action): CartLine[] {
  switch (a.type) {
    case 'add': {
      if (a.line.kind === 'product') {
        const l = a.line
        const same = state.find((x) => x.kind === 'product' && x.slug === l.slug && x.optionId === l.optionId && (x.idea ?? '') === (l.idea ?? '') && (x.size ?? '') === (l.size ?? ''))
        if (same) return state.map((x) => (x === same ? { ...x, qty: Math.min(MAX_QTY, x.qty + l.qty) } : x))
      }
      return [...state, a.line]
    }
    case 'remove':
      return state.filter((x) => x.id !== a.id)
    case 'qty':
      return state.map((x) => (x.id === a.id ? { ...x, qty: Math.max(1, Math.min(MAX_QTY, a.qty)) } : x))
    case 'clear':
      return []
    case 'set':
      return a.lines
  }
}

type CartCtx = {
  lines: CartLine[]
  count: number
  /** null si algún artículo tiene precio por confirmar */
  subtotal: number | null
  add: (line: NewLine) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const Ctx = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, undefined, () => readJSON<CartLine[]>(KEY, []))
  const [drawerOpen, setDrawer] = useState(false)

  useEffect(() => writeJSON(KEY, lines), [lines])

  // Sincroniza el carrito entre pestañas abiertas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) dispatch({ type: 'set', lines: readJSON<CartLine[]>(KEY, []) })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const add = useCallback((line: NewLine) => {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    dispatch({ type: 'add', line: { ...line, id } as CartLine })
    track('add_to_cart', line.kind === 'product' ? { kind: 'product', slug: line.slug, option: line.optionId } : { kind: 'custom', surface: line.design.surface, motif: line.design.motif })
    setDrawer(true)
  }, [])

  const value = useMemo<CartCtx>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0)
    const subtotal = lines.some((l) => l.unitPrice === null) ? null : lines.reduce((n, l) => n + (l.unitPrice ?? 0) * l.qty, 0)
    return {
      lines,
      count,
      subtotal,
      add,
      remove: (id) => dispatch({ type: 'remove', id }),
      setQty: (id, qty) => dispatch({ type: 'qty', id, qty }),
      clear: () => dispatch({ type: 'clear' }),
      drawerOpen,
      openDrawer: () => setDrawer(true),
      closeDrawer: () => setDrawer(false),
    }
  }, [lines, drawerOpen, add])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart debe usarse dentro de CartProvider')
  return c
}
