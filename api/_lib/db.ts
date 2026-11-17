import { neon } from '@neondatabase/serverless'

/** Conexión a Neon por HTTP: ideal para funciones serverless con muchas visitas simultáneas. */
let client: ReturnType<typeof neon> | null = null

export function db() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('Falta conectar la base de datos (DATABASE_URL).')
  if (!client) client = neon(url)
  return client
}

export async function q<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await db().query(text, params)) as T[]
}

export const hasDb = () => !!process.env.DATABASE_URL
