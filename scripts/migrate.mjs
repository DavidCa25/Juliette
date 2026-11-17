// Aplica db/schema.sql en Neon antes de compilar. Si no hay DATABASE_URL, no hace nada.
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.log('[migrate] Sin DATABASE_URL: se omite la base de datos.')
  process.exit(0)
}

const sql = neon(url)
const statements = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8')
  .split(/;\s*$/m)
  .map((s) => s.replace(/--.*$/gm, '').trim())
  .filter(Boolean)

for (const s of statements) await sql.query(s)
console.log(`[migrate] Esquema aplicado (${statements.length} sentencias).`)
