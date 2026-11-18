import { toNodeHandler } from 'better-auth/node'
import { auth } from './_lib/auth.js'

// Better Auth lee el cuerpo de la petición por su cuenta.
export const config = { api: { bodyParser: false } }

export default toNodeHandler(auth)
