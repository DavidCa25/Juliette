import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// Si hay credenciales de Sentry, se suben los mapas de código para ver errores legibles
// y luego se borran del sitio publicado (nadie más puede ver el código fuente).
const sentry = !!(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT)
const release = process.env.VERCEL_GIT_COMMIT_SHA

export default defineConfig({
  define: release ? { 'import.meta.env.VITE_RELEASE': JSON.stringify(release) } : {},
  plugins: [
    react(),
    tailwindcss(),
    ...(sentry
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            release: release ? { name: release } : undefined,
            sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
            telemetry: false,
          }),
        ]
      : []),
  ],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: sentry ? 'hidden' : false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
