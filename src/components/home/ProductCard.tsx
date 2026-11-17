import { Link } from 'react-router-dom'
import { money } from '../../lib/format'
import { Dot } from '../ui'

export function ProductCard({
  to,
  image,
  alt,
  name,
  meta,
  price,
  priceNote,
  status,
  offset = '',
}: {
  to: string
  image: string
  alt: string
  name: string
  meta: string
  price: number | null
  priceNote?: string
  status: 'disponible' | 'bajo-pedido' | 'agotado'
  offset?: string
}) {
  const label = status === 'disponible' ? 'Disponible' : status === 'bajo-pedido' ? 'Bajo pedido' : 'Agotado'
  return (
    <Link to={to} className={`jl-lift flex-[1_1_300px] min-w-0 flex flex-col gap-[10px] ${offset}`}>
      <div className="jl-melt aspect-[4/5] overflow-hidden">
        <img src={image} alt={alt} loading="lazy" decoding="async" className="w-full h-full object-cover block" />
      </div>
      <div className="flex justify-between items-baseline gap-4 border-t border-crema/40 pt-4">
        <div className="flex flex-col gap-[6px]">
          <span className="font-display text-[34px] leading-none">{name}</span>
          <span className="text-[13px] text-rosa">{meta}</span>
        </div>
        <div className="flex flex-col items-end gap-[6px]">
          <span className="text-[17px] font-semibold">{priceNote ?? money(price)}</span>
          <span className="inline-flex items-center gap-2 text-[12px] tracking-[1px] uppercase font-semibold">
            <Dot light filled={status === 'disponible'} />
            {label}
          </span>
        </div>
      </div>
    </Link>
  )
}
