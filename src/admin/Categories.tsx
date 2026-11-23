import { useState } from 'react'
import { categorySlug, readCategories, type ShopCategory } from '../data/categories'
import type { AdminContent } from './client'
import { UploadButton } from './fields'

/**
 * Categorías de la tienda: crear, renombrar, describir, ordenar, ocultar y eliminar.
 * Al eliminar una categoría con piezas, se pide a cuál pasarlas para que ninguna quede fuera.
 */
export function Categories({ draft, onChange, onOpenProducts }: { draft: AdminContent; onChange: (c: AdminContent) => void; onOpenProducts: (categoryId: string) => void }) {
  const list = readCategories(draft.settings.categories)
  // Las categorías nuevas toman su dirección del nombre hasta que se publican
  const [fresh, setFresh] = useState<string[]>([])
  const [removing, setRemoving] = useState<{ id: string; to: string } | null>(null)
  const count = (id: string) => draft.products.filter((p) => p.section === id).length

  const save = (next: ShopCategory[], products = draft.products) => onChange({ ...draft, settings: { ...draft.settings, categories: next }, products })

  function edit(id: string, patch: Partial<ShopCategory>) {
    let nextId = id
    if (patch.name !== undefined && fresh.includes(id)) {
      const base = categorySlug(patch.name) || id
      nextId = base
      let n = 2
      while (list.some((c) => c.id === nextId && c.id !== id)) nextId = `${base}-${n++}`
    }
    const next = list.map((c) => (c.id === id ? { ...c, ...patch, id: nextId } : c))
    const products = nextId === id ? draft.products : draft.products.map((p) => (p.section === id ? { ...p, section: nextId } : p))
    if (nextId !== id) setFresh((f) => f.map((x) => (x === id ? nextId : x)))
    save(next, products)
  }

  function move(i: number, d: -1 | 1) {
    const j = i + d
    if (j < 0 || j >= list.length) return
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    save(next)
  }

  function add() {
    let id = 'nueva-categoria'
    let n = 2
    while (list.some((c) => c.id === id)) id = `nueva-categoria-${n++}`
    setFresh((f) => [...f, id])
    save([...list, { id, name: 'Nueva categoría', description: '', cover: '', hidden: false }])
  }

  function remove(id: string, to: string) {
    const products = to ? draft.products.map((p) => (p.section === id ? { ...p, section: to } : p)) : draft.products
    save(
      list.filter((c) => c.id !== id),
      products,
    )
    setRemoving(null)
  }

  return (
    <section className="jl-fade flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2 max-w-[620px]">
          <h2 className="m-0 font-display font-light text-[40px] leading-none">Categorías de la tienda</h2>
          <p className="m-0 text-[14px] leading-[1.7]">
            Son los botones de la Colección (por ejemplo “Planners” o “Navidad”). Cada una tiene su propia dirección para compartir. El orden de esta lista es el orden en el sitio; solo se muestran las que tienen piezas.
          </p>
        </div>
        <button type="button" onClick={add} className="min-h-[48px] px-6 rounded-full border-0 bg-borgona text-crema text-[14px] font-semibold cursor-pointer">
          Nueva categoría
        </button>
      </div>

      <ul className="m-0 p-0 list-none flex flex-col border-b border-borgona">
        {list.map((c, i) => {
          const n = count(c.id)
          const isNew = fresh.includes(c.id)
          return (
            <li key={i} className="border-t border-borgona py-5 grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr_auto] gap-x-5 gap-y-4 items-start">
              <span className="w-[72px] sm:w-[88px] aspect-[4/5] rounded-t-full overflow-hidden bg-vino flex items-center justify-center">
                {c.cover ? <img src={c.cover} alt="" className="w-full h-full object-cover" /> : <span className="text-crema/70 text-[11px] text-center px-2">Sin portada</span>}
              </span>

              <div className="flex flex-col gap-3 min-w-0">
                <label className="flex flex-col gap-1">
                  <span className="jl-label">Nombre</span>
                  <input value={c.name} onChange={(e) => edit(c.id, { name: e.target.value })} maxLength={60} className="jl-field font-display text-[26px]! py-2!" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="jl-label">Descripción (opcional)</span>
                  <input value={c.description ?? ''} onChange={(e) => edit(c.id, { description: e.target.value })} maxLength={280} placeholder="Se muestra arriba de la categoría" className="jl-field text-[14px]!" />
                </label>
                <span className="text-[12px]">
                  Dirección: /coleccion/{c.id}
                  {isNew ? ' (se crea con el nombre)' : ''} ·{' '}
                  <button type="button" onClick={() => onOpenProducts(c.id)} className="jl-link bg-transparent border-0 p-0 text-borgona text-[12px] font-semibold cursor-pointer">
                    {n === 1 ? '1 pieza' : `${n} piezas`}
                  </button>
                  {c.hidden ? ' · Oculta' : n === 0 ? ' · No se muestra hasta que tenga piezas' : ''}
                </span>
                <div className="flex flex-wrap items-center gap-4">
                  <UploadButton accept="image/*" folder="ajustes" label={c.cover ? 'Cambiar portada' : 'Subir portada'} onUploaded={(url) => edit(c.id, { cover: url })} />
                  {c.cover && (
                    <button type="button" onClick={() => edit(c.id, { cover: '' })} className="jl-link bg-transparent border-0 p-0 text-borgona text-[13px] font-semibold cursor-pointer">
                      Quitar portada
                    </button>
                  )}
                </div>
                {removing?.id === c.id && (
                  <div role="group" aria-label={`Eliminar ${c.name}`} className="flex flex-wrap items-end gap-3 p-4 rounded-[16px] bg-rosa/50">
                    {n > 0 ? (
                      <label className="flex flex-col gap-1">
                        <span className="text-[13px] font-semibold">Pasar sus {n} piezas a</span>
                        <select value={removing.to} onChange={(e) => setRemoving({ id: c.id, to: e.target.value })} className="jl-field cursor-pointer min-w-[200px]">
                          {list
                            .filter((x) => x.id !== c.id)
                            .map((x) => (
                              <option key={x.id} value={x.id}>{x.name}</option>
                            ))}
                        </select>
                      </label>
                    ) : (
                      <span className="text-[13px] font-semibold">No tiene piezas. ¿Eliminarla?</span>
                    )}
                    <button type="button" onClick={() => remove(c.id, removing.to)} className="min-h-[44px] px-5 rounded-full border-0 bg-borgona text-crema text-[13px] font-semibold cursor-pointer">
                      Eliminar categoría
                    </button>
                    <button type="button" onClick={() => setRemoving(null)} className="min-h-[44px] px-3 bg-transparent border-0 text-borgona text-[13px] font-semibold cursor-pointer">
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1 flex sm:flex-col items-center sm:items-end gap-3 text-[13px] font-semibold">
                <span className="flex gap-1">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Subir ${c.name}`} className="w-10 h-10 rounded-full border border-borgona/30 bg-transparent text-borgona cursor-pointer disabled:opacity-30">↑</button>
                  <button type="button" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label={`Bajar ${c.name}`} className="w-10 h-10 rounded-full border border-borgona/30 bg-transparent text-borgona cursor-pointer disabled:opacity-30">↓</button>
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!c.hidden} onChange={(e) => edit(c.id, { hidden: !e.target.checked })} className="w-4 h-4 accent-[#82001a]" />
                  Visible
                </label>
                {list.length > 1 && (
                  <button type="button" onClick={() => setRemoving({ id: c.id, to: list.find((x) => x.id !== c.id)!.id })} className="jl-link bg-transparent border-0 p-0 text-borgona cursor-pointer">
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
