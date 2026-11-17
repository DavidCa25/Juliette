import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { site } from '../../config/site'
import { useCart } from '../../state/cart'
import { container } from '../ui'

const links = [
  { to: '/#coleccion', label: 'Colección' },
  { to: '/disena', label: 'Personaliza' },
  { to: '/#proceso', label: 'Proceso' },
  { to: '/#historia', label: 'Historia' },
  { to: '/#cuidados', label: 'Cuidados' },
]

function CartButton() {
  const { count, openDrawer } = useCart()
  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Abrir carrito, ${count} ${count === 1 ? 'artículo' : 'artículos'}`}
      className="relative w-12 h-12 flex items-center justify-center bg-transparent border-0 text-borgona cursor-pointer"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path d="M5 8h14l-1.2 12H6.2z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      {count > 0 && (
        <span key={count} className="jl-pop absolute top-1 right-0 min-w-[19px] h-[19px] px-1 rounded-full bg-borgona text-crema text-[11px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  )
}

export function AnnouncementBar() {
  return (
    <div className="bg-borgona text-crema px-5 py-[11px] text-center text-[10px] sm:text-[12px] tracking-[2px] sm:tracking-[3px] uppercase font-medium">
      Pedidos personalizados abiertos<span className="hidden sm:inline"> · Cupo de [{site.weeklySlots}] piezas por semana</span>
    </div>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => setOpen(false), [loc.pathname, loc.hash])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="relative z-40 bg-crema">
      <div className={`${container} py-4 lg:py-[26px] flex items-center justify-between gap-6`}>
        <Link to="/" aria-label="Julietté, inicio" className="flex items-center gap-3">
          <img src="/media/isotipo_burdeos_sm.png" alt="" width={30} height={39} className="block w-6 lg:w-[30px] h-auto" />
          <span className="font-bold text-[18px] lg:text-[21px] tracking-[1px]">JULIETTÉ</span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:flex gap-[clamp(18px,2.6vw,40px)] text-[14px] font-medium">
          {links.map((l) => (
            <NavLink key={l.label} to={l.to} className="jl-link">
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:gap-4">
          <Link to="/disena" className="jl-btn hidden lg:inline-flex items-center gap-[10px] min-h-[46px] px-[26px] rounded-full bg-borgona text-crema text-[14px] font-semibold">
            Hacer un pedido
          </Link>
          <CartButton />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="jl-menu-movil"
            className="lg:hidden w-12 h-12 border-0 bg-transparent text-borgona flex items-center justify-center cursor-pointer"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 8h16M4 16h16'} />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="jl-menu-movil" aria-label="Principal" className="jl-menu lg:hidden absolute left-0 right-0 top-full z-40 bg-crema px-5 pt-3 pb-9 flex flex-col h-[calc(100dvh-110px)] overflow-y-auto">
          {[...links, { to: '/carrito', label: 'Carrito' }].map((l, i, arr) => (
            <Link
              key={l.label}
              to={l.to}
              className={`py-[18px] border-t border-borgona font-display text-[40px] leading-none ${i === arr.length - 1 ? 'border-b' : ''}`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/disena" className="mt-7 flex items-center justify-center min-h-[54px] rounded-full bg-borgona text-crema text-[15px] font-semibold">
            Hacer un pedido
          </Link>
        </nav>
      )}
    </header>
  )
}
