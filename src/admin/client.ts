import { createAuthClient } from 'better-auth/react'

/** Cliente de Better Auth (mismo dominio que el sitio). */
export const authClient = createAuthClient()

export type AdminImage = { src: string; alt: string }
export type AdminProduct = {
  slug: string
  name: string
  code: string
  category: string
  collection: string
  price: number | null
  status: string
  featured: boolean
  order: number
  personalizable: boolean
  short: string
  description: string
  dimensions: string
  material: string
  technique: string
  images: AdminImage[]
  video: string | null
}
export type AdminVideo = { title: string; tag: string; video: string; poster?: string }
export type AdminSettings = Record<string, unknown> & { videos?: AdminVideo[] }
export type AdminContent = { settings: AdminSettings; products: AdminProduct[] }

export type Me =
  | { signedIn: false }
  | { signedIn: true; isAdmin: boolean; user: { name: string; email: string; image: string | null }; storage: { files: boolean; github: boolean; db: boolean } }

export type OrderItem = { kind: 'product' | 'custom'; name: string; qty: number; unitPrice: number | null; optionLabel?: string; idea?: string | null; design?: Record<string, unknown> | null }
export type Order = {
  id: string
  created_at: string
  updated_at: string
  status: string
  payment_status: string
  customer_name: string
  phone: string
  email: string
  delivery: string
  address: { street?: string; city?: string; zip?: string; references?: string } | null
  payment: string
  gift: string | null
  items: OrderItem[]
  subtotal: number | null
  total: number | null
  source: Record<string, string> | null
  notes: string | null
}
export type Stats = {
  days: number
  totals: { visitors: number; sessions: number; views: number }
  daily: { day: string; visitors: number; views: number }[]
  funnel: { type: string; sessions: number }[]
  products: { slug: string; views: number; adds: number }[]
  sources: { source: string; sessions: number }[]
  devices: { device: string; sessions: number }[]
  orders: { orders: number; revenue: number | null; pending: number }
  customers: { name: string; email: string; phone: string; orders: number; spent: number | null; last: string }[]
}

async function json<T>(r: Response): Promise<T> {
  if (!(r.headers.get('content-type') ?? '').includes('json')) throw new Error('El servidor del panel no está disponible aquí. Usa el sitio publicado en Vercel o “vercel dev”.')
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error((data as { error?: string }).error || `Error ${r.status}`)
  return data as T
}

export const api = {
  me: () => fetch('/api/admin/me', { credentials: 'include' }).then((r) => json<Me>(r)),
  content: () => fetch('/api/admin/content', { credentials: 'include' }).then((r) => json<AdminContent>(r)),
  publish: (c: AdminContent) =>
    fetch('/api/admin/content', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) }).then((r) =>
      json<{ ok: boolean; changed: boolean; sha: string }>(r),
    ),
  stats: (days: number) => fetch(`/api/admin/stats?days=${days}`, { credentials: 'include' }).then((r) => json<Stats>(r)),
  orders: (params: { status?: string; q?: string }) => {
    const s = new URLSearchParams()
    if (params.status) s.set('status', params.status)
    if (params.q) s.set('q', params.q)
    return fetch(`/api/admin/orders?${s}`, { credentials: 'include' }).then((r) => json<{ orders: Order[]; counts: { status: string; n: number }[] }>(r))
  },
  updateOrder: (id: string, patch: { status?: string; payment_status?: string; notes?: string; notify?: boolean }) =>
    fetch('/api/admin/orders', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...patch }) }).then((r) =>
      json<{ order: Partial<Order>; emailed?: boolean }>(r),
    ),
}

export function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Reduce y convierte a WebP las fotos antes de subirlas (el sitio carga más rápido). */
async function optimizeImage(file: File, max = 1800): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file
  const k = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * k)
  canvas.height = Math.round(bitmap.height * k)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.86))
  return blob && blob.size < file.size ? blob : file
}

/** Sube un archivo directo a Cloudflare R2 con una URL firmada por el servidor. */
export async function uploadFile(file: File, folder: 'productos' | 'videos' | 'ajustes', onProgress?: (pct: number) => void) {
  const isImage = file.type.startsWith('image/')
  const body = isImage ? await optimizeImage(file) : file
  const type = isImage && body !== file ? 'image/webp' : file.type
  const sign = await fetch('/api/admin/upload', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: file.name, type, size: body.size, folder }),
  }).then((r) => json<{ uploadUrl: string; publicUrl: string; contentType: string }>(r))

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sign.uploadUrl)
    xhr.setRequestHeader('Content-Type', sign.contentType)
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100))
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`La subida falló (${xhr.status}).`)))
    xhr.onerror = () => reject(new Error('No se pudo conectar con el almacenamiento. Revisa la configuración CORS de R2.'))
    xhr.send(body)
  })
  return sign.publicUrl
}
