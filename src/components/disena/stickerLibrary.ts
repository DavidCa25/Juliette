/**
 * Biblioteca de stickers por categoría. Cada categoría es un JSON aparte que se descarga
 * solo cuando el cliente la abre (o cuando un diseño guardado usa uno de sus stickers).
 */
import { useEffect, useState } from 'react'

export type LibrarySticker = { id: string; name: string; body: string; w: number; h: number }
export type StickerCategory = { id: string; name: string; count: number; cover: { body: string; w: number; h: number } | null; names: [string, string][] }

// El índice (portadas y nombres para el buscador) también se descarga solo al abrir la pestaña de stickers
let indexPromise: Promise<StickerCategory[]> | null = null
export function loadIndex() {
  indexPromise ??= import('../../data/stickers/index.json').then((m) => m.default as unknown as StickerCategory[])
  return indexPromise
}

export function useStickerIndex(enabled: boolean) {
  const [index, setIndex] = useState<StickerCategory[] | null>(null)
  useEffect(() => {
    if (!enabled) return
    let alive = true
    loadIndex().then((i) => alive && setIndex(i))
    return () => {
      alive = false
    }
  }, [enabled])
  return index
}

/** Quita acentos y mayúsculas para buscar "calavera" o "corazon" sin importar cómo se escriba. */
export const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const files = import.meta.glob<LibrarySticker[]>(['../../data/stickers/*.json', '!../../data/stickers/index.json'], { import: 'default' })
const loaders: Record<string, () => Promise<LibrarySticker[]>> = Object.fromEntries(
  Object.entries(files).map(([path, load]) => [path.split('/').pop()!.replace(/\.json$/, ''), load]),
)

const cache = new Map<string, LibrarySticker>()
const loaded = new Map<string, Promise<LibrarySticker[]>>()

export function loadCategory(cat: string): Promise<LibrarySticker[]> {
  if (!loaders[cat]) return Promise.resolve([])
  if (!loaded.has(cat)) {
    loaded.set(
      cat,
      loaders[cat]().then((items) => {
        for (const it of items) cache.set(it.id, it)
        return items
      }),
    )
  }
  return loaded.get(cat)!
}

export const isLibrarySticker = (k: string) => k.includes('/')

/** Lista de una categoría (se carga al abrirla). */
export function useStickerCategory(cat: string | null) {
  const [items, setItems] = useState<LibrarySticker[] | null>(null)
  useEffect(() => {
    if (!cat) return
    let alive = true
    setItems(null)
    loadCategory(cat).then((list) => alive && setItems(list))
    return () => {
      alive = false
    }
  }, [cat])
  return items
}

/** Un sticker por su id ("categoria/nombre"); lo carga si hace falta. */
export function useLibrarySticker(id: string) {
  const [item, setItem] = useState<LibrarySticker | undefined>(() => cache.get(id))
  useEffect(() => {
    if (cache.has(id)) {
      setItem(cache.get(id))
      return
    }
    let alive = true
    loadCategory(id.split('/')[0]).then(() => alive && setItem(cache.get(id)))
    return () => {
      alive = false
    }
  }, [id])
  return item
}
