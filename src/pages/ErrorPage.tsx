import { useEffect } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import NotFound from './NotFound'
import { reportError } from '../lib/monitoring'

const CHUNK_ERROR = /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|error loading dynamically imported module/i

/**
 * Pantalla de error general (equivalente a un 500).
 * Si el error es porque se publicó una versión nueva mientras la persona navegaba,
 * recarga la página una sola vez para traer los archivos nuevos.
 */
export default function ErrorPage() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : String((error as { statusText?: string })?.statusText ?? '')
  const isChunk = CHUNK_ERROR.test(message)

  useEffect(() => {
    document.title = 'Algo salió mal · Julietté'
    if (!(isRouteErrorResponse(error) && error.status === 404)) reportError(error, { chunk: isChunk })
    if (isChunk && !sessionStorage.getItem('jl-reloaded')) {
      sessionStorage.setItem('jl-reloaded', '1')
      window.location.reload()
    }
  }, [isChunk, error])

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />

  return (
    <main className="min-h-dvh bg-crema text-borgona font-sans flex items-center">
      <section className="relative max-w-[1320px] w-full mx-auto px-[clamp(20px,4vw,56px)] py-[clamp(72px,10vw,150px)] flex flex-col items-start gap-8">
        <a href="/" className="flex items-center gap-3" aria-label="Julietté, inicio">
          <img src="/media/isotipo_burdeos_sm.png" alt="" width={30} height={39} />
          <span className="font-bold text-[20px] tracking-[1px]">JULIETTÉ</span>
        </a>
        <p className="m-0 jl-eyebrow">{isChunk ? 'Actualizando' : 'Error inesperado'}</p>
        <h1 className="m-0 font-display font-light text-[clamp(52px,8vw,120px)] leading-[.9]">
          Se nos corrió
          <br />
          <span className="italic">la pintura.</span>
        </h1>
        <p className="m-0 max-w-[520px] text-[16px] leading-[1.75]">
          {isChunk
            ? 'Acabamos de publicar una versión nueva del sitio. Recarga la página para verla.'
            : 'Algo no salió como esperábamos. Tu carrito y tu diseño siguen guardados. Intenta de nuevo o escríbenos si el problema continúa.'}
        </p>
        <div className="flex flex-wrap items-center gap-8">
          <button type="button" onClick={() => window.location.reload()} className="jl-btn inline-flex items-center gap-3 min-h-[56px] px-[34px] rounded-full bg-borgona text-crema text-[15px] font-semibold border-0 cursor-pointer">
            Recargar la página
          </button>
          <a href="/" className="jl-link text-[15px] font-semibold">Volver al inicio</a>
        </div>
      </section>
    </main>
  )
}
