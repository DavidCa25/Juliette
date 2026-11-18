import { readFileSync } from 'node:fs'
import path from 'node:path'

/** Ajustes publicados de la tienda (content/settings.json), para usarlos en correos. */
export type ShopSettings = {
  whatsappDisplay?: string
  email?: string
  instagram?: { handle?: string; url?: string }
  tiktok?: { handle?: string; url?: string }
  city?: string
  depositPercent?: number
  leadDaysReady?: string
  leadDaysCustom?: string
  readyShipDays?: string
}

let cache: ShopSettings | null = null

export function shopSettings(): ShopSettings {
  if (cache) return cache
  try {
    cache = JSON.parse(readFileSync(path.join(process.cwd(), 'content', 'settings.json'), 'utf8')) as ShopSettings
  } catch {
    cache = {}
  }
  return cache
}

/** Un valor está listo para mostrarse si no es un marcador pendiente como [usuario]. */
export const filled = (v: unknown) => typeof v === 'string' && v.trim() !== '' && !/\[.*\]/.test(v)
