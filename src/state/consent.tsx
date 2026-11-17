import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { site } from '../config/site'
import { readJSON, writeJSON } from '../lib/format'

export type Consent = { necessary: true; analytics: boolean; marketing: boolean; decided: boolean; at?: string }

const KEY = 'jl-consent-v1'
const initial: Consent = { necessary: true, analytics: false, marketing: false, decided: false }

type ConsentCtx = {
  consent: Consent
  save: (c: { analytics: boolean; marketing: boolean }) => void
  panelOpen: boolean
  openPanel: () => void
  closePanel: () => void
}

const Ctx = createContext<ConsentCtx | null>(null)

let gaLoaded = false
let pixelLoaded = false

function loadScript(src: string) {
  const s = document.createElement('script')
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

/** Carga analítica y marketing solo con consentimiento y solo si están configurados. */
function applyConsent(c: Consent) {
  const w = window as unknown as Record<string, unknown> & { dataLayer?: unknown[] }
  if (c.analytics && site.analytics.ga4 && !gaLoaded) {
    gaLoaded = true
    w.dataLayer = w.dataLayer || []
    const gtag = (...args: unknown[]) => (w.dataLayer as unknown[]).push(args)
    w.gtag = gtag
    gtag('js', new Date())
    gtag('config', site.analytics.ga4, { anonymize_ip: true })
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${site.analytics.ga4}`)
  }
  if (c.marketing && site.analytics.metaPixel && !pixelLoaded) {
    pixelLoaded = true
    const n = function (...args: unknown[]) {
      const f = n as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] }
      if (f.callMethod) f.callMethod(...args)
      else f.queue.push(args)
    } as unknown as { queue: unknown[]; loaded: boolean; version: string; push: unknown }
    n.queue = []
    n.loaded = true
    n.version = '2.0'
    n.push = n
    w.fbq = n
    ;(w.fbq as (...a: unknown[]) => void)('init', site.analytics.metaPixel)
    ;(w.fbq as (...a: unknown[]) => void)('track', 'PageView')
    loadScript('https://connect.facebook.net/en_US/fbevents.js')
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Consent>(() => readJSON<Consent>(KEY, initial))
  const [panelOpen, setPanel] = useState(false)

  useEffect(() => {
    if (consent.decided) applyConsent(consent)
  }, [consent])

  const value = useMemo<ConsentCtx>(
    () => ({
      consent,
      save: ({ analytics, marketing }) => {
        const next: Consent = { necessary: true, analytics, marketing, decided: true, at: new Date().toISOString() }
        writeJSON(KEY, next)
        setConsent(next)
        setPanel(false)
      },
      panelOpen,
      openPanel: () => setPanel(true),
      closePanel: () => setPanel(false),
    }),
    [consent, panelOpen],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useConsent() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useConsent debe usarse dentro de ConsentProvider')
  return c
}
