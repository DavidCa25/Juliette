import * as Sentry from '@sentry/node'

/** Reporta errores del servidor a Sentry (solo si SENTRY_DSN está configurado). */
let ready = false

function init() {
  if (ready || !process.env.SENTRY_DSN) return ready
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? 'development',
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [] },
    tracesSampleRate: 0,
  })
  ready = true
  return ready
}

export async function reportServer(error: unknown, context: { route: string; [k: string]: unknown }) {
  if (!init()) {
    console.error(`[${context.route}]`, error)
    return
  }
  Sentry.withScope((scope) => {
    scope.setTag('route', context.route)
    scope.setExtras(context)
    Sentry.captureException(error)
  })
  // En funciones serverless hay que esperar el envío antes de terminar
  await Sentry.flush(1500).catch(() => false)
}
