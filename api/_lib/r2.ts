import { AwsClient } from 'aws4fetch'

/** Sube un archivo a Cloudflare R2 desde el servidor. Devuelve la URL pública o null si R2 no está configurado. */
export async function putObject(key: string, body: Uint8Array, type: string): Promise<string | null> {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_URL) return null
  const client = new AwsClient({ accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, service: 's3', region: 'auto' })
  const r = await client.fetch(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' },
    body: new Uint8Array(body),
  })
  if (!r.ok) throw new Error(`R2 respondió ${r.status} al subir ${key}`)
  return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`
}

/** Convierte un data URL de imagen (JPG, PNG o WEBP) en bytes, con un límite de tamaño. */
export function decodeImage(dataUrl: unknown, maxBytes = 900_000): { bytes: Uint8Array; type: string; ext: string } | null {
  if (typeof dataUrl !== 'string') return null
  const m = /^data:(image\/(jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl)
  if (!m) return null
  const bytes = Buffer.from(m[3], 'base64')
  if (bytes.length === 0 || bytes.length > maxBytes) return null
  return { bytes: new Uint8Array(bytes), type: m[1], ext: m[2] === 'jpeg' ? 'jpg' : m[2] }
}
