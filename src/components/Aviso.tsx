import { useEffect, useId, useRef, type ReactNode, type PointerEvent as RPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { Cerezas } from './brand/Cerezas'

export type AvisoAction = { label: string; onClick: () => void; disabled?: boolean }

type Props = {
  open: boolean
  onClose: () => void
  /** Línea pequeña en mayúsculas sobre el título. */
  eyebrow?: string
  /** Título: la primera parte va normal y `accent` en cursiva, como en el resto del sitio. */
  title: string
  accent?: string
  body?: ReactNode
  children?: ReactNode
  primary?: AvisoAction
  secondary?: AvisoAction
  /** `vino` para errores del sistema (conexión, pedido); `crema` para lo que falta elegir. */
  tone?: 'crema' | 'vino'
}

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])'

/**
 * Aviso de Julietté para todo lo que interrumpe una compra o un diseño.
 * En escritorio es una tarjeta al centro; en celular, una hoja que sube desde abajo
 * (se cierra deslizándola hacia abajo, tocando fuera o con Esc).
 */
export function Aviso({ open, onClose, eyebrow, title, accent, body, children, primary, secondary, tone = 'crema' }: Props) {
  const id = useId()
  const card = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; dy: number } | null>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return
    const before = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const raf = requestAnimationFrame(() => {
      const el = card.current?.querySelector<HTMLElement>('[data-autofocus]') ?? card.current?.querySelector<HTMLElement>(FOCUSABLE)
      el?.focus({ preventScroll: true })
    })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current()
      }
      // El foco no sale del aviso mientras está abierto
      if (e.key === 'Tab' && card.current) {
        const items = [...card.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = overflow
      // Regresa el foco a donde estaba, salvo que la acción del aviso ya lo haya llevado a otro campo
      const now = document.activeElement
      if (!now || now === document.body || !now.isConnected) before?.focus?.({ preventScroll: true })
    }
  }, [open])

  if (!open) return null

  // Deslizar hacia abajo para cerrar (solo en la hoja del celular)
  const onDown = (e: RPointerEvent) => {
    if (window.matchMedia('(min-width: 640px)').matches) return
    drag.current = { y: e.clientY, dy: 0 }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onMove = (e: RPointerEvent) => {
    if (!drag.current || !card.current) return
    drag.current.dy = Math.max(0, e.clientY - drag.current.y)
    card.current.style.translate = `0 ${drag.current.dy}px`
  }
  const onUp = () => {
    if (!drag.current || !card.current) return
    const { dy } = drag.current
    drag.current = null
    card.current.style.translate = ''
    if (dy > 90) onClose()
  }

  const vino = tone === 'vino'
  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center sm:p-6 bg-[#2a0a10]/50 jl-aviso-back" onClick={onClose}>
      <div
        ref={card}
        role={vino ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        aria-describedby={body ? `${id}-d` : undefined}
        onClick={(e) => e.stopPropagation()}
        className="jl-aviso relative w-full sm:w-[min(480px,100%)]"
      >
        <Cerezas
          color={vino ? '#fad9cd' : '#82001a'}
          className="jl-swing absolute z-10 pointer-events-none w-[72px] h-[83px] -top-[56px] right-8 rotate-[10deg] sm:w-[88px] sm:h-[101px] sm:-top-[62px] sm:right-auto sm:left-9 sm:-rotate-[8deg]"
        />
        <div
          className={`max-h-[86dvh] overflow-y-auto overscroll-contain rounded-t-[30px] sm:rounded-[28px] px-6 pt-2 pb-[max(28px,env(safe-area-inset-bottom))] sm:px-10 sm:pt-12 sm:pb-8 flex flex-col gap-5 shadow-[0_30px_80px_-20px_rgba(42,10,16,.55)] ${vino ? 'bg-borgona text-crema' : 'bg-crema text-borgona'}`}
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className="sm:hidden self-center -mb-1 w-24 h-8 flex items-center justify-center bg-transparent border-0 cursor-grab touch-none"
          >
            <span className={`block w-11 h-[5px] rounded-full ${vino ? 'bg-crema/40' : 'bg-borgona/25'}`} />
          </button>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className={`hidden sm:flex absolute top-4 right-4 w-11 h-11 rounded-full items-center justify-center bg-transparent border-0 cursor-pointer ${vino ? 'text-crema hover:bg-crema/10' : 'text-borgona hover:bg-rosa/60'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>

          <div className="flex flex-col gap-[10px] pr-6 sm:pr-4">
            {eyebrow && <span className="text-[11px] tracking-[3px] uppercase font-semibold">{eyebrow}</span>}
            <h2 id={`${id}-t`} className="m-0 font-display font-light text-[38px] sm:text-[44px] leading-[.98]">
              {title}
              {accent && (
                <>
                  {' '}
                  <span className="italic">{accent}</span>
                </>
              )}
            </h2>
            {body && (
              <p id={`${id}-d`} className={`m-0 text-[14px] leading-[1.7] ${vino ? 'text-rosa' : 'text-vino'}`}>
                {body}
              </p>
            )}
          </div>

          {children}

          {(primary || secondary) && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-1">
              {primary && (
                <button
                  type="button"
                  data-autofocus
                  onClick={primary.onClick}
                  disabled={primary.disabled}
                  className={`flex-1 min-h-[54px] px-6 rounded-full border-0 text-[14px] font-semibold cursor-pointer ${vino ? 'bg-crema text-borgona hover:bg-rosa transition-colors' : 'jl-btn bg-borgona text-crema'}`}
                >
                  {primary.label}
                </button>
              )}
              {secondary && (
                <button
                  type="button"
                  onClick={secondary.onClick}
                  className={`min-h-[48px] px-5 rounded-full bg-transparent border-0 text-[14px] font-semibold cursor-pointer underline-offset-4 hover:underline ${vino ? 'text-crema' : 'text-borgona'}`}
                >
                  {secondary.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Opciones en forma de píldora para elegir dentro de un aviso (talla, medida, tamaño). */
export function AvisoOpciones({ options, value, onPick, notes }: { options: string[]; value: string; onPick: (v: string) => void; notes?: Record<string, string> }) {
  const big = !!notes || options.some((o) => o.length > 8)
  return (
    <div className={big ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2'} role="group">
      {options.map((o) => {
        const on = value === o
        return big ? (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(o)}
            className={`flex items-center justify-between gap-3 min-h-[58px] px-5 rounded-[18px] border text-left text-[14px] font-semibold cursor-pointer transition-colors ${on ? 'border-borgona bg-rosa text-borgona' : 'border-borgona/30 bg-transparent text-borgona hover:border-borgona'}`}
          >
            <span className="flex flex-col gap-[3px]">
              <span>{o}</span>
              {notes?.[o] && <span className="text-[12px] font-normal text-vino">{notes[o]}</span>}
            </span>
            {on && <Cerezas className="w-[20px] h-[23px] flex-none" />}
          </button>
        ) : (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(o)}
            className={`min-h-[44px] min-w-[52px] px-4 rounded-full border text-[13px] font-semibold cursor-pointer transition-colors ${on ? 'bg-borgona text-crema border-borgona' : 'bg-transparent text-borgona border-borgona/30 hover:border-borgona'}`}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

/** Textos para cuando falta la talla, la medida o el tamaño. */
export function fitCopy(label: string, kind?: string) {
  const l = label.toLowerCase()
  if (kind === 'agenda') return { title: '¿Bolsillo', accent: 'o escritorio?', body: 'Elige el tamaño de tu agenda. La tapa de tela la pintamos a mano.' }
  if (kind === 'cuadro' || l === 'medida') return { title: '¿Qué tan grande', accent: 'lo sueñas?', body: 'Elige la medida y preparamos el lienzo en su bastidor.' }
  if (l === 'talla') return { title: 'Sin talla', accent: 'no hay lienzo', body: 'Pintamos cada pieza a tu medida. Dinos cuál es la tuya y la preparamos para la primera pincelada.' }
  return { title: 'Un detalle', accent: 'antes de pintar', body: `Elige ${l === 'tamaño' ? 'un tamaño' : `una ${l}`} para continuar.` }
}

/** Nota corta por opción para la agenda. */
export const agendaNotes: Record<string, string> = { 'A6 · 10.5 × 14.8 cm': 'Para el bolso', 'A5 · 14.8 × 21 cm': 'Para el escritorio' }
