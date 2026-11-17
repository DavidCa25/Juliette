import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

export const STAR_PATH = 'M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z'

export function Star({ size = 12, color = 'currentColor', className = '', style, delay }: { size?: number; color?: string; className?: string; style?: CSSProperties; delay?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" className={className} style={{ ...style, animationDelay: delay }}>
      <path d={STAR_PATH} />
    </svg>
  )
}

export function Arrow({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

/** Clases de botón compartidas (relleno con barrido al pasar el mouse). */
export const btnPrimary =
  'jl-btn inline-flex items-center justify-center gap-[14px] min-h-[56px] px-[34px] rounded-full bg-borgona text-crema text-[15px] font-semibold cursor-pointer border-0'
export const btnLight =
  'jl-btn jl-btn-light inline-flex items-center justify-center gap-[14px] min-h-[56px] px-[34px] rounded-full bg-crema text-borgona text-[15px] font-semibold cursor-pointer border-0'

export const container = 'max-w-[1320px] mx-auto px-[clamp(20px,4vw,56px)]'

/** Video silencioso en bucle que solo se reproduce cuando está en pantalla (ahorra datos y batería). */
export function AutoVideo({ src, poster, label, className = '' }: { src: string; poster: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.2 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [src])
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
      className={`w-full h-full object-cover block ${className}`}
    />
  )
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`m-0 jl-eyebrow ${className}`}>{children}</p>
}

export function Dot({ filled = true, light = false }: { filled?: boolean; light?: boolean }) {
  const c = light ? 'var(--color-crema)' : 'var(--color-borgona)'
  return <span className="inline-block w-[7px] h-[7px] rounded-full" style={filled ? { background: c } : { border: `1px solid ${c}` }} />
}
