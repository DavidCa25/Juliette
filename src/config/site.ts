/**
 * Configuración central de la tienda.
 * Cambia aquí teléfonos, redes, moneda, precios base y datos legales.
 * Los valores entre [CORCHETES] son pendientes por definir con la marca.
 */
export const site = {
  name: 'Julietté',
  tagline: 'Romance hecho arte.',
  url: import.meta.env.VITE_SITE_URL ?? 'https://[TU-DOMINIO]',
  /** Número de WhatsApp en formato internacional sin "+" ni espacios, p. ej. 5215512345678 */
  whatsapp: import.meta.env.VITE_WHATSAPP ?? '',
  whatsappDisplay: '[NÚMERO]',
  email: import.meta.env.VITE_CONTACT_EMAIL ?? '[CORREO]',
  instagram: { handle: '@[usuario]', url: 'https://instagram.com/' },
  tiktok: { handle: '@[usuario]', url: 'https://tiktok.com/' },
  city: '[CIUDAD]',
  shippingZone: '[ZONA]',
  pickupPoint: '[PUNTO DE ENTREGA]',
  currency: 'MXN',
  locale: 'es-MX',
  weeklySlots: 5,
  depositPercent: 50,
  /** Días hábiles de elaboración */
  leadDays: { ready: '[X]', custom: '[X]' },
  /** Costo de envío. null = se cotiza por WhatsApp */
  shippingCost: null as number | null,
  legal: {
    owner: '[NOMBRE O RAZÓN SOCIAL]',
    taxId: '[RFC / ID FISCAL]',
    address: '[DOMICILIO FISCAL]',
    country: '[PAÍS]',
    updated: '17 de noviembre de 2026',
  },
  /** Opcionales: endpoints para integrar servicios (Formspree, Make, Zapier, etc.) */
  endpoints: {
    order: import.meta.env.VITE_ORDER_WEBHOOK ?? '',
    newsletter: import.meta.env.VITE_NEWSLETTER_ENDPOINT ?? '',
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
