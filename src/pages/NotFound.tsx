import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/usePageMeta'
import { Arrow, Star, btnPrimary, container } from '../components/ui'

export default function NotFound() {
  usePageMeta('Página no encontrada')
  useEffect(() => {
    // Evita que los buscadores indexen direcciones que no existen
    const tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex'
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [])
  return (
    <section className={`${container} relative py-[clamp(80px,12vw,180px)] flex flex-col items-start gap-8`}>
      <Star size={30} color="#82001a" className="jl-star absolute right-[12%] top-[20%]" />
      <p className="m-0 jl-eyebrow">Error 404</p>
      <h1 className="m-0 font-display font-light text-[clamp(56px,8vw,128px)] leading-[.9]">
        Esta página aún
        <br />
        <span className="italic">no se ha pintado.</span>
      </h1>
      <div className="flex flex-wrap items-center gap-8">
        <Link to="/" className={btnPrimary}>Volver al inicio <Arrow /></Link>
        <Link to="/design" className="jl-link text-[15px] font-semibold">Diseña la tuya</Link>
      </div>
    </section>
  )
}
