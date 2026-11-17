import type { CSSProperties } from 'react'
import { Star } from '../ui'

const stroke = (len: number, delay: string): CSSProperties =>
  ({ '--len': len, animationDelay: delay, animationIterationCount: 'infinite', animationDirection: 'alternate', animationDuration: '4.2s' }) as CSSProperties

/** Composición artística temporal para la sección Proceso: trazos de pincel que se dibujan solos. */
export function ProcesoArte() {
  return (
    <div className="relative flex-[1.3_1_480px] min-w-0 aspect-[16/11] rounded-[28px] bg-vino overflow-hidden" role="img" aria-label="Trazos de pincel en rosa y crema dibujándose sobre fondo vino, con el isotipo de Julietté">
      <div className="jl-stripes absolute right-[7%] top-[12%] w-[30%] h-[100%] rounded-t-full opacity-80" aria-hidden="true" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path className="jl-draw" style={stroke(1000, '0s')} d="M40 430 C170 300 300 480 430 350 S650 220 770 300" fill="none" stroke="#fad9cd" strokeWidth={30} strokeLinecap="round" />
        <path className="jl-draw" style={stroke(900, '.5s')} d="M70 150 C210 60 330 210 470 120 S690 70 760 170" fill="none" stroke="#fdf6ee" strokeWidth={3} strokeLinecap="round" />
        <path className="jl-draw" style={stroke(700, '.9s')} d="M110 505 C250 445 380 525 520 455 S680 430 740 470" fill="none" stroke="#c23b4e" strokeWidth={12} strokeLinecap="round" />
        <path className="jl-draw" style={stroke(420, '1.3s')} d="M520 70 C560 120 600 110 640 70 S720 40 760 90" fill="none" stroke="#fad9cd" strokeWidth={6} strokeLinecap="round" />
      </svg>
      <img src="/media/isotipo_blanco_md.png" alt="" loading="lazy" className="jl-float absolute left-[16%] top-1/2 -translate-y-1/2 w-[24%] h-auto" />
      <Star size={30} color="#fad9cd" className="jl-star absolute right-[12%] top-[14%]" />
      <Star size={18} color="#fdf6ee" className="jl-star absolute left-[8%] top-[18%]" delay="1.2s" />
      <Star size={22} color="#fad9cd" className="jl-star absolute right-[40%] bottom-[12%]" delay="2s" />
      <span className="absolute left-6 bottom-5 text-[12px] tracking-[3px] uppercase font-semibold text-rosa">Cada trazo, a mano</span>
    </div>
  )
}
