/**
 * Configuración central de la tienda.
 * Los datos editables (redes, ciudad, envíos, plazos, legales y videos) viven en
 * content/settings.json y se cambian desde el panel /admin, sin tocar código.
 * Lo técnico o sensible (número de WhatsApp, servicios externos) va en variables de entorno.
 */
import raw from '../../content/settings.json'

type Settings = {
  whatsappDisplay: string
  email: string
  instagram: { handle: string; url: string }
  tiktok: { handle: string; url: string }
  city: string
  shippingZone: string
  pickupPoint: string
  weeklySlots: number
  depositPercent: number
  leadDaysReady: string
  leadDaysCustom: string
  readyShipDays: string
  shippingCost: number | null
  freeShippingFrom: number | null
  customFrom: number | null
  nextDrop: string
  policy: { returnDays: number; damageHours: number; refundDays: number; privacyDays: number; designFee: string }
  legal: { owner: string; taxId: string; address: string; country: string; updated: string }
  videos?: { title: string; tag: string; video: string; poster?: string }[]
}

const s = raw as unknown as Settings

export const site = {
  name: 'Julietté',
  tagline: 'Romance hecho arte.',
  url: import.meta.env.VITE_SITE_URL ?? 'https://[TU-DOMINIO]',
  /** Número de WhatsApp en formato internacional sin "+" ni espacios, p. ej. 5215512345678 */
  whatsapp: import.meta.env.VITE_WHATSAPP ?? '',
  whatsappDisplay: s.whatsappDisplay,
  email: import.meta.env.VITE_CONTACT_EMAIL || s.email,
  instagram: s.instagram,
  tiktok: s.tiktok,
  city: s.city,
  shippingZone: s.shippingZone,
  pickupPoint: s.pickupPoint,
  currency: 'MXN',
  locale: 'es-MX',
  weeklySlots: s.weeklySlots,
  depositPercent: s.depositPercent,
  /** Días hábiles de elaboración */
  leadDays: { ready: s.leadDaysReady, custom: s.leadDaysCustom },
  /** Costo de envío. null = se cotiza por WhatsApp */
  shippingCost: s.shippingCost ?? null,
  /** Envío gratis a partir de este monto. null = no aplica */
  freeShippingFrom: s.freeShippingFrom ?? null,
  /** Días hábiles para enviar una pieza lista tras el pago */
  readyShipDays: s.readyShipDays,
  /** Precio "desde" de una pieza a medida. null = se muestra [PRECIO] */
  customFrom: s.customFrom ?? null,
  /** Fecha del próximo lanzamiento, como texto (ej. "Diciembre 2026") */
  nextDrop: s.nextDrop,
  /** Plazos de las políticas */
  policy: s.policy,
  legal: s.legal,
  videos: (s.videos ?? []).filter((v) => v.video),
  /** Opcionales: endpoints para integrar servicios (Formspree, Make, Zapier, etc.) */
  endpoints: {
    order: import.meta.env.VITE_ORDER_WEBHOOK ?? '',
    // Por defecto se usa el newsletter propio (Resend + Neon); se puede cambiar por otro servicio
    newsletter: import.meta.env.VITE_NEWSLETTER_ENDPOINT || '/api/newsletter',
    paymentLink: import.meta.env.VITE_PAYMENT_LINK ?? '',
  },
  analytics: {
    ga4: import.meta.env.VITE_GA_ID ?? '',
    metaPixel: import.meta.env.VITE_META_PIXEL_ID ?? '',
  },
}

/** Precios para la experiencia "Diseña la tuya". null = se cotiza */
export const customPricing = {
  base: null as number | null,
  text: null as number | null,
  back: null as number | null,
}
