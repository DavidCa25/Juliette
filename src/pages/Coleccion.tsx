import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { products, type Product } from '../data/products'
import { categoryForType } from '../data/categories'
import { usePageMeta } from '../lib/usePageMeta'
import { money } from '../lib/format'
import { shopCategories, site } from '../config/site'
import { ProductCard } from '../components/home/ProductCard'
import { Arrow, btnLight, container } from '../components/ui'

/** Cuántas piezas se muestran de entrada (y cuántas más con cada "Ver más"). */
const PAGE = 12

const sorts = [
  { id: 'destacadas', label: 'Destacadas' },
  { id: 'nuevas', label: 'Más nuevas' },
  { id: 'precio-asc', label: 'Precio: menor a mayor' },
  { id: 'precio-desc', label: 'Precio: mayor a menor' },
] as const
type SortId = (typeof sorts)[number]['id']

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function sortList(list: Product[], by: SortId) {
  const out = [...list]
  if (by === 'nuevas') out.sort((a, b) => (b.added || '').localeCompare(a.added || '') || a.order - b.order)
  // Las piezas sin precio (se cotizan) van al final en ambos órdenes de precio
  if (by === 'precio-asc') out.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
  if (by === 'precio-desc') out.sort((a, b) => (b.price ?? -1) - (a.price ?? -1))
  return out
}

export default function Coleccion() {
  const { categoria } = useParams()
  const [params, setParams] = useSearchParams()
  const active = categoria ? shopCategories.find((c) => c.id === categoria) : undefined
  const sort = (sorts.some((s) => s.id === params.get('orden')) ? params.get('orden') : 'destacadas') as SortId
  const [q, setQ] = useState('')
  const [shown, setShown] = useState(PAGE)

  usePageMeta(
    active ? active.name : 'Colección',
    active?.description || 'Piezas pintadas a mano por Julietté: tote bags, prendas, cuadros, agendas y piezas a medida.',
  )

  // Categorías con piezas (y cuántas tiene cada una), en el orden del panel; las ocultas no se listan
  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of products) m.set(p.section, (m.get(p.section) ?? 0) + 1)
    return m
  }, [])
  const chips = shopCategories.filter((c) => !c.hidden && (counts.get(c.id) ?? 0) > 0)

  const list = useMemo(() => {
    let l = active ? products.filter((p) => p.section === active.id) : products
    const t = norm(q.trim())
    // Cada palabra buscada debe aparecer (en cualquier orden): "planner flores" encuentra "Planner de flores"
    const words = t.split(/\s+/).filter(Boolean)
    if (words.length) l = l.filter((p) => {
      const hay = norm(`${p.name} ${p.short} ${p.collection} ${p.code}`)
      return words.every((w) => hay.includes(w))
    })
    return sortList(l, sort)
  }, [active, q, sort])

  // Al cambiar de categoría, orden o búsqueda se vuelve a empezar desde las primeras piezas
  useEffect(() => setShown(PAGE), [categoria, sort, q])

  // Direcciones antiguas (?tipo=agenda) llevan a la categoría nueva
  const legacy = params.get('tipo')
  if (!categoria && legacy && categoryForType[legacy]) return <Navigate to={`/coleccion/${categoryForType[legacy]}`} replace />
  if (categoria && !active) return <Navigate to="/coleccion" replace />

  const visible = list.slice(0, shown)
  const rest = list.length - visible.length
  const query = sort === 'destacadas' ? '' : `?orden=${sort}`

  return (
    <div className="bg-vino text-crema">
      <section className={`${container} pt-[clamp(56px,8vw,120px)] pb-[clamp(72px,10vw,150px)]`}>
        <div className="flex flex-wrap justify-between items-end gap-8 mb-[clamp(32px,4vw,56px)]">
          <div className="flex flex-col gap-[18px]">
            <p className="m-0 jl-eyebrow text-rosa">Colección · Piezas pintadas a mano</p>
            <h1 className="m-0 font-display font-light text-[clamp(56px,7vw,110px)] leading-[.92]">
              {active ? active.name : <>Toda la <span className="italic">colección</span></>}
            </h1>
          </div>
          <p className="m-0 max-w-[380px] text-[16px] leading-[1.7] text-rosa">
            {active?.description || 'Cada pieza se pinta a mano, lista para entregar o bajo pedido. Si no encuentras lo que buscas, créalo con nosotros.'}
          </p>
        </div>

        {chips.length > 1 && (
          <nav aria-label="Categorías" className="-mx-5 px-5 sm:mx-0 sm:px-0 mb-8 overflow-x-auto">
            <ul className="m-0 p-0 list-none flex sm:flex-wrap gap-2 w-max sm:w-auto">
              {[{ id: '', name: 'Todas', n: products.length }, ...chips.map((c) => ({ id: c.id, name: c.name, n: counts.get(c.id) ?? 0 }))].map((c) => {
                const on = (active?.id ?? '') === c.id
                return (
                  <li key={c.id || 'todas'}>
                    <Link
                      to={`/coleccion${c.id ? `/${c.id}` : ''}${query}`}
                      aria-current={on ? 'page' : undefined}
                      className={`inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full border text-[14px] font-semibold whitespace-nowrap transition-colors duration-500 ${on ? 'bg-crema text-borgona border-crema' : 'bg-transparent text-crema border-crema/40 hover:border-crema'}`}
                    >
                      {c.name}
                      <span className={`text-[12px] font-normal ${on ? 'text-vino' : 'text-rosa'}`}>{c.n}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-crema/25 pt-5 mb-[clamp(32px,4vw,56px)]">
          <p className="m-0 text-[14px] text-rosa" aria-live="polite">
            {list.length === 1 ? '1 pieza' : `${list.length} piezas`}
            {q.trim() && ` para “${q.trim()}”`}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {products.length > 8 && (
              <label className="flex items-center gap-2 min-h-[44px] px-4 rounded-full border border-crema/35 focus-within:border-crema">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
                <span className="sr-only">Buscar en la colección</span>
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar pieza" className="w-[150px] sm:w-[190px] bg-transparent border-0 outline-none text-crema text-[14px] placeholder:text-rosa/70" />
              </label>
            )}
            <label className="flex items-center gap-2 text-[13px]">
              <span className="text-rosa">Ordenar</span>
              <span className="relative inline-flex">
              <select
                value={sort}
                onChange={(e) => {
                  const next = new URLSearchParams(params)
                  if (e.target.value === 'destacadas') next.delete('orden')
                  else next.set('orden', e.target.value)
                  setParams(next, { replace: true })
                }}
                className="min-h-[44px] pl-4 pr-10 rounded-full border border-crema/35 bg-vino text-crema text-[14px] font-semibold cursor-pointer appearance-none"
              >
                {sorts.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"><path d="M1 1l5 5 5-5" /></svg>
              </span>
            </label>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="py-16 flex flex-col items-start gap-5">
            <p className="m-0 font-display font-light text-[clamp(30px,3.4vw,48px)] leading-tight">
              {q.trim() ? <>No encontramos <span className="italic">esa pieza</span></> : <>Esta categoría <span className="italic">aún se está pintando</span></>}
            </p>
            <p className="m-0 text-[15px] text-rosa max-w-[460px]">Prueba con otra palabra o mira toda la colección. Si la imaginas, también podemos pintarla a tu medida.</p>
            <div className="flex flex-wrap gap-6 items-center">
              {q.trim() && (
                <button type="button" onClick={() => setQ('')} className="jl-link bg-transparent border-0 p-0 text-crema text-[14px] font-semibold cursor-pointer">Borrar búsqueda</button>
              )}
              <Link to="/design" className={btnLight}>Diseña la tuya <Arrow /></Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-[clamp(16px,2vw,32px)] items-start">
            {visible.map((p, i) => (
              <ProductCard
                key={p.slug}
                to={`/producto/${p.slug}`}
                image={p.cover}
                alt={`${p.name}, pieza pintada a mano`}
                name={p.name}
                meta={p.short || shopCategories.find((c) => c.id === p.section)?.name || ''}
                price={p.price}
                status={p.status}
                offset={i % 3 === 1 ? 'mt-0 sm:mt-[clamp(0px,8vw,120px)]' : i % 3 === 2 ? 'mt-0 sm:mt-[clamp(0px,3.5vw,50px)]' : ''}
              />
            ))}
            {rest === 0 && !q.trim() && (
              <ProductCard to="/design" image="/media/still_snoopy.webp" alt="Pieza personalizada sobre pedestal" name="A tu medida" meta="Tote, prenda, cuadro o agenda" price={null} priceNote={`Desde ${money(site.customFrom)}`} status="bajo-pedido" />
            )}
          </div>
        )}

        {rest > 0 && (
          <div className="mt-[clamp(48px,6vw,80px)] flex flex-col items-center gap-3">
            <button type="button" onClick={() => setShown((n) => n + PAGE)} className={btnLight}>
              Ver más piezas
            </button>
            <span className="text-[13px] text-rosa">Mostrando {visible.length} de {list.length}</span>
          </div>
        )}

        <div className="mt-[clamp(56px,7vw,100px)] flex flex-wrap items-center justify-between gap-6 border-t border-crema/40 pt-8">
          <p className="m-0 font-display font-light text-[clamp(30px,3.4vw,48px)] leading-tight">
            ¿Tienes una idea <span className="italic">propia?</span>
          </p>
          <Link to="/design" className={btnLight}>
            Diseña la tuya <Arrow />
          </Link>
        </div>
      </section>
    </div>
  )
}
