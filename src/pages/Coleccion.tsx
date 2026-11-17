import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { categories, products, type Category } from '../data/products'
import { usePageMeta } from '../lib/usePageMeta'
import { money } from '../lib/format'
import { site } from '../config/site'
import { ProductCard } from '../components/home/ProductCard'
import { Arrow, btnLight, container } from '../components/ui'

export default function Coleccion() {
  usePageMeta('Colección', 'Piezas pintadas a mano por Julietté: tote bags, prendas, cuadros, agendas y piezas a medida.')
  const [params, setParams] = useSearchParams()
  const active = (params.get('tipo') ?? 'todas') as Category | 'todas'
  const present = useMemo(() => (Object.keys(categories) as Category[]).filter((c) => products.some((p) => p.category === c)), [])
  const list = active === 'todas' ? products : products.filter((p) => p.category === active)

  return (
    <div className="bg-vino text-crema">
      <section className={`${container} pt-[clamp(56px,8vw,120px)] pb-[clamp(72px,10vw,150px)]`}>
        <div className="flex flex-wrap justify-between items-end gap-8 mb-[clamp(32px,4vw,56px)]">
          <div className="flex flex-col gap-[18px]">
            <p className="m-0 jl-eyebrow text-rosa">Colección · Piezas pintadas a mano</p>
            <h1 className="m-0 font-display font-light text-[clamp(56px,7vw,110px)] leading-[.92]">
              Toda la <span className="italic">colección</span>
            </h1>
          </div>
          <p className="m-0 max-w-[380px] text-[16px] leading-[1.7] text-rosa">Cada pieza se pinta a mano, lista para entregar o bajo pedido. Si no encuentras lo que buscas, créalo con nosotros.</p>
        </div>

        {present.length > 1 && (
          <div role="group" aria-label="Filtrar por tipo de pieza" className="flex flex-wrap gap-2 mb-[clamp(40px,5vw,72px)]">
            {(['todas', ...present] as const).map((c) => {
              const on = c === active
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setParams(c === 'todas' ? {} : { tipo: c }, { replace: true })}
                  className={`min-h-[44px] px-5 rounded-full border text-[14px] font-semibold cursor-pointer transition-colors duration-500 ${on ? 'bg-crema text-borgona border-crema' : 'bg-transparent text-crema border-crema/40 hover:border-crema'}`}
                >
                  {c === 'todas' ? 'Todas' : categories[c]}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex flex-wrap gap-[clamp(16px,2vw,32px)] items-start">
          {list.map((p, i) => (
            <ProductCard
              key={p.slug}
              to={`/producto/${p.slug}`}
              image={p.cover}
              alt={`${p.name}, pieza pintada a mano`}
              name={p.name}
              meta={p.short || categories[p.category]}
              price={p.price}
              status={p.status}
              offset={i % 3 === 1 ? 'mt-0 sm:mt-[clamp(0px,8vw,120px)]' : i % 3 === 2 ? 'mt-0 sm:mt-[clamp(0px,3.5vw,50px)]' : ''}
            />
          ))}
          <ProductCard to="/disena" image="/media/still_snoopy.webp" alt="Pieza personalizada sobre pedestal" name="A tu medida" meta="Tote, prenda, cuadro o agenda" price={null} priceNote={`Desde ${money(site.customFrom)}`} status="bajo-pedido" />
        </div>

        <div className="mt-[clamp(56px,7vw,100px)] flex flex-wrap items-center justify-between gap-6 border-t border-crema/40 pt-8">
          <p className="m-0 font-display font-light text-[clamp(30px,3.4vw,48px)] leading-tight">
            ¿Tienes una idea <span className="italic">propia?</span>
          </p>
          <Link to="/disena" className={btnLight}>
            Diseña la tuya <Arrow />
          </Link>
        </div>
      </section>
    </div>
  )
}
