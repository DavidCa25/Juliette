import { useEffect, useState } from 'react'
import { track } from '../lib/analytics'
import { Link, useParams } from 'react-router-dom'
import { getProduct, products } from '../data/products'
import { site } from '../config/site'
import { money } from '../lib/format'
import { openWhatsApp } from '../lib/whatsapp'
import { usePageMeta } from '../lib/usePageMeta'
import { useCart } from '../state/cart'
import { Arrow, AutoVideo, Dot, Star, btnPrimary, container } from '../components/ui'
import NotFound from './NotFound'

const icons = [
  { label: 'Etiqueta Julietté', d: <><path d="M3 12l9-9h7v7l-9 9z" /><circle cx="15.5" cy="8.5" r="1.4" /></> },
  { label: 'Tarjeta de bienvenida', d: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="M3 7l9 6 9-6" /></> },
  { label: 'Guía de cuidados', d: <><path d="M7 3h8l4 4v14H7z" /><path d="M10 11h6M10 15h6" /></> },
  { label: 'Revisión de calidad', d: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.8 2.8L16.5 9.5" /></> },
]

export default function Producto() {
  const { slug = '' } = useParams()
  const product = getProduct(slug)
  const { add } = useCart()
  const [img, setImg] = useState(0)
  const [opt, setOpt] = useState('sin')
  const [panel, setPanel] = useState('detalles')
  const [idea, setIdea] = useState('')
  const [ideaError, setIdeaError] = useState(false)

  usePageMeta(product?.name ?? 'Pieza no encontrada', product?.description)
  useEffect(() => {
    if (product) track('product_view', { slug: product.slug, category: product.category })
  }, [product])

  if (!product) return <NotFound />

  const option = product.options.find((o) => o.id === opt)!
  const media = product.media[img]
  const unitPrice = product.price === null || option.extra === null ? null : product.price + option.extra
  const priceText = opt === 'sin' ? money(product.price) : opt === 'nombre' ? `${money(product.price)} + personalización` : 'Precio según diseño'
  const firstImage = product.cover
  const panels = [
    { id: 'detalles', title: 'Detalles', body: `Medidas: ${product.dimensions}\nMaterial: ${product.material}\nTécnica: ${product.technique}` },
    { id: 'cuidados', title: 'Cuidados', body: 'Lavar al revés con agua fría · no usar cloro · evitar frotar el diseño · lavar con colores similares · secar al aire · planchar al revés.' },
    { id: 'entrega', title: 'Entrega y pedidos', body: `Envíos a ${site.shippingZone} y entrega local en ${site.pickupPoint}.\nPersonalizados: anticipo de [${site.depositPercent}%] para iniciar el boceto.` },
  ]

  function addToCart() {
    if (option.needsIdea && !idea.trim()) {
      setIdeaError(true)
      document.getElementById('jl-idea')?.focus()
      return
    }
    add({ kind: 'product', slug: product!.slug, name: product!.name, image: firstImage, optionId: option.id, optionLabel: option.label, unitPrice, idea: option.needsIdea ? idea.trim() : undefined, qty: 1 })
  }

  function askWhatsApp() {
    const lines = [`Hola, Julietté. Me interesa la pieza ${product!.name} (${product!.code}).`, `Personalización: ${option.label}`]
    if (option.needsIdea && idea.trim()) lines.push(`Mi idea: ${idea.trim()}`)
    track('whatsapp_click', { from: 'producto', slug: product!.slug })
    openWhatsApp(lines.join('\n'))
  }

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 2)

  return (
    <>
      <div className={`${container} pt-2 pb-[clamp(72px,9vw,130px)]`}>
        <nav aria-label="Ruta" className="flex gap-3 text-[13px] mb-9">
          <Link className="jl-link" to="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link className="jl-link" to="/coleccion">Colección</Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold" aria-current="page">{product.name}</span>
        </nav>

        <div className="flex flex-wrap gap-[clamp(40px,6vw,96px)] items-start">
          <div className="flex-[1.15_1_520px] min-w-0 flex gap-5 flex-wrap-reverse">
            <div className="flex sm:flex-col gap-4" role="group" aria-label="Fotos de la pieza">
              {product.media.map((m, i) => (
                <button
                  key={m.src}
                  type="button"
                  aria-label={m.kind === 'video' ? `Ver ${m.alt}` : `Ver foto: ${m.alt}`}
                  aria-pressed={i === img}
                  onClick={() => setImg(i)}
                  className="jl-thumb relative w-[72px] h-[90px] sm:w-[86px] sm:h-[108px] p-0 border-0 cursor-pointer bg-vino rounded-t-full overflow-hidden"
                  style={i === img ? { opacity: 1, outline: '1px solid #82001a', outlineOffset: 5 } : { opacity: 0.55, outline: '1px solid transparent', outlineOffset: 5 }}
                >
                  <img src={m.kind === 'video' ? m.poster : m.src} alt="" loading="lazy" className="w-full h-full object-cover block" />
                  {m.kind === 'video' && (
                    <span className="absolute left-1/2 top-[56%] w-[34px] h-[34px] -ml-[17px] -mt-[17px] rounded-full bg-crema flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#82001a" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="jl-zoom flex-[1_1_300px] min-w-0 aspect-[4/5] rounded-t-full rounded-b-[28px] bg-vino relative">
              {media.kind === 'video' ? (
                <AutoVideo key={media.src} src={media.src} poster={media.poster} label={media.alt} />
              ) : (
                <img key={media.src} src={media.src} alt={media.alt} className="jl-fade w-full h-full object-cover block" />
              )}
              <span className="absolute left-1/2 bottom-[22px] -translate-x-1/2 bg-crema px-[18px] py-[10px] rounded-full text-[11px] sm:text-[12px] tracking-[2px] uppercase font-semibold whitespace-nowrap">Pieza única · pintada a mano</span>
            </div>
          </div>

          <div id="pedir" className="flex-[1_1_420px] min-w-0 flex flex-col gap-[30px]">
            <div className="jl-fade flex flex-col gap-4">
              <p className="m-0 jl-eyebrow">{product.collection} · {product.code}</p>
              <h1 className="m-0 font-display font-light text-[clamp(64px,7vw,108px)] leading-[.9]">{product.name}</h1>
              <div className="flex items-baseline gap-[18px] flex-wrap">
                <span className="text-[26px] font-semibold">{priceText}</span>
                <span className="inline-flex items-center gap-2 text-[12px] tracking-[1px] uppercase font-semibold">
                  <Dot /> {product.status === 'disponible' ? 'Disponible' : product.status === 'bajo-pedido' ? 'Bajo pedido' : 'Agotado'}
                </span>
              </div>
              <p className="m-0 text-[16px] leading-[1.75] max-w-[520px]">{product.description}</p>
            </div>

            <fieldset className="m-0 p-0 border-0 flex flex-col">
              <legend className="pb-[14px] jl-label tracking-[3px]">Personalización</legend>
              {product.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={o.id === opt}
                  onClick={() => {
                    setOpt(o.id)
                    setIdeaError(false)
                  }}
                  className="jl-opt flex items-center justify-between gap-5 w-full min-h-16 px-[14px] py-4 bg-transparent border-0 border-t border-borgona text-borgona text-left cursor-pointer"
                >
                  <span className="flex items-center gap-4">
                    <span className="w-[18px] h-[18px] rounded-full border border-borgona flex items-center justify-center flex-none">
                      <span className="w-[10px] h-[10px] rounded-full bg-borgona transition-opacity" style={{ opacity: o.id === opt ? 1 : 0 }} />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-[16px] font-semibold">{o.label}</span>
                      <span className="text-[13px]">{o.sub}</span>
                    </span>
                  </span>
                  <span className="text-[14px] font-semibold whitespace-nowrap">{o.extraLabel}</span>
                </button>
              ))}
              <div className="border-t border-borgona" />
            </fieldset>

            {option.needsIdea && (
              <div className="jl-fade flex flex-col gap-[10px]">
                <label htmlFor="jl-idea" className="jl-label tracking-[3px]">Cuéntanos tu idea</label>
                <textarea
                  id="jl-idea"
                  rows={3}
                  value={idea}
                  maxLength={400}
                  aria-invalid={ideaError}
                  aria-describedby="jl-idea-help"
                  onChange={(e) => {
                    setIdea(e.target.value)
                    setIdeaError(false)
                  }}
                  placeholder="Nombre, frase, colores o referencia que quieras incluir"
                  className="jl-field resize-y"
                />
                <p id="jl-idea-help" className={`m-0 text-[13px] leading-[1.6] ${ideaError ? 'font-semibold' : ''}`}>
                  {ideaError ? 'Escribe tu idea para poder preparar el boceto.' : 'Te enviamos un boceto para aprobar antes de pintar.'}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button type="button" onClick={addToCart} disabled={product.status === 'agotado'} className={`${btnPrimary} w-full min-h-[60px]`}>
                Agregar al carrito <Arrow />
              </button>
              <button type="button" onClick={askWhatsApp} className="jl-link self-center bg-transparent border-0 p-0 text-borgona text-[14px] font-semibold cursor-pointer">
                o pedir directo por WhatsApp
              </button>
              <div className="flex justify-between gap-4 flex-wrap text-[13px]">
                <span>
                  Elaboración: {site.leadDays.ready} días hábiles · {opt === 'sin' ? 'lista para entregar' : 'tras aprobar el boceto'}
                </span>
                <Link to="/checkout" className="jl-link font-semibold">Agregar nota de regalo</Link>
              </div>
            </div>

            <div className="flex flex-col border-b border-borgona">
              {panels.map((p) => {
                const isOpen = panel === p.id
                return (
                  <div key={p.id} className="border-t border-borgona">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`panel-${p.id}`}
                      onClick={() => setPanel(isOpen ? '' : p.id)}
                      className="flex items-center justify-between w-full min-h-[60px] p-0 bg-transparent border-0 text-borgona text-[15px] font-semibold cursor-pointer"
                    >
                      <span>{p.title}</span>
                      <svg className="jl-plus" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                    {isOpen && (
                      <p id={`panel-${p.id}`} className="jl-fade m-0 pb-[22px] text-[14px] leading-[1.8] whitespace-pre-line">
                        {p.body}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-[18px]">
              {icons.map((ic) => (
                <div key={ic.label} className="flex flex-col gap-[10px] text-[13px] leading-[1.5]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#82001a" strokeWidth={1.3} aria-hidden="true">{ic.d}</svg>
                  {ic.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="relative bg-rosa">
        <div className={`${container} py-[clamp(64px,8vw,120px)] flex flex-wrap gap-12 items-center justify-between`}>
          <p className="m-0 flex-[1_1_520px] font-display font-light text-[clamp(34px,4.2vw,62px)] leading-[1.08]">
            Ninguna pieza pintada a mano es <span className="italic">exactamente igual</span> a otra. Esa es la promesa.
          </p>
          <div className="jl-stripes relative flex-none w-[200px] h-[260px] rounded-full" aria-hidden="true">
            <Star size={28} color="#fdf6ee" className="jl-star absolute left-1/2 top-1/2 -ml-[14px] -mt-[14px]" />
          </div>
        </div>
      </section>

      <section className={`${container} py-[clamp(72px,9vw,130px)]`}>
        <div className="flex justify-between items-end gap-6 flex-wrap mb-12">
          <h2 className="m-0 font-display font-light text-[clamp(42px,4.6vw,70px)] leading-[.95]">
            También te puede <span className="italic">gustar</span>
          </h2>
          <Link className="jl-link text-[14px] font-semibold" to="/coleccion">Ver toda la colección</Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[clamp(24px,3vw,44px)]">
          <Link to="/design" className="flex flex-col gap-[18px]">
            <div className="jl-zoom aspect-[4/5] rounded-b-full bg-vino"><img src="/media/still_snoopy.webp" alt="Pieza personalizada sobre pedestal" loading="lazy" className="w-full h-full object-cover block" /></div>
            <div className="flex justify-between gap-3 border-t border-borgona pt-[14px]"><span className="font-display text-[30px] leading-none">A tu medida</span><span className="text-[15px] font-semibold">Desde {money(site.customFrom)}</span></div>
          </Link>
          {related.map((p) => (
            <Link key={p.slug} to={`/producto/${p.slug}`} className="flex flex-col gap-[18px]">
              <div className="jl-zoom aspect-[4/5] rounded-t-full bg-vino"><img src={p.cover} alt={`${p.name}, pieza pintada a mano`} loading="lazy" className="w-full h-full object-cover block" /></div>
              <div className="flex justify-between gap-3 border-t border-borgona pt-[14px]"><span className="font-display text-[30px] leading-none">{p.name}</span><span className="text-[15px] font-semibold">{money(p.price)}</span></div>
            </Link>
          ))}
          <div className="flex flex-col gap-[18px]">
            <div className="jl-stripes aspect-[4/5] rounded-full flex items-center justify-center">
              <div className="w-1/2 aspect-square rounded-full bg-crema flex items-center justify-center"><img src="/media/isotipo_burdeos_sm.png" alt="" className="w-[44%] h-auto block" /></div>
            </div>
            <div className="flex justify-between gap-3 border-t border-borgona pt-[14px]"><span className="font-display text-[30px] leading-none">Próximo diseño</span><span className="text-[15px] font-semibold">{site.nextDrop}</span></div>
          </div>
        </div>
      </section>
    </>
  )
}
