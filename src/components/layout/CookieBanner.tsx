import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useConsent } from '../../state/consent'

function Toggle({ id, label, sub, checked, disabled, onChange }: { id: string; label: string; sub: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-t border-borgona/30">
      <label htmlFor={id} className="flex flex-col gap-1 cursor-pointer">
        <span className="text-[15px] font-semibold">{label}</span>
        <span className="text-[13px] leading-relaxed">{sub}</span>
      </label>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 w-11 h-6 accent-[#82001a] cursor-pointer disabled:cursor-not-allowed"
      />
    </div>
  )
}

export function CookieBanner() {
  const { consent, save, panelOpen, openPanel, closePanel } = useConsent()
  const [analytics, setAnalytics] = useState(consent.analytics)
  const [marketing, setMarketing] = useState(consent.marketing)

  useEffect(() => {
    if (panelOpen) {
      setAnalytics(consent.analytics)
      setMarketing(consent.marketing)
    }
  }, [panelOpen, consent])

  if (panelOpen) {
    return (
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="jl-cookie-t">
        <button type="button" aria-label="Cerrar" onClick={closePanel} className="absolute inset-0 bg-tinta/40 border-0 cursor-default" />
        <div className="jl-fade relative w-full max-w-[560px] bg-crema text-borgona p-7 sm:p-9 rounded-t-[28px] sm:rounded-[28px] max-h-[90dvh] overflow-y-auto">
          <h2 id="jl-cookie-t" className="m-0 font-display font-light text-[38px] leading-none">Preferencias de cookies</h2>
          <p className="mt-4 mb-2 text-[14px] leading-relaxed">
            Elige qué cookies aceptas. Puedes cambiar tu decisión cuando quieras desde el pie de página. Más información en la <Link to="/cookies" onClick={closePanel} className="underline underline-offset-4">política de cookies</Link>.
          </p>
          <Toggle id="ck-nec" label="Necesarias" sub="Guardan tu carrito, tu diseño y estas preferencias. Siempre activas." checked disabled />
          <Toggle id="ck-ana" label="Analítica" sub="Nos ayudan a entender qué piezas y secciones interesan más, de forma agregada." checked={analytics} onChange={setAnalytics} />
          <Toggle id="ck-mkt" label="Marketing" sub="Permiten medir campañas en redes sociales." checked={marketing} onChange={setMarketing} />
          <div className="flex flex-wrap gap-3 pt-6 border-t border-borgona/30">
            <button type="button" onClick={() => save({ analytics, marketing })} className="jl-btn min-h-[50px] px-7 rounded-full bg-borgona text-crema text-[14px] font-semibold border-0 cursor-pointer">
              Guardar preferencias
            </button>
            <button type="button" onClick={() => save({ analytics: true, marketing: true })} className="min-h-[50px] px-7 rounded-full bg-transparent border border-borgona text-borgona text-[14px] font-semibold cursor-pointer">
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (consent.decided) return null

  return (
    <div className="jl-fade fixed left-3 right-3 bottom-3 sm:left-auto sm:right-6 sm:bottom-6 z-[65] sm:max-w-[440px] bg-crema text-borgona border border-borgona rounded-[24px] p-6 shadow-[0_24px_60px_-20px_rgba(90,0,18,.35)]" role="region" aria-label="Aviso de cookies">
      <p className="m-0 font-display text-[28px] leading-none">Una nota rápida</p>
      <p className="mt-3 mb-5 text-[14px] leading-relaxed">
        Usamos cookies necesarias para que la tienda funcione y, si lo permites, cookies de analítica y marketing para mejorarla. <Link to="/cookies" className="underline underline-offset-4">Saber más</Link>
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => save({ analytics: true, marketing: true })} className="jl-btn min-h-[46px] px-6 rounded-full bg-borgona text-crema text-[14px] font-semibold border-0 cursor-pointer">
          Aceptar
        </button>
        <button type="button" onClick={() => save({ analytics: false, marketing: false })} className="min-h-[46px] px-6 rounded-full bg-transparent border border-borgona text-borgona text-[14px] font-semibold cursor-pointer">
          Solo necesarias
        </button>
        <button type="button" onClick={openPanel} className="jl-link min-h-[46px] px-2 bg-transparent border-0 text-borgona text-[14px] font-semibold cursor-pointer">
          Configurar
        </button>
      </div>
    </div>
  )
}
