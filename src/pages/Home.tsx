import { Link } from 'react-router-dom'
import { getProduct, showcaseVideos } from '../data/products'
import { site } from '../config/site'
import { usePageMeta } from '../lib/usePageMeta'
import { money } from '../lib/format'
import { Arrow, AutoVideo, Star, btnLight, btnPrimary, container } from '../components/ui'
import { ProductCard } from '../components/home/ProductCard'
import { ProcesoArte } from '../components/home/ProcesoArte'

function RotatingBadge({ size = 168 }: { size?: number }) {
  return (
    <div className="jl-float absolute left-[2%] bottom-2 rounded-full bg-crema flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="jl-spin absolute inset-0" width={size} height={size} viewBox="0 0 168 168" aria-hidden="true">
        <path id="jl-ring" d="M84,84 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0" fill="none" />
        <text fontFamily="Montserrat, sans-serif" fontSize="11.5" fontWeight={600} letterSpacing="3" fill="#82001a">
          <textPath href="#jl-ring" textLength="398">PINTADO A MANO · PIEZA ÚNICA · </textPath>
        </text>
      </svg>
      <img src="/media/isotipo_burdeos_sm.png" alt="" width={46} height={60} className="block w-[27%] h-auto" />
    </div>
  )
}

function Hero() {
  return (
    <section id="inicio" className={`${container} pt-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,120px)] flex flex-wrap items-center gap-[clamp(32px,6vw,96px)]`}>
      <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-[26px] sm:gap-8">
        <p className="jl-fade m-0 flex items-center gap-[14px] text-[11px] sm:text-[13px] tracking-[3px] sm:tracking-[4px] uppercase font-semibold">
          <span className="w-8 sm:w-11 h-px bg-borgona" />
          Colección 01 · Tote bags
        </p>
        <h1 className="m-0 font-display font-light text-[clamp(68px,9.4vw,150px)] leading-[.9] tracking-[-2px]">
          <span className="jl-word">
            <span style={{ animationDelay: '.05s' }}>Romance</span>
          </span>
          <br />
          <span className="jl-word">
            <span className="italic" style={{ animationDelay: '.2s' }}>
              hecho
            </span>
          </span>{' '}
          <span className="jl-word">
            <span style={{ animationDelay: '.35s' }}>arte.</span>
          </span>
        </h1>
        <p className="jl-fade m-0 max-w-[470px] text-[16px] sm:text-[18px] leading-[1.7]" style={{ animationDelay: '.5s' }}>
          Piezas pintadas a mano que convierten objetos cotidianos en arte personal. Ninguna es exactamente igual a otra.
        </p>
        <div className="jl-fade flex items-center gap-8 flex-wrap" style={{ animationDelay: '.65s' }}>
          <Link to="/#coleccion" className={`${btnPrimary} w-full sm:w-auto`}>
            Ver la colección <Arrow />
          </Link>
          <Link to="/disena" className="jl-link mx-auto sm:mx-0 text-[15px] font-semibold">
            Diseña la tuya
          </Link>
        </div>
        <div className="jl-fade hidden sm:flex gap-7 flex-wrap pt-3 text-[13px] font-medium" style={{ animationDelay: '.8s' }}>
          {['Pintado a mano', 'Pieza única', 'Guía de cuidados incluida'].map((t) => (
            <span key={t} className="inline-flex items-center gap-[10px]">
              <Star color="#82001a" />
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-[1_1_420px] min-w-0 relative flex justify-center pt-[30px] pb-10">
        <div className="jl-stripes absolute top-0 right-[4%] w-[62%] h-[88%] rounded-t-full opacity-90" aria-hidden="true" />
        <div className="jl-fade relative w-[min(440px,86%)] aspect-[440/600] rounded-t-full rounded-b-[24px] overflow-hidden bg-vino" style={{ animationDelay: '.3s' }}>
          <AutoVideo src="/media/polillas_totebag.mp4" poster="/media/still_polillas.webp" label="Tote bag Polillas pintada a mano, girando sobre un pedestal" />
        </div>
        <RotatingBadge />
        <Star size={26} color="#82001a" className="jl-star absolute right-[2%] top-[12%]" />
        <Star size={16} color="#82001a" className="jl-star absolute right-[10%] bottom-[22%]" delay="1.4s" />
      </div>
    </section>
  )
}

const marqueeItems = ['Romance hecho arte', 'Piezas pintadas a mano', 'Diseñado para tu historia', 'El arte también se lleva contigo']

function MarqueeBand() {
  const group = (
    <span className="inline-flex items-center gap-7 sm:gap-12 pr-7 sm:pr-12">
      {marqueeItems.map((t) => (
        <span key={t} className="inline-flex items-center gap-7 sm:gap-12">
          {t} <Star size={22} color="#fad9cd" />
        </span>
      ))}
    </span>
  )
  return (
    <div aria-hidden="true" className="bg-borgona text-crema py-[18px] sm:py-[26px] overflow-hidden">
      <div className="jl-track font-display italic font-light text-[clamp(28px,3.4vw,48px)] whitespace-nowrap">
        {group}
        {group}
      </div>
    </div>
  )
}

function Collection() {
  const galaxia = getProduct('galaxia')!
  const polillas = getProduct('polillas')!
  return (
    <section id="coleccion" className={`${container} pt-[clamp(72px,10vw,150px)] pb-[clamp(40px,5vw,80px)] scroll-mt-6`}>
      <div className="flex flex-wrap justify-between items-end gap-8 mb-[clamp(40px,5vw,72px)]">
        <div className="flex flex-col gap-[18px]">
          <p className="m-0 jl-eyebrow text-rosa">01 — Colección</p>
          <h2 className="m-0 font-display font-light text-[clamp(48px,6vw,92px)] leading-[.95]">
            Tote bags <span className="italic">pintadas</span>
            <br />a mano
          </h2>
        </div>
        <div className="max-w-[380px] flex flex-col gap-[18px]">
          <p className="m-0 text-[16px] leading-[1.7] text-rosa">Lona de algodón intervenida a mano, con diseños propios y piezas a medida. Cada modelo indica medidas, técnica y tiempo de elaboración.</p>
          <Link className="jl-link self-start text-[14px] font-semibold" to="/coleccion">
            Ver toda la colección
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-[clamp(16px,2vw,32px)] items-start">
        <ProductCard to={`/producto/${galaxia.slug}`} image={galaxia.media[0].kind === 'image' ? galaxia.media[0].src : ''} alt="Tote bag Galaxia sobre pedestal, fondo borgoña" name={galaxia.name} meta={galaxia.short} price={galaxia.price} status={galaxia.status} />
        <ProductCard to={`/producto/${polillas.slug}`} image="/media/still_polillas.webp" alt="Tote bag Polillas sobre pedestal, fondo borgoña" name={polillas.name} meta={polillas.short} price={polillas.price} status={polillas.status} offset="mt-0 sm:mt-[clamp(0px,8vw,120px)]" />
        <ProductCard to="/disena" image="/media/still_snoopy.webp" alt="Tote bag personalizada sobre pedestal, fondo borgoña" name="A tu medida" meta="Tu idea, con boceto previo" price={null} priceNote={`Desde ${money(site.customFrom)}`} status="bajo-pedido" offset="mt-0 sm:mt-[clamp(0px,3.5vw,50px)]" />
      </div>
    </section>
  )
}

function Videos() {
  const [main, ...rest] = showcaseVideos
  return (
    <section id="videos" aria-labelledby="jl-videos-t" className={`${container} pt-[clamp(40px,8vw,120px)] pb-[clamp(72px,10vw,150px)]`}>
      <div className="flex flex-wrap justify-between items-end gap-8 mb-[clamp(28px,4vw,56px)]">
        <div className="flex flex-col gap-[18px]">
          <p className="m-0 jl-eyebrow text-rosa">En movimiento</p>
          <h2 id="jl-videos-t" className="m-0 font-display font-light text-[clamp(48px,6vw,92px)] leading-[.95]">
            Piezas <span className="italic">en video</span>
          </h2>
        </div>
        <div className="max-w-[380px] flex flex-col gap-[18px]">
          <p className="m-0 text-[16px] leading-[1.7] text-rosa">Una selección de las piezas más recientes, para ver el trazo, la textura y el detalle desde todos los ángulos.</p>
          <a className="jl-link self-start text-[14px] font-semibold" href={site.instagram.url} target="_blank" rel="noopener noreferrer">
            Ver más en Instagram
          </a>
        </div>
      </div>
      <div className="flex flex-wrap gap-[clamp(20px,2.5vw,36px)] items-stretch">
        <figure className="jl-lift m-0 flex-[1.7_1_520px] min-w-0 flex flex-col gap-[14px]">
          <div className="jl-melt-wide aspect-video overflow-hidden">
            <AutoVideo src={main.src} poster={main.poster} label={main.label} />
          </div>
          <figcaption className="flex justify-between items-baseline gap-4 border-t border-crema/40 pt-4">
            <span className="font-display text-[34px] leading-none">{main.title}</span>
            <span className="text-[12px] tracking-[2px] uppercase font-semibold text-rosa">{main.tag}</span>
          </figcaption>
        </figure>
        <div className="flex-[1_1_340px] min-w-0 flex flex-col gap-[clamp(20px,2.5vw,36px)]">
          {rest.map((v) => (
            <figure key={v.src} className="jl-lift m-0 flex flex-col gap-[14px]">
              <div className="jl-melt-wide aspect-video overflow-hidden">
                <AutoVideo src={v.src} poster={v.poster} label={v.label} />
              </div>
              <figcaption className="flex justify-between items-baseline gap-4 border-t border-crema/40 pt-[14px]">
                <span className="font-display text-[28px] leading-none">{v.title}</span>
                <span className="text-[12px] tracking-[2px] uppercase font-semibold text-rosa">{v.tag}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

const pasos = ['Envíanos tu idea por mensaje', 'Recibe una propuesta de boceto', `Confirma con anticipo de [${site.depositPercent}%]`, `Pintado y entregado en ${site.leadDays.custom} días`]

function Personaliza() {
  return (
    <section id="personaliza" className="bg-borgona text-crema relative scroll-mt-6">
      <div className={`${container} py-[clamp(72px,10vw,150px)] flex flex-wrap gap-[clamp(48px,7vw,120px)] items-center`}>
        <div className="flex-[1.2_1_520px] min-w-0 flex flex-col gap-7 sm:gap-10">
          <p className="m-0 jl-eyebrow text-rosa">02 — Personaliza</p>
          <h2 className="m-0 font-display font-light text-[clamp(52px,6.6vw,104px)] leading-[.92]">
            Diseñado para
            <br />
            <span className="italic">tu historia.</span>
          </h2>
          <p className="m-0 max-w-[520px] text-[15px] sm:text-[17px] leading-[1.75] text-rosa">
            Un recuerdo, un nombre, una canción o un motivo que te represente. Lo convertimos en una pieza pintada a mano, con boceto previo y entrega con guía de cuidados.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-0 sm:gap-x-8 sm:gap-y-7">
            {pasos.map((t, i) => (
              <div key={t} className="flex flex-row sm:flex-col items-baseline sm:items-start gap-5 sm:gap-3 border-t border-crema/35 py-4 sm:pb-0 sm:pt-[18px]">
                <span className="font-display text-[30px] sm:text-[40px] leading-none">0{i + 1}</span>
                <span className="text-[14px] leading-[1.55]">{t}</span>
              </div>
            ))}
          </div>
          <Link to="/disena" className={`${btnLight} self-stretch sm:self-start`}>
            Iniciar un pedido personalizado <Arrow />
          </Link>
        </div>
        <div className="hidden sm:flex flex-[1_1_340px] min-w-0 justify-center relative">
          <img src="/media/sello_blanco_md.png" alt="Sello Julietté" loading="lazy" className="jl-float w-[min(380px,80%)] h-auto block" />
          <Star size={30} color="#fad9cd" className="jl-star absolute left-[4%] top-[10%]" />
          <Star size={18} color="#fad9cd" className="jl-star absolute right-[6%] bottom-[16%]" delay="1.6s" />
        </div>
      </div>
    </section>
  )
}

const procesoPasos = [
  { n: '1', t: 'Boceto', d: 'Idea, composición y paleta antes de tocar la tela.' },
  { n: '2', t: 'Pintura a mano', d: 'Capas de pintura textil, trazo por trazo.' },
  { n: '3', t: 'Revisión y entrega', d: 'Fijado, control de calidad y presentación con tarjetas.' },
]

function Proceso() {
  return (
    <section id="proceso" className={`${container} py-[clamp(72px,10vw,150px)] scroll-mt-6`}>
      <div className="flex flex-wrap gap-[clamp(40px,6vw,96px)] items-end">
        <ProcesoArte />
        <div className="flex-[1_1_380px] min-w-0 flex flex-col gap-9">
          <p className="m-0 jl-eyebrow">03 — Proceso</p>
          <h2 className="m-0 font-display font-light text-[clamp(46px,5.2vw,80px)] leading-[.95]">
            Del boceto
            <br />a la <span className="italic">pieza</span>
          </h2>
          <div className="flex flex-col">
            {procesoPasos.map((p, i) => (
              <div key={p.n} className={`flex gap-7 items-baseline py-[22px] border-t border-borgona ${i === procesoPasos.length - 1 ? 'border-b' : ''}`}>
                <span className="jl-outline font-display text-[64px] leading-[.8]">{p.n}</span>
                <div className="flex flex-col gap-[6px]">
                  <span className="font-semibold text-[17px]">{p.t}</span>
                  <span className="text-[14px] leading-[1.6]">{p.d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Manifiesto() {
  return (
    <section id="historia" className="relative py-[clamp(80px,11vw,170px)] px-[clamp(24px,4vw,56px)] text-center bg-rosa scroll-mt-6">
      <Star size={34} color="#82001a" className="jl-star absolute left-[12%] top-[22%] hidden sm:block" />
      <Star size={20} color="#82001a" className="jl-star absolute right-[14%] bottom-[26%] hidden sm:block" delay="1.2s" />
      <div className="max-w-[980px] mx-auto flex flex-col items-center gap-[26px] sm:gap-10">
        <p className="m-0 jl-eyebrow">04 — Manifiesto</p>
        <p className="m-0 font-display font-light text-[clamp(36px,4.6vw,68px)] leading-[1.12]">
          Creemos que lo cotidiano también puede ser <span className="italic">extraordinario.</span> Que un objeto puede guardar una historia, una emoción o un recuerdo.
        </p>
        <p className="m-0 max-w-[640px] text-[15px] sm:text-[16px] leading-[1.8]">
          Julietté nace de un nombre que los padres de su fundadora alguna vez desearon darle. Hoy ese nombre encuentra su lugar en un proyecto creativo: piezas pintadas a mano para crear, compartir y acompañar nuevas historias.
        </p>
        <p className="m-0 font-display italic text-[26px] sm:text-[30px]">Con cariño, Julietté</p>
      </div>
    </section>
  )
}

const superficies = ['Chamarras y prendas', 'Tenis de lona', 'Estuches y accesorios', 'Lienzos y cerámica']

function Superficies() {
  return (
    <section className={`${container} pt-[clamp(72px,10vw,150px)] pb-[clamp(56px,7vw,100px)]`}>
      <div className="flex flex-wrap justify-between items-end gap-6 mb-10">
        <h2 className="m-0 font-display font-light text-[clamp(44px,5vw,76px)] leading-[.95]">
          Nuevas <span className="italic">superficies</span>
        </h2>
        <p className="m-0 max-w-[360px] text-[15px] leading-[1.7]">El catálogo crecerá una superficie a la vez, siempre pintada a mano. Escríbenos si quieres ser de las primeras personas en recibirlas.</p>
      </div>
      <div className="flex flex-col border-b border-borgona">
        {superficies.map((s) => (
          <Link key={s} to="/#pedido" className="jl-row flex justify-between items-center gap-6 py-[26px] border-t border-borgona">
            <span className="font-display text-[clamp(30px,4vw,58px)] leading-none">{s}</span>
            <span className="flex items-center gap-6 text-[11px] sm:text-[13px] tracking-[2px] uppercase font-semibold">
              <span className="hidden xs:inline">Próximamente</span>
              <Arrow size={28} className="jl-row-arrow" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

const cuidados = ['Lavar al revés con agua fría', 'No usar cloro', 'Evitar frotar el diseño', 'Lavar con colores similares', 'Secar al aire', 'Planchar al revés']

export function Cuidados() {
  return (
    <section id="cuidados" className={`${container} pt-[clamp(40px,6vw,80px)] pb-[clamp(72px,10vw,150px)] flex flex-wrap gap-[clamp(32px,6vw,96px)] scroll-mt-6`}>
      <div className="flex-[1_1_320px] min-w-0 flex flex-col gap-[22px]">
        <p className="m-0 jl-eyebrow">05 — Cuidados</p>
        <h2 className="m-0 font-display font-light text-[clamp(44px,5vw,76px)] leading-[.95]">
          Para que dure
          <br />
          <span className="italic">muchas historias</span>
        </h2>
      </div>
      <div className="flex-[1.4_1_520px] min-w-0 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-10 content-start">
        {cuidados.map((c, i) => (
          <p key={c} className="m-0 py-[18px] sm:py-5 border-t border-borgona flex gap-[18px] text-[15px]">
            <span className="font-bold">0{i + 1}</span>
            {c}
          </p>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  usePageMeta('', 'Tote bags y piezas pintadas a mano y personalizadas. Romance hecho arte.')
  return (
    <>
      <Hero />
      <MarqueeBand />
      <div className="bg-vino text-crema">
        <Collection />
        <Videos />
      </div>
      <Personaliza />
      <Proceso />
      <Manifiesto />
      <Superficies />
      <Cuidados />
    </>
  )
}
