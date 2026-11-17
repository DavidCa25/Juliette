import { Link } from 'react-router-dom'
import { products } from '../data/products'
import { usePageMeta } from '../lib/usePageMeta'
import { money } from '../lib/format'
import { site } from '../config/site'
import { ProductCard } from '../components/home/ProductCard'
import { Arrow, btnLight, container } from '../components/ui'

export default function Coleccion() {
  usePageMeta('Colección', 'Tote bags de lona pintadas a mano. Diseños propios de Julietté y piezas a medida.')
  return (
    <div className="bg-vino text-crema">
      <section className={`${container} pt-[clamp(56px,8vw,120px)] pb-[clamp(72px,10vw,150px)]`}>
        <div className="flex flex-wrap justify-between items-end gap-8 mb-[clamp(40px,5vw,72px)]">
          <div className="flex flex-col gap-[18px]">
            <p className="m-0 jl-eyebrow text-rosa">Colección 01 · Tote bags</p>
            <h1 className="m-0 font-display font-light text-[clamp(56px,7vw,110px)] leading-[.92]">
              Toda la <span className="italic">colección</span>
            </h1>
          </div>
          <p className="m-0 max-w-[380px] text-[16px] leading-[1.7] text-rosa">Cada modelo es pintado a mano bajo pedido o en piezas únicas listas para entregar. Si no encuentras lo que buscas, créalo con nosotros.</p>
        </div>
        <div className="flex flex-wrap gap-[clamp(16px,2vw,32px)] items-start">
          {products.map((p, i) => (
            <ProductCard
              key={p.slug}
              to={`/producto/${p.slug}`}
              image={p.media[0].kind === 'image' ? p.media[0].src : ''}
              alt={`Tote bag ${p.name} sobre pedestal, fondo borgoña`}
              name={p.name}
              meta={p.short}
              price={p.price}
              status={p.status}
              offset={i % 2 ? 'mt-0 sm:mt-[clamp(0px,8vw,120px)]' : ''}
            />
          ))}
          <ProductCard to="/disena" image="/media/still_snoopy.webp" alt="Tote bag personalizada sobre pedestal" name="A tu medida" meta="Tu idea, con boceto previo" price={null} priceNote={`Desde ${money(site.customFrom)}`} status="bajo-pedido" offset="mt-0 sm:mt-[clamp(0px,3.5vw,50px)]" />
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
