import { Link } from 'react-router-dom'
import { useCart } from '../state/cart'
import { money } from '../lib/format'
import { usePageMeta } from '../lib/usePageMeta'
import { LineSummary, QtyControl } from '../components/layout/CartDrawer'
import { Arrow, btnPrimary, container } from '../components/ui'

export default function Carrito() {
  usePageMeta('Carrito')
  const { lines, remove, subtotal, count } = useCart()
  return (
    <section className={`${container} pt-[clamp(24px,4vw,56px)] pb-[clamp(72px,9vw,130px)]`}>
      <h1 className="m-0 font-display font-light text-[clamp(52px,6vw,96px)] leading-[.92] mb-10">
        Tu <span className="italic">carrito</span>
      </h1>
      {lines.length === 0 ? (
        <div className="flex flex-col items-start gap-6 border-t border-borgona pt-10">
          <p className="m-0 text-[17px]">Aún no hay piezas aquí.</p>
          <div className="flex gap-8 flex-wrap">
            <Link to="/coleccion" className={btnPrimary}>Ver la colección <Arrow /></Link>
            <Link to="/design" className="jl-link self-center text-[15px] font-semibold">Diseña la tuya</Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-[clamp(32px,6vw,96px)] items-start">
          <ul className="flex-[1.6_1_520px] min-w-0 m-0 p-0 list-none border-b border-borgona">
            {lines.map((l) => (
              <li key={l.id} className="flex gap-5 sm:gap-7 py-7 border-t border-borgona">
                <div className="w-[96px] sm:w-[130px] aspect-[4/5] flex-none rounded-t-full overflow-hidden bg-vino">
                  <img src={l.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                  <div className="flex justify-between gap-4 flex-wrap">
                    {l.kind === 'product' ? (
                      <Link to={`/producto/${l.slug}`} className="font-display text-[34px] leading-none">{l.name}</Link>
                    ) : (
                      <Link to="/design" className="font-display text-[34px] leading-none">{l.name}</Link>
                    )}
                    <span className="text-[16px] font-semibold">{l.unitPrice === null ? 'Por cotizar' : money(l.unitPrice * l.qty)}</span>
                  </div>
                  <LineSummary line={l} />
                  <div className="flex items-center gap-6 mt-auto pt-2">
                    <QtyControl line={l} />
                    <button type="button" onClick={() => remove(l.id)} className="jl-link bg-transparent border-0 p-0 text-borgona text-[13px] font-semibold cursor-pointer">Quitar</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="flex-[1_1_320px] min-w-0 flex flex-col gap-5 lg:sticky lg:top-6" aria-label="Resumen">
            <h2 className="m-0 jl-eyebrow">Resumen · {count} {count === 1 ? 'pieza' : 'piezas'}</h2>
            <div className="flex justify-between text-[15px] border-t border-borgona pt-5"><span>Subtotal</span><span className="font-semibold">{subtotal === null ? 'Se confirma por WhatsApp' : money(subtotal)}</span></div>
            <div className="flex justify-between text-[15px]"><span>Envío</span><span>Se calcula al confirmar</span></div>
            <p className="m-0 text-[13px] leading-[1.7]">Las piezas personalizadas se cotizan con su boceto. Recibirás la confirmación final antes de pagar.</p>
            <Link to="/checkout" className={`${btnPrimary} w-full`}>Continuar con el pedido <Arrow /></Link>
            <Link to="/coleccion" className="jl-link self-center text-[14px] font-semibold">Seguir explorando</Link>
          </aside>
        </div>
      )}
    </section>
  )
}
