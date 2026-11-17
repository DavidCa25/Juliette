import type { VercelRequest, VercelResponse } from '@vercel/node'
import { AwsClient } from 'aws4fetch'
import crypto from 'node:crypto'
import { requireAdmin } from '../_lib/auth.js'

/**
 * Firma una subida directa a Cloudflare R2 (sin pasar el archivo por Vercel).
 * Devuelve la URL firmada para subir (PUT, válida 10 minutos) y la URL pública final.
 */
const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
}
const FOLDERS = ['productos', 'videos', 'ajustes']
const MAX = 60 * 1024 * 1024

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido.' })
  }
  const session = await requireAdmin(req, res)
  if (!session) return

  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_URL) {
    return res.status(500).json({ error: 'Falta configurar Cloudflare R2 en Vercel.' })
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as { name?: string; type?: string; size?: number; folder?: string }
  const ext = TYPES[body?.type ?? '']
  if (!ext) return res.status(400).json({ error: 'Formato no permitido. Usa JPG, PNG, WEBP, AVIF, MP4 o WEBM.' })
  if (!body.size || body.size > MAX) return res.status(400).json({ error: 'El archivo pesa más de 60 MB.' })
  const folder = FOLDERS.includes(body.folder ?? '') ? body.folder! : 'productos'
  const base =
    (body.name ?? 'archivo')
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'archivo'
  const key = `${folder}/${base}-${crypto.randomBytes(5).toString('hex')}.${ext}`

  const client = new AwsClient({ accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, service: 's3', region: 'auto' })
  const target = new URL(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`)
  target.searchParams.set('X-Amz-Expires', '600')
  const signed = await client.sign(new Request(target, { method: 'PUT', headers: { 'Content-Type': body.type! } }), { aws: { signQuery: true } })

  return res.status(200).json({
    uploadUrl: signed.url,
    contentType: body.type,
    publicUrl: `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`,
  })
}
