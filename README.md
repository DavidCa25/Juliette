# Julietté · Sitio web

Tienda de Julietté hecha con **React 18 + Vite + Tailwind CSS 4**. Es un sitio estático: no necesita servidor propio, así que se sirve desde una CDN y aguanta picos de tráfico de campañas (20,000+ visitas simultáneas) sin cambios.

## Empezar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera /dist listo para publicar
npm run preview    # prueba local de la versión final
```

## Configurar la tienda

1. Copia `.env.example` como `.env` y completa el WhatsApp, el correo y, si quieres, los servicios opcionales.
2. Edita `src/config/site.ts`: ciudad, zona de envío, anticipo, días de elaboración y datos legales (todo lo que está entre `[CORCHETES]`).
3. Edita `src/data/products.ts` para precios, medidas y nuevos modelos. Un precio en `null` se muestra como `[PRECIO]` y el pedido se confirma por WhatsApp.
4. Si tienes la licencia de **The Seasons**, coloca `TheSeasons-Light.woff2` y `TheSeasons-LightItalic.woff2` en `public/fonts/`. Mientras tanto se usa Cormorant Garamond.

## Qué incluye

| Ruta | Qué es |
|---|---|
| `/` | Inicio: portada, colección, videos, personaliza, proceso, manifiesto, superficies y cuidados |
| `/coleccion` | Todas las piezas |
| `/producto/:slug` | Ficha con galería, video, personalización y carrito |
| `/disena` | Experiencia "Diseña la tuya": motivo, paleta, texto, detalles y vista previa en vivo |
| `/carrito`, `/checkout`, `/pedido/confirmado` | Compra completa con validación y envío del pedido por WhatsApp |
| `/terminos`, `/reembolsos`, `/privacidad`, `/cookies` | Textos legales base (revisarlos con asesoría legal) |
| `/envios`, `/preguntas-frecuentes` | Información para clientes |

Además: aviso y panel de cookies (la analítica solo se carga con consentimiento), carrito guardado en el navegador y sincronizado entre pestañas, 404 propio, `robots.txt`, `sitemap.xml`, imagen para compartir en redes y favicon.

## Cómo funcionan los pedidos

- El checkout no cobra: arma el pedido, lo guarda y lleva a WhatsApp con el resumen prellenado.
- Si defines `VITE_ORDER_WEBHOOK` (Formspree, Make, Zapier, Google Sheets…), cada pedido también llega ahí en JSON.
- Si defines `VITE_PAYMENT_LINK` (Mercado Pago, Stripe Payment Link…), aparece en la confirmación.
- Para un cobro automático dentro del sitio se puede integrar más adelante Stripe Checkout o Mercado Pago con una función serverless.

## Publicar (recomendado: Vercel o Netlify)

- **Vercel:** importa la carpeta `web` y despliega. `vercel.json` ya trae las rutas y la caché.
- **Netlify:** importa la carpeta y despliega. `netlify.toml` ya trae las rutas y la caché.
- Agrega las variables de `.env` en el panel del proveedor.

## Rendimiento y escala

- Archivos estáticos servidos desde CDN, con caché larga e inmutable para `/assets`.
- Las páginas secundarias se cargan solo cuando se visitan (división de código).
- Los videos solo se reproducen cuando están en pantalla, cargan solo sus metadatos al inicio y tienen imagen de portada.
- Imágenes en WebP con carga diferida.
- Animaciones con CSS y respeto a `prefers-reduced-motion`.
- Para ahorrar ancho de banda en campañas muy grandes, conviene mover los videos a un servicio de video (Cloudflare Stream, Mux o Bunny) o comprimirlos más.
