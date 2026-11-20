import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../../config/site'
import { useConsent } from '../../state/consent'
import { whatsappUrl } from '../../lib/whatsapp'

function Newsletter() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'already' | 'error'>('idle')
  const [website, setWebsite] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState('error')
      return
    }
    if (!site.endpoints.newsletter) {
      // Sin servicio configurado: se abre el correo para registrarse manualmente
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent('Quiero recibir los lanzamientos de Julietté')}&body=${encodeURIComponent(email)}`
      setState('ok')
      return
    }
    try {
      setState('sending')
      const r = await fetch(site.endpoints.newsletter, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email, website, source: 'pie-de-pagina' }) })
      const data = (await r.json().catch(() => ({}))) as { already?: boolean }
      setState(r.ok ? (data.already ? 'already' : 'ok') : 'error')
      if (r.ok) setEmail('')
    } catch {
      setState('error')
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 max-w-[460px]">
      <label htmlFor="jl-mail" className="text-[13px] tracking-[2px] uppercase font-semibold text-rosa">
        Recibe los lanzamientos
      </label>
      <div className="flex items-center border-b border-crema">
        <input
          id="jl-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setState('idle')
          }}
          placeholder="tu correo"
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-crema text-[16px] py-4 placeholder:text-[#c99a9a]"
        />
        <button type="submit" aria-label="Suscribirme" disabled={state === 'sending'} className="bg-transparent border-0 text-crema w-12 h-12 flex items-center justify-center cursor-pointer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="sr-only" aria-hidden="true" />
      <p className="m-0 text-[11px] leading-[1.6] text-[#c99a9a]">
        Al suscribirte aceptas recibir correos de Julietté y nuestro <Link to="/privacidad" className="underline underline-offset-2">aviso de privacidad</Link>. Puedes darte de baja cuando quieras.
      </p>
      <p aria-live="polite" className="m-0 text-[13px] text-rosa min-h-[20px]">
        {state === 'ok' && 'Gracias. Revisa tu correo: te mandamos la bienvenida.'}
        {state === 'already' && 'Ya estás suscrita. Te avisaremos de cada lanzamiento.'}
        {state === 'error' && 'Revisa tu correo e inténtalo de nuevo.'}
      </p>
    </form>
  )
}

export function Footer() {
  const { openPanel } = useConsent()
  const year = new Date().getFullYear()
  return (
    <footer id="pedido" className="bg-borgona text-crema overflow-hidden">
      <div className="max-w-[1320px] mx-auto pt-[clamp(70px,9vw,130px)] px-[clamp(20px,4vw,56px)] flex flex-wrap gap-14 justify-between">
        <div className="flex-[1.4_1_420px] min-w-0 flex flex-col gap-7">
          <h2 className="m-0 font-display font-light text-[clamp(44px,5vw,76px)] leading-[.95]">
            ¿Qué historia
            <br />
            <span className="italic">quieres llevar contigo?</span>
          </h2>
          <Newsletter />
        </div>
        <div className="flex-[1_1_420px] min-w-0 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-8">
          <div className="flex flex-col gap-[14px] text-[15px]">
            <span className="text-[12px] tracking-[2px] uppercase font-semibold text-rosa">Pedidos</span>
            <a className="jl-link self-start" href={whatsappUrl('Hola, Julietté. Me gustaría hacer un pedido.')} target="_blank" rel="noopener noreferrer">
              WhatsApp {site.whatsappDisplay}
            </a>
            <a className="jl-link self-start" href={site.instagram.url} target="_blank" rel="noopener noreferrer">
              Instagram {site.instagram.handle}
            </a>
            <a className="jl-link self-start" href={site.tiktok.url} target="_blank" rel="noopener noreferrer">
              TikTok {site.tiktok.handle}
            </a>
          </div>
          <div className="flex flex-col gap-[14px] text-[15px]">
            <span className="text-[12px] tracking-[2px] uppercase font-semibold text-rosa">Información</span>
            <Link className="jl-link self-start" to="/#cuidados">Cuidados</Link>
            <Link className="jl-link self-start" to="/envios">Envíos a {site.shippingZone}</Link>
            <Link className="jl-link self-start" to="/preguntas-frecuentes">Preguntas frecuentes</Link>
          </div>
          <div className="flex flex-col gap-[14px] text-[15px]">
            <span className="text-[12px] tracking-[2px] uppercase font-semibold text-rosa">Legal</span>
            <Link className="jl-link self-start" to="/terminos">Términos y condiciones</Link>
            <Link className="jl-link self-start" to="/reembolsos">Cambios y reembolsos</Link>
            <Link className="jl-link self-start" to="/privacidad">Aviso de privacidad</Link>
            <Link className="jl-link self-start" to="/cookies">Política de cookies</Link>
            <button type="button" onClick={openPanel} className="jl-link self-start bg-transparent border-0 p-0 text-crema text-[15px] cursor-pointer text-left">
              Preferencias de cookies
            </button>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="max-w-[1320px] mx-auto pt-[60px] px-[clamp(20px,4vw,56px)] font-bold text-[clamp(74px,16.5vw,236px)] leading-[.78] tracking-[-4px] whitespace-nowrap text-crema">
        JULIETTÉ
      </div>
      <div className="max-w-[1320px] mx-auto py-7 px-[clamp(20px,4vw,56px)] flex flex-wrap justify-between gap-3 text-[13px] text-rosa border-t border-crema/25">
        <span>© {year} Julietté · Romance hecho arte.</span>
        <span>Piezas pintadas a mano en {site.city}</span>
      </div>
    </footer>
  )
}
