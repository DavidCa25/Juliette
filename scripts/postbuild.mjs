// Después de compilar: genera sitemap.xml, robots.txt y una página HTML por ruta con su
// título, descripción, imagen para compartir y datos estructurados (Google, WhatsApp, Facebook).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const dist = join(root, 'dist')
const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL
const base = (process.env.VITE_SITE_URL || (prod ? `https://${prod}` : '')).replace(/\/$/, '')
const abs = (p) => (/^https?:\/\//.test(p) ? p : base ? base + p : p)
const today = new Date().toISOString().slice(0, 10)

const settings = JSON.parse(readFileSync(join(root, 'content/settings.json'), 'utf8'))
const products = readdirSync(join(root, 'content/products'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ slug: f.replace(/\.json$/, ''), ...JSON.parse(readFileSync(join(root, 'content/products', f), 'utf8')) }))
  .filter((p) => p.name)

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const clip = (s = '', n = 160) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s)
const firstImage = (p) => (Array.isArray(p.images) && p.images[0] ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].src) : '/media/og.jpg')

const DEFAULT_DESC = 'Piezas pintadas a mano y personalizadas: tote bags, prendas, cuadros y agendas. Ninguna es exactamente igual a otra.'
const pages = [
  { path: '/', title: 'Julietté · Romance hecho arte.', desc: DEFAULT_DESC, priority: '1.0' },
  { path: '/coleccion', title: 'Colección · Julietté', desc: 'Todas las piezas pintadas a mano por Julietté, listas para entregar o bajo pedido.', priority: '0.9' },
  { path: '/disena', title: 'Diseña la tuya · Julietté', desc: 'Crea tu propia pieza pintada a mano: elige la superficie, el motivo, la paleta y tus palabras, y recibe un boceto antes de pintarla.', priority: '0.9' },
  { path: '/envios', title: 'Envíos y entregas · Julietté', desc: `Envíos a ${settings.shippingZone} y entregas en ${settings.city}.`, priority: '0.5' },
  { path: '/preguntas-frecuentes', title: 'Preguntas frecuentes · Julietté', desc: 'Cómo funcionan los pedidos personalizados, tiempos, cuidados y pagos.', priority: '0.5' },
  { path: '/terminos', title: 'Términos y condiciones · Julietté', desc: 'Condiciones de compra y uso del sitio de Julietté.', priority: '0.3' },
  { path: '/reembolsos', title: 'Cambios y reembolsos · Julietté', desc: 'Política de cambios, cancelaciones y reembolsos.', priority: '0.3' },
  { path: '/privacidad', title: 'Aviso de privacidad · Julietté', desc: 'Cómo cuidamos tus datos personales.', priority: '0.3' },
  { path: '/cookies', title: 'Política de cookies · Julietté', desc: 'Qué cookies usamos y cómo cambiar tus preferencias.', priority: '0.3' },
  ...products.map((p) => ({
    path: `/producto/${p.slug}`,
    title: `${p.name} · Julietté`,
    desc: clip(p.description || p.short || DEFAULT_DESC),
    image: firstImage(p),
    priority: '0.8',
    product: p,
  })),
]

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Julietté',
  slogan: 'Romance hecho arte.',
  url: base || undefined,
  logo: abs('/media/isotipo_burdeos_md.png'),
  sameAs: [settings.instagram?.url, settings.tiktok?.url].filter((u) => u && !/\.com\/?$/.test(u)),
}

function productLd(p) {
  const availability = { disponible: 'InStock', 'bajo-pedido': 'PreOrder', agotado: 'OutOfStock' }[p.status] || 'InStock'
  const price = Number(p.price)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.code || undefined,
    description: p.description || p.short || undefined,
    image: (p.images || []).map((i) => abs(typeof i === 'string' ? i : i.src)),
    brand: { '@type': 'Brand', name: 'Julietté' },
    ...(Number.isFinite(price) && price > 0
      ? { offers: { '@type': 'Offer', price, priceCurrency: 'MXN', availability: `https://schema.org/${availability}`, url: abs(`/producto/${p.slug}`) } }
      : {}),
  }
}

const template = readFileSync(join(dist, 'index.html'), 'utf8')

function render(page) {
  const url = abs(page.path)
  const image = abs(page.image || '/media/og.jpg')
  const ld = [page.path === '/' ? organization : null, page.product ? productLd(page.product) : null].filter(Boolean)
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(page.desc)}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(page.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(page.desc)}" />`)
    .replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${esc(image)}" />`)
  const extra = [
    base ? `<link rel="canonical" href="${esc(url)}" />` : '',
    base ? `<meta property="og:url" content="${esc(url)}" />` : '',
    page.product ? '<meta property="og:type" content="product" />' : '',
    ...ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`),
  ]
    .filter(Boolean)
    .join('\n    ')
  return html.replace('</head>', `    ${extra}\n  </head>`)
}

for (const page of pages) {
  const file = page.path === '/' ? join(dist, 'index.html') : join(dist, `${page.path.slice(1)}.html`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, render(page))
}

const urls = pages
  .map((p) => `  <url><loc>${esc(abs(p.path))}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority></url>`)
  .join('\n')
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)

writeFileSync(
  join(dist, 'robots.txt'),
  ['User-agent: *', 'Allow: /', 'Disallow: /checkout', 'Disallow: /carrito', 'Disallow: /pedido/', 'Disallow: /admin', 'Disallow: /api/', '', base ? `Sitemap: ${base}/sitemap.xml` : '# Define VITE_SITE_URL para publicar la dirección del sitemap', ''].join('\n'),
)

if (!existsSync(join(dist, 'producto'))) mkdirSync(join(dist, 'producto'), { recursive: true })
console.log(`[postbuild] ${pages.length} páginas, sitemap y robots generados${base ? ` para ${base}` : ' (sin dominio: define VITE_SITE_URL)'}.`)
