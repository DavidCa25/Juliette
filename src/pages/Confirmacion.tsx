import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { readJSON } from '../lib/format'
import { whatsappUrl } from '../lib/whatsapp'
import { usePageMeta } from '../lib/usePageMeta'
import { track } from '../lib/analytics'
import { Arrow, Star, btnPrimary, container } from '../components/ui'
import { ORDER_KEY, type StoredOrder } from './Checkout'

export default function Confirmacion() {
  usePageMeta('Pedido recibido')
  const order = readJSON<StoredOrder | null>(ORDER_KEY, null)

  if (!order) {
    return (
      <section className={`${container} py-[clamp(72px,9vw,130px)] flex flex-col items-start gap-6`}>
        <h1 className="m-0 font-display font-light text-[clamp(48px,6vw,88px)] leading-[.92]">No encontramos un pedido reciente</h1>
        <Link to="/coleccion" className={btnPrimary}>Ver la colección <Arrow /></Link>
      </section>
    )
  }

  const mail = `mailto:${site.email}?subject=${encodeURIComponent(`Pedido ${order.id}`)}&body=${encodeURIComponent(order.message)}`

  return (
    <section className="relative bg-rosa">
      <Star size={34} color="#82001a" className="jl-star absolute left-[10%] top-[18%] hidden sm:block" />
      <Star size={20} color="#82001a" className="jl-star absolute right-[12%] bottom-[22%] hidden sm:block" delay="1.2s" />
      <div className={`${container} py-[clamp(72px,10vw,150px)] flex flex-col items-center text-center gap-8 max-w-[860px]`}>
        <img src="/media/isotipo_burdeos_md.png" alt="" width={90} height={118} className="jl-pop" />
        <p className="m-0 jl-eyebrow">Pedido {order.id}</p>
        <h1 className="m-0 font-display font-light text-[clamp(48px,6vw,92px)] leading-[.95]">
          Gracias, <span className="italic">{order.customer.name.split(' ')[0]}</span>.
        </h1>
        <p className="m-0 max-w-[560px] text-[16px] leading-[1.8]">
          Tu pedido quedó registrado. El último paso es enviarnos el resumen por WhatsApp para confirmar disponibilidad, envío y forma de pago. Si incluiste una referencia, adjúntala en el chat.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <a href={whatsappUrl(order.message)} onClick={() => track('whatsapp_click', { from: 'confirmacion' })} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
            Enviar por WhatsApp <Arrow />
          </a>
          <a href={mail} className="jl-link text-[15px] font-semibold">Prefiero enviarlo por correo</a>
        </div>
        {site.endpoints.paymentLink && (
          <a href={site.endpoints.paymentLink} target="_blank" rel="noopener noreferrer" className="jl-link text-[14px] font-semibold">
            Ir al enlace de pago
          </a>
        )}
        <details className="w-full max-w-[560px] text-left border-t border-borgona pt-5">
          <summary className="cursor-pointer text-[14px] font-semibold">Ver resumen del pedido</summary>
          <pre className="mt-4 whitespace-pre-wrap font-sans text-[13px] leading-[1.7]">{order.message}</pre>
        </details>
      </div>
    </section>
  )
}
