# Julietté · Sitio web

Tienda de Julietté hecha con **React 18 + Vite + Tailwind CSS 4**. La tienda es un sitio estático servido desde la CDN de Vercel, así que aguanta picos de campañas (20,000+ visitas simultáneas) sin cambios. Solo el panel `/admin` usa funciones del servidor, y la tienda pública nunca depende de ellas.

## Empezar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera /dist listo para publicar
npm run preview    # prueba local de la versión final
```

## Panel de administración (`/admin`)

La dueña entra con su **cuenta de Google** y puede agregar, editar o quitar productos, subir fotos y videos, y cambiar los ajustes de la tienda (redes, ciudad, envíos, plazos, legales y videos del inicio). Los cambios se guardan como borrador en su navegador y, al pulsar **Publicar cambios**, se publican todos juntos: el panel los guarda en el repositorio y Vercel actualiza el sitio en uno o dos minutos. Ella no necesita cuenta de GitHub.

**Cómo funciona por dentro**

| Pieza | Qué hace |
|---|---|
| Better Auth + Google (`api/better-auth.ts`) | Inicio de sesión. Sin base de datos: la sesión viaja cifrada (JWE) en una cookie segura de 7 días. |
| Lista de correos (`ADMIN_EMAILS`) | Solo esos correos pueden usar el panel. Cualquier otra cuenta ve "sin acceso". |
| `api/admin/content.ts` | Lee el contenido actual y publica todos los cambios en **un solo commit**, con un token del servidor. |
| `api/admin/upload.ts` + Cloudflare R2 | Las fotos (convertidas a WebP antes de subir) y los videos van directo del navegador a R2 con una URL firmada de 10 minutos. El servidor solo firma si es admin. R2 no cobra transferencia. |
| Neon (Postgres) | Guarda los **pedidos** (`api/orders.ts`) y las **estadísticas** (`api/track.ts`). El esquema (`db/schema.sql`) se aplica solo en cada despliegue. |
| `api/admin/orders.ts`, `api/admin/stats.ts` | Pestañas *Pedidos* (estado, pago, notas, contacto directo) y *Resumen* (visitas, recorrido de compra, piezas más vistas, origen del tráfico, dispositivos y clientes). |

**Configuración inicial (una sola vez)**

1. **Google:** en [Google Cloud Console](https://console.cloud.google.com/apis/credentials) crea un proyecto, configura la *pantalla de consentimiento* (tipo externo) y crea un *ID de cliente OAuth* de tipo **Aplicación web** con:
   - Orígenes autorizados: `https://tu-dominio`
   - URI de redireccionamiento: `https://tu-dominio/api/auth/callback/google`
2. **GitHub (solo tú, una vez):** crea un *fine-grained personal access token* en *Settings › Developer settings › Personal access tokens*, con acceso solo al repo `DavidCa25/Juliette` y permiso **Contents: Read and write**.
3. **Neon:** en tu proyecto de Vercel ve a *Storage › Create Database › Neon* (plan gratis) y conéctalo. Esto agrega `DATABASE_URL` automáticamente; las tablas se crean solas en el siguiente despliegue.
4. **Cloudflare R2:**
   - En Cloudflare › R2 crea un bucket (p. ej. `juliette-media`).
   - En *Settings* del bucket activa el acceso público (*r2.dev*) o conecta un dominio propio como `media.tudominio.com`; esa dirección es `R2_PUBLIC_URL`.
   - En *Settings › CORS policy* pega:
     ```json
     [{ "AllowedOrigins": ["https://tu-dominio"], "AllowedMethods": ["PUT", "GET"], "AllowedHeaders": ["Content-Type"], "MaxAgeSeconds": 3600 }]
     ```
   - En *R2 › Manage API tokens* crea un token con permiso **Object Read & Write** solo para ese bucket. Te da `R2_ACCESS_KEY_ID` y `R2_SECRET_ACCESS_KEY`; `R2_ACCOUNT_ID` aparece en la misma página.
5. **Variables en Vercel** (*Settings › Environment Variables*, entorno Production):

   | Variable | Valor |
   |---|---|
   | `BETTER_AUTH_SECRET` | Texto aleatorio de 32+ caracteres (`openssl rand -base64 32`) |
   | `BETTER_AUTH_URL` | `https://tu-dominio` |
   | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Los del paso 1 |
   | `ADMIN_EMAILS` | Correos con acceso, separados por coma (ej. `julietteaa2709@gmail.com`) |
   | `GITHUB_TOKEN` | El token del paso 2 |
   | `GITHUB_REPO` | `DavidCa25/Juliette` (opcional, ya es el valor por defecto) |
   | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` | Los del paso 4 |
   | `DATABASE_URL` | Lo agrega Neon en el paso 3 |

6. Vuelve a desplegar y entra a `https://tu-dominio/admin`.

**Estadísticas y privacidad:** la analítica propia solo registra a quienes aceptan las cookies de analítica; guarda un identificador aleatorio, páginas, piezas vistas, origen (referencia y `utm_*`), país y tipo de dispositivo, nunca nombres ni correos. Los eventos se envían en lotes para aguantar campañas grandes. Usa enlaces con `?utm_source=instagram&utm_campaign=navidad` en tus anuncios para ver qué campaña trae más visitas y pedidos.

**Pedidos:** cada pedido del checkout se guarda en Neon con precios recalculados en el servidor (no se confía en el navegador) y luego continúa por WhatsApp. Más adelante, el pago en línea (Mercado Pago o Stripe) puede marcar el pedido como pagado en la misma tabla.

## Errores y correos

**Sentry (monitoreo de errores)**
- El sitio y las funciones del servidor reportan cualquier error a Sentry, con la página, el navegador y la versión publicada (el commit). No envía IP, correos, cookies ni lo que se escribe en los formularios.
- La pantalla de error del sitio reporta sola cada falla.
1. Crea una cuenta en [sentry.io](https://sentry.io) (plan gratis: 5,000 errores al mes) y un proyecto **React**.
2. Copia el DSN (*Settings › Client Keys*) en `VITE_SENTRY_DSN` y en `SENTRY_DSN` en Vercel.
3. (Recomendado) Para ver el código legible en cada error, crea un *Auth Token* en *Settings › Auth Tokens* y agrega `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` y `SENTRY_PROJECT`. Los mapas de código se suben a Sentry y se borran del sitio publicado.
4. En Sentry › Alerts activa el aviso por correo de errores nuevos.

**Resend (correos de pedidos)**
- Cada pedido envía dos correos: **a la dueña** con el detalle y un botón al panel, y **al cliente** con su número de pedido y próximos pasos.
- Al cambiar el estado de un pedido en el panel (confirmado, en proceso, enviado, entregado o cancelado), se avisa al cliente por correo. Se puede desactivar con la casilla en cada pedido.
- Si el correo falla, el pedido igual queda registrado y el error llega a Sentry.
1. Crea una cuenta en [resend.com](https://resend.com) (plan gratis: 3,000 correos al mes, 100 al día).
2. En *Domains* agrega tu dominio y copia los registros DNS que te indica. Sin dominio verificado, Resend solo deja enviar al correo de tu propia cuenta, así que los clientes no recibirían nada.
3. Crea una *API Key* y agrega en Vercel `RESEND_API_KEY`, `EMAIL_FROM` (p. ej. `Julietté <pedidos@tudominio.com>`) y, si quieres otro destinatario que `ADMIN_EMAILS`, `ORDER_NOTIFY_EMAIL`.

**Newsletter (boletines)**
- El formulario del pie de página guarda cada correo en Neon (con fecha de consentimiento), lo agrega a los contactos de Resend y le manda un correo de bienvenida.
- En **/admin › Boletín** la dueña ve sus suscriptores, los descarga en Excel (CSV) y arma boletines con 3 plantillas (lanzamiento, promoción, aviso de temporada): asunto, título, texto, imagen y botón, con vista previa. Puede enviarse una prueba y luego enviarlo a todos.
- Cada boletín incluye el enlace de baja de Resend.
1. En Resend › **API Keys** crea una clave con permiso **Full access** y guárdala en Vercel como `RESEND_MARKETING_KEY` (Secret).
2. En Resend › **Audience › Segments** crea un segmento (p. ej. "Suscriptores") y copia su id en `RESEND_SEGMENT_ID` (Config).
3. Plan gratis de marketing: hasta 1,000 contactos.

**Costos:** Neon (plan gratis), Cloudflare R2 (10 GB gratis al mes y sin cobro por transferencia), Better Auth y Google son gratuitos para este uso. Para un sitio comercial, Vercel pide el plan Pro.

**Probar el panel en tu computadora:** el panel usa funciones del servidor, así que no corre con `npm run dev`. Usa `npx vercel dev` con un archivo `.env.local` que tenga las mismas variables (en Google agrega también `http://localhost:3000/api/auth/callback/google` y pon `BETTER_AUTH_URL=http://localhost:3000`).

Los productos viven en `content/products/*.json` y los ajustes en `content/settings.json`; también se pueden editar a mano si hace falta.

## Configurar la tienda

1. Copia `.env.example` como `.env` y completa el WhatsApp, el correo y, si quieres, los servicios opcionales.
2. Desde `/admin` (o editando `content/settings.json`): ciudad, zona de envío, anticipo, días de elaboración y datos legales (todo lo que está entre `[CORCHETES]`).
3. Desde `/admin` (o en `content/products/`): precios, medidas y nuevos modelos. Un precio vacío se muestra como `[PRECIO]` y el pedido se confirma por WhatsApp.
4. Si tienes la licencia de **The Seasons**, coloca `TheSeasons-Light.woff2` y `TheSeasons-LightItalic.woff2` en `public/fonts/`. Mientras tanto se usa Cormorant Garamond.

## Qué incluye

| Ruta | Qué es |
|---|---|
| `/` | Inicio: portada, colección, videos, personaliza, proceso, manifiesto, superficies y cuidados |
| `/coleccion` | Todas las piezas |
| `/producto/:slug` | Ficha con galería, video, personalización y carrito |
| `/design` | Experiencia "Diseña la tuya": motivo, paleta, texto, detalles y vista previa en vivo |
| `/carrito`, `/checkout`, `/pedido/confirmado` | Compra completa con validación y envío del pedido por WhatsApp |
| `/terminos`, `/reembolsos`, `/privacidad`, `/cookies` | Textos legales base (revisarlos con asesoría legal) |
| `/envios`, `/preguntas-frecuentes` | Información para clientes |

Además: aviso y panel de cookies (la analítica solo se carga con consentimiento), carrito guardado en el navegador y sincronizado entre pestañas, 404 propio, `robots.txt`, `sitemap.xml`, imagen para compartir en redes y favicon.

## Cómo funcionan los pedidos

- El checkout no cobra: arma el pedido, lo guarda y lleva a WhatsApp con el resumen prellenado.
- Si defines `VITE_ORDER_WEBHOOK` (Formspree, Make, Zapier, Google Sheets…), cada pedido también llega ahí en JSON.
- Si defines `VITE_PAYMENT_LINK` (Mercado Pago, Stripe Payment Link…), aparece en la confirmación.
- Para un cobro automático dentro del sitio se puede integrar más adelante Stripe Checkout o Mercado Pago con una función serverless.

## Publicar en Vercel

- Importa el repositorio en Vercel. `vercel.json` ya trae las rutas, la caché y las funciones de `/api`.
- Cada push a `main` se publica solo, incluido lo que se publica desde `/admin`.
- Agrega las variables de `.env.example` en *Settings › Environment Variables*.

## Rendimiento y escala

- Archivos estáticos servidos desde CDN, con caché larga e inmutable para `/assets`.
- Las páginas secundarias se cargan solo cuando se visitan (división de código).
- Los videos solo se reproducen cuando están en pantalla, cargan solo sus metadatos al inicio y tienen imagen de portada.
- Imágenes en WebP con carga diferida.
- Animaciones con CSS y respeto a `prefers-reduced-motion`.
- Para ahorrar ancho de banda en campañas muy grandes, conviene mover los videos a un servicio de video (Cloudflare Stream, Mux o Bunny) o comprimirlos más.
