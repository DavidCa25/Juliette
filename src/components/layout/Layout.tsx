import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnnouncementBar, Header } from './Header'
import { Footer } from './Footer'
import { CartDrawer } from './CartDrawer'
import { CookieBanner } from './CookieBanner'

/** Lleva al inicio al cambiar de página o a la sección indicada con #ancla. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      let tries = 0
      const go = () => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else if (tries++ < 20) window.setTimeout(go, 60)
      }
      go()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" aria-busy="true" aria-live="polite">
      <img src="/media/isotipo_burdeos_sm.png" alt="Cargando" width={44} height={58} className="jl-float" />
    </div>
  )
}

export function Layout() {
  return (
    <div className="bg-crema text-borgona font-sans overflow-x-clip min-h-dvh flex flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:bg-borgona focus:text-crema focus:px-5 focus:py-3 focus:rounded-full">
        Saltar al contenido
      </a>
      <ScrollManager />
      <AnnouncementBar />
      <Header />
      <main id="contenido" className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <CookieBanner />
    </div>
  )
}
