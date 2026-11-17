import { betterAuth } from 'better-auth'
import { fromNodeHeaders } from 'better-auth/node'
import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Autenticación del panel con Google (Better Auth).
 * Funciona sin base de datos: la sesión viaja cifrada (JWE) en una cookie segura.
 * Solo los correos de ADMIN_EMAILS pueden usar las funciones del panel.
 */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: 'select_account',
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: { enabled: true, maxAge: 60 * 60 * 24 * 7, strategy: 'jwe', refreshCache: true },
  },
  account: { storeStateStrategy: 'cookie', storeAccountCookie: true },
  advanced: { useSecureCookies: process.env.NODE_ENV === 'production' },
})

export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdmin(email?: string | null) {
  return !!email && adminEmails().includes(email.toLowerCase())
}

export async function getSession(req: VercelRequest) {
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
}

/** Devuelve la sesión si es admin; si no, responde 401/403 y devuelve null. */
export async function requireAdmin(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req).catch(() => null)
  if (!session) {
    res.status(401).json({ error: 'Inicia sesión para continuar.' })
    return null
  }
  if (!isAdmin(session.user.email)) {
    res.status(403).json({ error: 'Esta cuenta no tiene acceso al panel.' })
    return null
  }
  return session
}
