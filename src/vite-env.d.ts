/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
  readonly VITE_WHATSAPP?: string
  readonly VITE_CONTACT_EMAIL?: string
  readonly VITE_ORDER_WEBHOOK?: string
  readonly VITE_NEWSLETTER_ENDPOINT?: string
  readonly VITE_PAYMENT_LINK?: string
  readonly VITE_GA_ID?: string
  readonly VITE_META_PIXEL_ID?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_SENTRY_ENV?: string
  readonly VITE_RELEASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
