/**
 * Monitoreo de errores con Sentry. Solo se activa si VITE_SENTRY_DSN está configurado.
 * No envía datos personales: sin IP, sin correos, sin grabación de pantalla.
 */
import * as Sentry from '@sentry/react'
import { useEffect } from 'react'
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom'

const dsn = import.meta.env.VITE_SENTRY_DSN
export const monitoringOn = !!dsn

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/g

export function initMonitoring() {
  if (!dsn) return
  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENV || import.meta.env.MODE,
    release: import.meta.env.VITE_RELEASE || undefined,
    dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [] },
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({ useEffect, useLocation, useNavigationType, createRoutesFromChildren, matchRoutes }),
    ],
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      /AbortError/,
    ],
    denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i, /googletagmanager\.com/i, /connect\.facebook\.net/i],
    beforeSend(event) {
      if (event.user) delete event.user.ip_address
      if (event.request?.url) event.request.url = event.request.url.replace(EMAIL, '[correo]')
      if (event.message) event.message = event.message.replace(EMAIL, '[correo]')
      return event
    },
    beforeBreadcrumb(b) {
      // No registra lo que se escribe en formularios
      if (b.category === 'ui.input') return null
      return b
    },
  })
}

export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (!dsn) return
  Sentry.captureException(error, context ? { extra: context } : undefined)
}

export const wrapRouter = Sentry.wrapCreateBrowserRouterV6
