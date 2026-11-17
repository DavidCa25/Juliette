import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, isAdmin } from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  const session = await getSession(req).catch(() => null)
  if (!session) return res.status(200).json({ signedIn: false })
  return res.status(200).json({
    signedIn: true,
    isAdmin: isAdmin(session.user.email),
    user: { name: session.user.name, email: session.user.email, image: session.user.image ?? null },
    storage: {
      files: !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET && process.env.R2_PUBLIC_URL),
      github: !!process.env.GITHUB_TOKEN,
      db: !!process.env.DATABASE_URL,
    },
  })
}
