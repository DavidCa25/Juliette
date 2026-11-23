import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { readJSON, writeJSON, money } from '../lib/format'
import { Arrow, Star, btnPrimary } from '../components/ui'
import { api, authClient, slugify, type AdminContent, type AdminProduct, type Me } from './client'
import { ProductEditor } from './ProductEditor'
import { SettingsEditor } from './SettingsEditor'
import { Stats } from './Stats'
import { Newsletter } from './Newsletter'
import { Orders } from './Orders'
import { Categories } from './Categories'
import { categoryForType, readCategories } from '../data/categories'

type Tab = 'resumen' | 'pedidos' | 'boletin' | 'productos' | 'categorias' | 'ajustes'
type ProductSort = 'orden' | 'nuevas' | 'nombre' | 'precio'
const today = () => new Date().toISOString().slice(0, 10)
const DRAFT_KEY = 'jl-admin-draft-v1'
const categoryLabel: Record<string, string> = { tote: 'Tote bag', prenda: 'Prenda', cuadro: 'Cuadro', agenda: 'Agenda', accesorio: 'Accesorio', hogar: 'Hogar', otro: 'Otra' }
const statusLabel: Record<string, string> = { disponible: 'Disponible', 'bajo-pedido': 'Bajo pedido', agotado: 'Agotado' }

function normalize(p: Partial<AdminProduct> & { slug: string }): AdminProduct {
  return {
    slug: p.slug,
    name: p.name ?? '',
    code: p.code ?? '',
    category: p.category ?? 'tote',
    section: p.section || categoryForType[p.category ?? 'tote'] || 'otras-piezas',
    added: p.added ?? '',
    collection: p.collection ?? 'Colección 01',
    price: typeof p.price === 'number' ? p.price : null,
    status: p.status ?? 'disponible',
    featured: !!p.featured,
    order: typeof p.order === 'number' ? p.order : 10,
    personalizable: p.personalizable !== false,
    short: p.short ?? '',
    description: p.description ?? '',
    dimensions: p.dimensions ?? '',
    material: p.material ?? '',
    technique: p.technique ?? 'Pintura a mano',
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    sizeLabel: p.sizeLabel || (p.category === 'prenda' ? 'Talla' : 'Medida'),
    images: (p.images ?? []).map((i) => (typeof i === 'string' ? { src: i, alt: '' } : { src: i.src, alt: i.alt ?? '' })),
    video: p.video ?? null,
  }
}

function Shell({ children, me }: { children: React.ReactNode; me?: Extract<Me, { signedIn: true }> }) {
  return (
    <div className="min-h-dvh bg-crema text-borgona font-sans">
      <header className="border-b border-borgona/20">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3" aria-label="Ir al sitio">
            <img src="/media/isotipo_burdeos_sm.png" alt="" width={26} height={34} />
            <span className="font-bold text-[18px] tracking-[1px]">JULIETTÉ</span>
            <span className="hidden sm:inline text-[12px] tracking-[2px] uppercase font-semibold opacity-70">· Panel</span>
          </Link>
          {me && (
            <div className="flex items-center gap-4">
              {me.user.image && <img src={me.user.image} alt="" width={32} height={32} className="rounded-full" referrerPolicy="no-referrer" />}
              <span className="hidden sm:inline text-[13px]">{me.user.email}</span>
              <button type="button" onClick={() => authClient.signOut().then(() => window.location.reload())} className="jl-link bg-transparent border-0 p-0 text-borgona text-[13px] font-semibold cursor-pointer">
                Salir
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10">{children}</main>
    </div>
  )
}

function Login({ error }: { error?: string }) {
  const [busy, setBusy] = useState(false)
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center gap-8">
      <Star size={28} color="#82001a" className="jl-star absolute left-[12%] top-[18%]" />
      <Star size={16} color="#82001a" className="jl-star absolute right-[16%] bottom-[24%]" delay="1.3s" />
      <img src="/media/isotipo_burdeos_md.png" alt="" width={96} height={126} className="jl-float" />
      <h1 className="m-0 font-display font-light text-[clamp(44px,6vw,80px)] leading-[.95]">
        Panel de <span className="italic">Julietté</span>
      </h1>
      <p className="m-0 max-w-[440px] text-[15px] leading-[1.7]">Agrega piezas, sube fotos y videos, y actualiza los datos de la tienda.</p>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          const r = await authClient.signIn.social({ provider: 'google', callbackURL: '/admin' }).catch(() => null)
          if (!r || r.error) setBusy(false)
        }}
        className={`${btnPrimary} gap-3`}
      >
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.3-.4-3.5z" />
        </svg>
        {busy ? 'Abriendo Google…' : 'Entrar con Google'}
      </button>
      {error && <p role="alert" className="m-0 text-[14px] font-semibold">{error}</p>}
    </div>
  )
}

function NoAccess({ email }: { email: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6">
      <h1 className="m-0 font-display font-light text-[clamp(40px,5vw,68px)] leading-none">Esta cuenta no tiene acceso</h1>
      <p className="m-0 max-w-[460px] text-[15px] leading-[1.7]">Iniciaste sesión como <strong>{email}</strong>. Pide que agreguen este correo a la lista de administradoras.</p>
      <button type="button" onClick={() => authClient.signOut().then(() => window.location.reload())} className={btnPrimary}>Usar otra cuenta</button>
    </div>
  )
}

function Dashboard({ me }: { me: Extract<Me, { signedIn: true }> }) {
  const [loaded, setLoaded] = useState<AdminContent | null>(null)
  const [draft, setDraft] = useState<AdminContent | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('resumen')
  const [editing, setEditing] = useState<string | null>(null)
  const [newSlugs, setNewSlugs] = useState<string[]>([])
  const [publishing, setPublishing] = useState(false)
  const [notice, setNotice] = useState('')
  // Lista de productos: búsqueda, filtros y orden (pensado para cuando haya muchas piezas)
  const [pq, setPq] = useState('')
  const [pCat, setPCat] = useState('')
  const [pStatus, setPStatus] = useState('')
  const [pSort, setPSort] = useState<ProductSort>('orden')

  const load = useCallback(async () => {
    setError('')
    try {
      const c = await api.content()
      const content: AdminContent = { settings: c.settings, products: c.products.map((p) => normalize(p)) }
      setLoaded(content)
      const saved = readJSON<{ base: string; draft: AdminContent } | null>(DRAFT_KEY, null)
      setDraft(saved && saved.base === JSON.stringify(content) ? saved.draft : content)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const dirty = useMemo(() => !!draft && !!loaded && JSON.stringify(draft) !== JSON.stringify(loaded), [draft, loaded])

  useEffect(() => {
    if (draft && loaded) writeJSON(DRAFT_KEY, dirty ? { base: JSON.stringify(loaded), draft } : null)
  }, [draft, loaded, dirty])

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  if (error) {
    return (
      <div className="flex flex-col gap-4 items-start">
        <h1 className="m-0 font-display font-light text-[44px]">No se pudo cargar el contenido</h1>
        <p className="m-0 text-[15px]">{error}</p>
        <button type="button" onClick={load} className={btnPrimary}>Reintentar</button>
      </div>
    )
  }
  if (!draft) {
    return <p className="text-[15px]" aria-busy="true">Cargando contenido…</p>
  }

  const byOrder = [...draft.products].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
  const cats = readCategories(draft.settings.categories)
  const catName = (id: string) => cats.find((c) => c.id === id)?.name ?? 'Sin categoría'
  const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const products = byOrder
    .filter((p) => (!pCat || p.section === pCat) && (!pStatus || p.status === pStatus) && (!pq.trim() || norm(`${p.name} ${p.code} ${p.short}`).includes(norm(pq.trim()))))
    .sort((a, b) =>
      pSort === 'nombre' ? a.name.localeCompare(b.name) : pSort === 'precio' ? (a.price ?? Infinity) - (b.price ?? Infinity) : pSort === 'nuevas' ? (b.added || '').localeCompare(a.added || '') : 0,
    )
  const filtering = !!(pq.trim() || pCat || pStatus)

  /** Sube o baja una pieza en el orden del sitio (intercambia su lugar con la vecina de la lista). */
  function moveProduct(slug: string, d: -1 | 1) {
    const i = products.findIndex((p) => p.slug === slug)
    const other = products[i + d]
    if (!other) return
    // Se renumera todo de 10 en 10 para que el intercambio siempre tenga efecto
    const rank = new Map(byOrder.map((p, k) => [p.slug, (k + 1) * 10]))
    const a = rank.get(slug)!
    rank.set(slug, rank.get(other.slug)!)
    rank.set(other.slug, a)
    setDraft((x) => (x ? { ...x, products: x.products.map((p) => ({ ...p, order: rank.get(p.slug) ?? p.order })) } : x))
  }
  const current = draft.products.find((p) => p.slug === editing) ?? null

  function updateProduct(p: AdminProduct) {
    if (!draft) return
    let slug = p.slug
    // Las piezas nuevas toman su dirección del nombre mientras no se publiquen
    if (newSlugs.includes(p.slug)) {
      const base = slugify(p.name) || p.slug
      slug = base
      let n = 2
      while (draft.products.some((x) => x.slug === slug && x.slug !== p.slug)) slug = `${base}-${n++}`
    }
    setDraft({ ...draft, products: draft.products.map((x) => (x.slug === p.slug ? { ...p, slug } : x)) })
    if (slug !== p.slug) {
      setNewSlugs((s) => s.map((x) => (x === p.slug ? slug : x)))
      setEditing(slug)
    }
  }

  function addProduct() {
    const slug = `pieza-${Date.now().toString(36)}`
    const maxOrder = Math.max(0, ...draft!.products.map((p) => p.order))
    setDraft((d) => (d ? { ...d, products: [...d.products, normalize({ slug, order: maxOrder + 1, added: today(), section: pCat || undefined })] } : d))
    setNewSlugs((s) => [...s, slug])
    setEditing(slug)
    setTab('productos')
  }

  function removeProduct(slug: string) {
    const p = draft!.products.find((x) => x.slug === slug)
    if (!window.confirm(`¿Eliminar “${p?.name || 'esta pieza'}”? Se quitará del sitio al publicar.`)) return
    setDraft((d) => (d ? { ...d, products: d.products.filter((x) => x.slug !== slug) } : d))
    setEditing(null)
  }

  async function publish() {
    if (!draft) return
    const missing = draft.products.find((p) => !p.name.trim() || p.images.length === 0)
    if (missing) {
      setNotice(`Falta ${!missing.name.trim() ? 'el nombre' : 'al menos una foto'} en “${missing.name || 'una pieza nueva'}”.`)
      setEditing(missing.slug)
      setTab('productos')
      return
    }
    setPublishing(true)
    setNotice('')
    try {
      const r = await api.publish(draft)
      setLoaded(draft)
      setNewSlugs([])
      writeJSON(DRAFT_KEY, null)
      setNotice(r.changed ? 'Publicado. El sitio se actualiza en uno o dos minutos.' : 'No había cambios por publicar.')
    } catch (e) {
      setNotice((e as Error).message)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="flex flex-col gap-10 pb-28">
      {(!me.storage.files || !me.storage.github || !me.storage.db) && (
        <div role="status" className="border border-borgona rounded-[18px] p-5 text-[14px] leading-[1.7]">
          <strong>Configuración pendiente:</strong>{' '}
          {!me.storage.github && 'falta GITHUB_TOKEN (para publicar productos y ajustes). '}
          {!me.storage.files && 'falta configurar Cloudflare R2 (para subir fotos y videos). '}
          {!me.storage.db && 'falta conectar Neon (para pedidos y estadísticas).'}
        </div>
      )}

      {!current && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-3">
              <p className="m-0 jl-eyebrow">Hola, {me.user.name?.split(' ')[0] || 'Julietté'}</p>
              <h1 className="m-0 font-display font-light text-[clamp(44px,5vw,72px)] leading-[.95]">Tu <span className="italic">tienda</span></h1>
            </div>
            <button type="button" onClick={addProduct} className={btnPrimary}>Nueva pieza <Arrow /></button>
          </div>

          <div role="tablist" aria-label="Secciones" className="flex gap-1 border-b border-borgona/25 overflow-x-auto overflow-y-hidden">
            {(['resumen', 'pedidos', 'boletin', 'productos', 'categorias', 'ajustes'] as const).map((t) => (
              <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)} className={`min-h-[48px] px-4 sm:px-5 bg-transparent border-0 border-b-2 text-borgona text-[14px] sm:text-[15px] font-semibold cursor-pointer -mb-px whitespace-nowrap ${tab === t ? 'border-borgona' : 'border-transparent opacity-60'}`}>
                {t === 'resumen' ? 'Resumen' : t === 'pedidos' ? 'Pedidos' : t === 'boletin' ? 'Boletín' : t === 'productos' ? `Productos (${draft.products.length})` : t === 'categorias' ? 'Categorías' : 'Ajustes'}
              </button>
            ))}
          </div>
        </>
      )}

      {current ? (
        <ProductEditor categories={cats} product={current} isNew={newSlugs.includes(current.slug)} onChange={updateProduct} onClose={() => setEditing(null)} onDelete={() => removeProduct(current.slug)} />
      ) : tab === 'resumen' ? (
        <Stats productNames={Object.fromEntries(draft.products.map((p) => [p.slug, p.name]))} />
      ) : tab === 'pedidos' ? (
        <Orders />
      ) : tab === 'boletin' ? (
        <Newsletter />
      ) : tab === 'categorias' ? (
        <Categories draft={draft} onChange={setDraft} onOpenProducts={(id) => { setPCat(id); setPq(''); setPStatus(''); setTab('productos') }} />
      ) : tab === 'productos' ? (
        <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <label className="flex flex-col gap-1 flex-[1_1_220px]">
            <span className="jl-label">Buscar</span>
            <input type="search" value={pq} onChange={(e) => setPq(e.target.value)} placeholder="Nombre o código" className="jl-field" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="jl-label">Categoría</span>
            <select value={pCat} onChange={(e) => setPCat(e.target.value)} className="jl-field cursor-pointer min-w-[180px]">
              <option value="">Todas</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({draft.products.filter((p) => p.section === c.id).length})</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="jl-label">Estado</span>
            <select value={pStatus} onChange={(e) => setPStatus(e.target.value)} className="jl-field cursor-pointer min-w-[150px]">
              <option value="">Todos</option>
              {Object.entries(statusLabel).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="jl-label">Ordenar</span>
            <select value={pSort} onChange={(e) => setPSort(e.target.value as ProductSort)} className="jl-field cursor-pointer min-w-[170px]">
              <option value="orden">Orden del sitio</option>
              <option value="nuevas">Más nuevas</option>
              <option value="nombre">Nombre</option>
              <option value="precio">Precio</option>
            </select>
          </label>
        </div>
        <p className="m-0 text-[13px]">
          {filtering ? `${products.length} de ${draft.products.length} piezas` : `${draft.products.length} piezas`}
          {pSort === 'orden' ? ' · Usa ↑ ↓ para cambiar el orden en el sitio.' : ''}
          {filtering && (
            <>
              {' · '}
              <button type="button" onClick={() => { setPq(''); setPCat(''); setPStatus('') }} className="jl-link bg-transparent border-0 p-0 text-borgona text-[13px] font-semibold cursor-pointer">Quitar filtros</button>
            </>
          )}
        </p>
        <ul className="m-0 p-0 list-none flex flex-col border-b border-borgona">
          {products.map((p, i) => (
            <li key={p.slug} className="flex items-stretch border-t border-borgona">
              {pSort === 'orden' && (
                <span className="flex flex-col justify-center gap-1 pr-2">
                  <button type="button" disabled={i === 0} onClick={() => moveProduct(p.slug, -1)} aria-label={`Subir ${p.name}`} className="w-9 h-9 rounded-full border border-borgona/25 bg-transparent text-borgona text-[13px] cursor-pointer disabled:opacity-25">↑</button>
                  <button type="button" disabled={i === products.length - 1} onClick={() => moveProduct(p.slug, 1)} aria-label={`Bajar ${p.name}`} className="w-9 h-9 rounded-full border border-borgona/25 bg-transparent text-borgona text-[13px] cursor-pointer disabled:opacity-25">↓</button>
                </span>
              )}
              <button type="button" onClick={() => setEditing(p.slug)} className="jl-opt flex-1 min-w-0 flex items-center gap-5 py-4 px-2 bg-transparent border-0 text-borgona text-left cursor-pointer">
                <span className="w-[56px] h-[70px] flex-none rounded-t-full overflow-hidden bg-vino">{p.images[0] && <img src={p.images[0].src} alt="" className="w-full h-full object-cover" />}</span>
                <span className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="font-display text-[28px] leading-none truncate">{p.name || 'Sin nombre'}</span>
                  <span className="text-[13px]">{catName(p.section)} · {categoryLabel[p.category] ?? p.category} · {statusLabel[p.status] ?? p.status}{p.featured ? ' · En el inicio' : ''}</span>
                </span>
                <span className="hidden sm:inline text-[14px] font-semibold">{money(p.price, 'Por confirmar')}</span>
                <span aria-hidden="true" className="text-[18px]">→</span>
              </button>
            </li>
          ))}
          {products.length === 0 && <li className="py-10 text-center text-[15px] border-t border-borgona">{filtering ? 'Ninguna pieza coincide con estos filtros.' : 'Aún no hay piezas. Crea la primera.'}</li>}
        </ul>
        </div>
      ) : (
        <SettingsEditor settings={draft.settings} onChange={(s) => setDraft((d) => (d ? { ...d, settings: s } : d))} />
      )}

      {(dirty || notice || editing || tab === 'productos' || tab === 'categorias' || tab === 'ajustes') && (
      <div className="fixed left-0 right-0 bottom-0 z-40 bg-crema/95 backdrop-blur border-t border-borgona">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <p aria-live="polite" className="m-0 text-[14px]">{notice || (dirty ? 'Tienes cambios sin publicar (se guardan en este navegador).' : 'Todo está publicado.')}</p>
          <div className="flex items-center gap-5">
            {dirty && (
              <button type="button" onClick={() => { if (window.confirm('¿Descartar todos los cambios sin publicar?')) { setDraft(loaded); setNewSlugs([]); setEditing(null) } }} className="jl-link bg-transparent border-0 p-0 text-borgona text-[14px] font-semibold cursor-pointer">
                Descartar
              </button>
            )}
            <button type="button" onClick={publish} disabled={!dirty || publishing} className={`${btnPrimary} min-h-[50px]`}>
              {publishing ? 'Publicando…' : 'Publicar cambios'}
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

export default function Admin() {
  const [me, setMe] = useState<Me | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Panel · Julietté'
    let tag = document.querySelector('meta[name="robots"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'robots')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', 'noindex, nofollow')
    api
      .me()
      .then(setMe)
      .catch(() => {
        setMe({ signedIn: false })
        setError('El panel solo funciona en el sitio publicado en Vercel (o con “vercel dev”).')
      })
  }, [])

  if (!me) return <Shell><p className="text-[15px]" aria-busy="true">Cargando…</p></Shell>
  if (!me.signedIn) return <Shell><Login error={error} /></Shell>
  if (!me.isAdmin) return <Shell me={me}><NoAccess email={me.user.email} /></Shell>
  return <Shell me={me}><Dashboard me={me} /></Shell>
}
