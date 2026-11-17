import { site } from '../config/site'

/** Abre WhatsApp con un mensaje prellenado. Si no hay número configurado, abre el selector de contacto. */
export function whatsappUrl(message: string) {
  const text = encodeURIComponent(message)
  return site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${text}` : `https://wa.me/?text=${text}`
}

export function openWhatsApp(message: string) {
  window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer')
}
