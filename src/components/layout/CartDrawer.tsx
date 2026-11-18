import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCart, type CartLine } from '../../state/cart'
import { money } from '../../lib/format'
import { Arrow, btnPrimary } from '../ui'

export function LineSummary({ line }: { line: CartLine }) {
  return line.kind === 'product' ? (
    <span className="text-[13px]">
      {line.optionLabel}
      {line.idea ? ` · “${line.idea}”` : ''}
    </span>
  ) : (
    <span className="text-[13px]">Pieza creada por ti · se cotiza con boceto</span>
  )
}

export function QtyControl({ line }: { line: CartLine }) {
  const { setQty } = useCart()
  return (
    <div className="inline-flex items-center border border-borgona rounded-full h-10">
      <button type="button" aria-label={`Quitar una unidad de ${line.name}`} onClick={() => setQty(line.id, line.qty - 1)} className="w-10 h-10 bg-transparent border-0 text-borgona text-lg cursor-pointer">
        −
      </button>
      <span aria-live="polite" className="w-6 text-center text-[14px] font-semibold">{line.qty}</span>
      <button type="button" aria-label={`Agregar una unidad de ${line.name}`} onClick={() => setQty(line.id, line.qty + 1)} className="w-10 h-10 bg-transparent border-0 text-borgona text-lg cursor-pointer">
        +
      </button>
    </div>
  )
}

export function CartDrawer() {
  const { lines, drawerOpen, closeDrawer, remove, subtotal, count } = useCart()
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDrawer()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [drawerOpen, closeDrawer])

  if (!drawerOpen) return null

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="jl-cart-title">
      <button type="button" aria-label="Cerrar carrito" onClick={closeDrawer} className="absolute inset-0 bg-tinta/40 border-0 cursor-default" />
      <div ref={panel} tabIndex={-1} className="jl-drawer absolute right-0 top-0 h-full w-full max-w-[460px] bg-crema text-borgona flex flex-col outline-none">
        <div className="flex items-center justify-between px-7 py-6 border-b border-borgona">
          <h2 id="jl-cart-title" className="m-0 font-display font-light text-[38px] leading-none">
            Tu carrito <span className="font-sans text-[14px] font-semibold align-middle">({count})</span>
          </h2>
          <button type="button" onClick={closeDrawer} aria-label="Cerrar carrito" className="w-12 h-12 bg-transparent border-0 text-borgona cursor-pointer flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">
            <img src="/media/isotipo_burdeos_sm.png" alt="" width={56} height={73} />
            <p className="m-0 font-display text-[32px] leading-tight">Tu carrito está esperando una historia.</p>
            <Link to="/#coleccion" onClick={closeDrawer} className="jl-link text-[15px] font-semibold">
              Ver la colección
            </Link>
            <Link to="/design" onClick={closeDrawer} className="jl-link text-[15px] font-semibold">
              Diseña la tuya
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-7 m-0 list-none p-0">
              {lines.map((l) => (
                <li key={l.id} className="flex gap-4 py-5 border-b border-borgona/30">
                  <div className="w-[84px] h-[105px] flex-none rounded-t-full overflow-hidden bg-vino">
                    <img src={l.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex justify-between gap-3">
                      <span className="font-display text-[26px] leading-none">{l.name}</span>
                      <span className="text-[14px] font-semibold whitespace-nowrap">{l.unitPrice === null ? 'Por cotizar' : money(l.unitPrice * l.qty)}</span>
                    </div>
                    <LineSummary line={l} />
                    <div className="flex items-center justify-between mt-auto">
                      <QtyControl line={l} />
                      <button type="button" onClick={() => remove(l.id)} className="jl-link bg-transparent border-0 p-0 text-borgona text-[13px] font-semibold cursor-pointer">
                        Quitar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-7 py-6 border-t border-borgona flex flex-col gap-4">
              <div className="flex justify-between text-[15px]">
                <span>Subtotal</span>
                <span className="font-semibold">{subtotal === null ? 'Se confirma por WhatsApp' : money(subtotal)}</span>
              </div>
              <p className="m-0 text-[13px] leading-relaxed">Envío e impuestos se calculan al confirmar. Los pedidos personalizados se inician con anticipo tras aprobar el boceto.</p>
              <Link to="/checkout" onClick={closeDrawer} className={`${btnPrimary} w-full`}>
                Continuar con el pedido <Arrow />
              </Link>
              <Link to="/carrito" onClick={closeDrawer} className="jl-link self-center text-[14px] font-semibold">
                Ver carrito completo
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
