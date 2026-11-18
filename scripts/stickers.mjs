// Genera los stickers del estudio de pintura a partir de Fluent Emoji High Contrast (MIT, Microsoft).
// Cada categoría queda en su propio JSON para que el sitio la descargue solo cuando el cliente la abre.
// Uso: node scripts/stickers.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

import { custom } from './custom-stickers.mjs'

const require = createRequire(import.meta.url)
const set = require('@iconify-json/fluent-emoji-high-contrast/icons.json')

const categories = [
  { id: 'navidad', name: 'Navidad y Año Nuevo', icons: { 'christmas-tree': 'Árbol de Navidad', 'santa-claus': 'Santa', 'mrs-claus': 'Señora Claus', snowman: 'Muñeco de nieve', 'snowman-without-snow': 'Muñeco', deer: 'Reno', 'wrapped-gift': 'Regalo', bell: 'Campana', candle: 'Vela', snowflake: 'Copo de nieve', 'hot-beverage': 'Chocolate caliente', cookie: 'Galleta', 'glass-of-milk': 'Leche para Santa', sled: 'Trineo', 'ice-skate': 'Patines de hielo', scarf: 'Bufanda', gloves: 'Guantes', socks: 'Calcetines', coat: 'Abrigo', 'baby-angel': 'Angelito', 'star': 'Estrella', 'clinking-glasses': 'Brindis', 'bottle-with-popping-cork': 'Champaña', grapes: 'Las 12 uvas', 'party-popper': 'Año Nuevo', 'confetti-ball': 'Confeti', 'hourglass-done': 'Cuenta regresiva', 'teddy-bear': 'Osito de regalo', 'ribbon': 'Moño' } },
  { id: 'mexico', name: 'México', icons: { skull: 'Calavera', 'hot-pepper': 'Chile', 'ear-of-corn': 'Maíz', taco: 'Taco', burrito: 'Burrito', tamale: 'Tamal', avocado: 'Aguacate', cactus: 'Cactus', guitar: 'Guitarra', candle: 'Veladora', 'sun-with-face': 'Sol', 'hibiscus': 'Flor', 'eagle': 'Águila' } },
  { id: 'cuentos', name: 'Cuentos clásicos', icons: { castle: 'Castillo', crown: 'Corona', 'woman-merpeople': 'Sirena', 'woman-fairy': 'Hada', 'person-genie': 'Genio', 'person-mage': 'Mago', 'person-elf': 'Duende', 'red-apple': 'Manzana', teapot: 'Tetera', 'mantelpiece-clock': 'Reloj', rabbit: 'Conejo blanco', wolf: 'Lobo', 'heart-suit': 'Corazones', 'spade-suit': 'Picas', 'diamond-suit': 'Diamantes', 'club-suit': 'Tréboles', 'magic-wand': 'Varita mágica', mirror: 'Espejo', frog: 'Príncipe rana', swan: 'Cisne', 'high-heeled-shoe': 'Zapatilla', 'crossed-swords': 'Espadas', horse: 'Caballo', basket: 'Canasta', dragon: 'Dragón', 'old-key': 'Llave mágica', 'shield': 'Escudo' } },
  { id: 'arte-clasico', name: 'Arte clásico', icons: { sunflower: 'Girasoles', 'artist-palette': 'Paleta', 'classical-building': 'Templo', lotus: 'Loto', 'spiral-shell': 'Caracola', 'crescent-moon': 'Luna', paintbrush: 'Pincel' } },
  { id: 'retro', name: 'Retro 80s', icons: { videocassette: 'VHS', 'optical-disk': 'CD', 'floppy-disk': 'Disquete', radio: 'Radio', television: 'Tele', joystick: 'Joystick', 'video-game': 'Control', bicycle: 'Bicicleta', 'roller-skate': 'Patines', skateboard: 'Patineta', telephone: 'Teléfono', pager: 'Bíper', 'mirror-ball': 'Bola disco', flashlight: 'Linterna', 'satellite-antenna': 'Antena', popcorn: 'Palomitas', hamburger: 'Hamburguesa', 'french-fries': 'Papas', 'sunglasses': 'Lentes', 'lollipop': 'Paleta', 'camera-with-flash': 'Cámara' } },
  { id: 'cottagecore', name: 'Cottagecore', icons: { basket: 'Canasta', bread: 'Pan', teapot: 'Tetera', 'cheese-wedge': 'Queso', 'sheaf-of-rice': 'Trigo', candle: 'Vela', 'red-apple': 'Manzana', pear: 'Pera', blueberries: 'Moras', grapes: 'Uvas', thread: 'Hilo', yarn: 'Estambre', 'sewing-needle': 'Aguja', 'house-with-garden': 'Casita', hut: 'Cabaña', chicken: 'Gallina', ewe: 'Oveja', cow: 'Vaca', 'deciduous-tree': 'Árbol', wood: 'Leña', mushroom: 'Hongo', snail: 'Caracol', bouquet: 'Ramo', herb: 'Hierbas', 'honey-pot': 'Miel', butter: 'Mantequilla', 'lady-beetle': 'Catarina' } },
  { id: 'celestial', name: 'Celestial y tarot', icons: { 'crystal-ball': 'Bola de cristal', 'dotted-six-pointed-star': 'Estrella mística', 'eight-pointed-star': 'Estrella de 8 puntas', 'first-quarter-moon-face': 'Luna con cara', 'sun-with-face': 'Sol con cara', hamsa: 'Hamsa', 'nazar-amulet': 'Ojo turco', candle: 'Vela', 'magic-wand': 'Varita' } },
  { id: 'espacio', name: 'Galaxia y espacio', icons: { 'milky-way': 'Vía Láctea', 'ringed-planet': 'Planeta', 'crescent-moon': 'Luna', 'full-moon': 'Luna llena', 'waxing-crescent-moon': 'Luna creciente', 'first-quarter-moon': 'Cuarto creciente', 'shooting-star': 'Estrella fugaz', comet: 'Cometa', 'glowing-star': 'Estrella brillante', star: 'Estrella', sparkles: 'Destellos', 'night-with-stars': 'Noche estrellada', rocket: 'Cohete', 'flying-saucer': 'Platillo volador', alien: 'Alien', astronaut: 'Astronauta', telescope: 'Telescopio', 'globe-showing-americas': 'Planeta Tierra', sun: 'Sol', 'star-and-crescent': 'Luna y estrella' } },
  { id: 'dinosaurios', name: 'Dinosaurios y criaturas', icons: { 't-rex': 'T-Rex', sauropod: 'Braquiosaurio', dragon: 'Dragón', 'dragon-face': 'Cara de dragón', unicorn: 'Unicornio', crocodile: 'Cocodrilo', lizard: 'Lagartija', turtle: 'Tortuga', snake: 'Serpiente', 'hatching-chick': 'Huevo', volcano: 'Volcán', 'palm-tree': 'Palmera', mammoth: 'Mamut', bone: 'Hueso', footprints: 'Huellas', 'evergreen-tree': 'Pino' } },
  { id: 'animales', name: 'Animales', icons: { cat: 'Gato', 'black-cat': 'Gato negro', dog: 'Perro', rabbit: 'Conejo', fox: 'Zorro', bear: 'Oso', 'teddy-bear': 'Osito', panda: 'Panda', koala: 'Koala', owl: 'Búho', penguin: 'Pingüino', frog: 'Rana', hedgehog: 'Erizo', sloth: 'Perezoso', lion: 'León', horse: 'Caballo', deer: 'Venado', swan: 'Cisne', flamingo: 'Flamenco', peacock: 'Pavo real', parrot: 'Loro', dove: 'Paloma', bird: 'Pájaro', 'paw-prints': 'Patitas' } },
  { id: 'bichos', name: 'Mariposas y bichitos', icons: { butterfly: 'Mariposa', honeybee: 'Abeja', 'lady-beetle': 'Catarina', snail: 'Caracol', beetle: 'Escarabajo', bug: 'Oruga', spider: 'Araña', 'spider-web': 'Telaraña', ant: 'Hormiga', cricket: 'Grillo', worm: 'Gusanito', fly: 'Mosca' } },
  { id: 'mar', name: 'Mar', icons: { whale: 'Ballena', 'spouting-whale': 'Ballena soplando', dolphin: 'Delfín', 'tropical-fish': 'Pez tropical', fish: 'Pez', blowfish: 'Pez globo', octopus: 'Pulpo', jellyfish: 'Medusa', crab: 'Cangrejo', lobster: 'Langosta', shrimp: 'Camarón', squid: 'Calamar', shark: 'Tiburón', seal: 'Foca', 'spiral-shell': 'Caracola', coral: 'Coral', 'water-wave': 'Ola', anchor: 'Ancla' } },
  { id: 'flores', name: 'Flores y plantas', icons: { rose: 'Rosa', tulip: 'Tulipán', sunflower: 'Girasol', hibiscus: 'Hibisco', blossom: 'Flor', 'cherry-blossom': 'Flor de cerezo', 'white-flower': 'Flor blanca', bouquet: 'Ramo', lotus: 'Loto', 'four-leaf-clover': 'Trébol', 'maple-leaf': 'Hoja de maple', 'fallen-leaf': 'Hoja seca', herb: 'Hierba', seedling: 'Brote', 'potted-plant': 'Planta', cactus: 'Cactus', mushroom: 'Hongo', 'leaf-fluttering-in-wind': 'Hojas al viento' } },
  { id: 'dulce', name: 'Comida y postres', icons: { cherries: 'Cerezas', strawberry: 'Fresa', peach: 'Durazno', lemon: 'Limón', watermelon: 'Sandía', avocado: 'Aguacate', cupcake: 'Cupcake', shortcake: 'Pastel', 'birthday-cake': 'Pastel de cumpleaños', 'ice-cream': 'Helado', 'soft-ice-cream': 'Nieve', doughnut: 'Dona', cookie: 'Galleta', lollipop: 'Paleta', candy: 'Dulce', croissant: 'Cuernito', 'bubble-tea': 'Té de burbujas', 'hot-beverage': 'Café', 'honey-pot': 'Miel', pizza: 'Pizza', taco: 'Taco' } },
  { id: 'amor', name: 'Amor', icons: { 'red-heart': 'Corazón', 'sparkling-heart': 'Corazón brillante', 'two-hearts': 'Dos corazones', 'revolving-hearts': 'Corazones', 'heart-with-arrow': 'Flechado', 'heart-with-ribbon': 'Corazón con moño', 'growing-heart': 'Corazón creciendo', 'heart-decoration': 'Corazón decorado', 'kiss-mark': 'Beso', 'love-letter': 'Carta de amor', ring: 'Anillo', 'gem-stone': 'Diamante', 'heart-hands': 'Manos de corazón', 'heart-on-fire': 'Corazón en llamas', 'mending-heart': 'Corazón curado', 'smiling-face-with-hearts': 'Enamorada' } },
  { id: 'cielo', name: 'Cielo y clima', icons: { 'sun-behind-cloud': 'Sol y nube', cloud: 'Nube', rainbow: 'Arcoíris', snowflake: 'Copo de nieve', umbrella: 'Paraguas', 'umbrella-with-rain-drops': 'Lluvia', droplet: 'Gota', 'high-voltage': 'Rayo', 'cloud-with-rain': 'Nube con lluvia', fire: 'Fuego', sunrise: 'Amanecer', 'sunrise-over-mountains': 'Montañas', tornado: 'Remolino', 'sun-with-face': 'Sol sonriente' } },
  { id: 'fiesta', name: 'Celebración', icons: { 'party-popper': 'Fiesta', 'confetti-ball': 'Confeti', balloon: 'Globo', 'wrapped-gift': 'Regalo', crown: 'Corona', ribbon: 'Moño', sparkler: 'Bengala', fireworks: 'Fuegos artificiales', trophy: 'Trofeo', rosette: 'Roseta', 'christmas-tree': 'Árbol de Navidad', 'jack-o-lantern': 'Calabaza', ghost: 'Fantasma', snowman: 'Muñeco de nieve', 'graduation-cap': 'Graduación', 'bell': 'Campana' } },
  { id: 'arte', name: 'Arte y música', icons: { 'artist-palette': 'Paleta de pintor', paintbrush: 'Pincel', 'musical-note': 'Nota', 'musical-notes': 'Notas', guitar: 'Guitarra', headphone: 'Audífonos', microphone: 'Micrófono', camera: 'Cámara', books: 'Libros', 'open-book': 'Libro', pencil: 'Lápiz', crayon: 'Crayola', scissors: 'Tijeras', 'framed-picture': 'Cuadro', 'ballet-shoes': 'Zapatillas de ballet', violin: 'Violín', 'film-frames': 'Película', 'video-game': 'Videojuego' } },
  { id: 'detalles', name: 'Detalles', icons: { eyes: 'Ojos', sunglasses: 'Lentes', 'victory-hand': 'Amor y paz', 'waving-hand': 'Hola', 'ok-hand': 'Perfecto', 'high-heeled-shoe': 'Tacón', handbag: 'Bolsa', lipstick: 'Labial', key: 'Llave', 'old-key': 'Llave antigua', 'hourglass-done': 'Reloj de arena', 'light-bulb': 'Foco', 'hamsa': 'Hamsa', 'nazar-amulet': 'Ojo turco', 'yin-yang': 'Yin yang', 'peace-symbol': 'Paz', 'infinity': 'Infinito', 'feather': 'Pluma' } },
]

// Ilustraciones que vienen dentro de un recuadro: no se ven bien pintadas sobre tela
const boxed = new Set(['milky-way', 'shooting-star', 'night-with-stars', 'star-and-crescent', 'sunrise', 'sunrise-over-mountains', 'sparkler', 'fireworks', 'framed-picture', 'water-wave'])

const covers = { navidad: 'esfera', mexico: 'calaverita', cuentos: 'castle', 'arte-clasico': 'gran-ola', retro: 'cassette', cottagecore: 'basket', celestial: 'ojo-celestial', espacio: 'ringed-planet', dinosaurios: 't-rex', animales: 'cat', bichos: 'butterfly', mar: 'whale', flores: 'tulip', dulce: 'cupcake', amor: 'red-heart', cielo: 'rainbow', fiesta: 'party-popper', arte: 'artist-palette', detalles: 'sunglasses' }

const out = new URL('../src/data/stickers/', import.meta.url)
mkdirSync(out, { recursive: true })
const index = []
let total = 0
const missing = []
for (const c of categories) {
  const items = []
  const seen = new Set()
  for (const [name, label] of Object.entries(c.icons)) {
    const icon = set.icons[name]
    if (!icon) {
      missing.push(name)
      continue
    }
    if (seen.has(name) || boxed.has(name)) continue
    seen.add(name)
    items.push({ id: `${c.id}/${name}`, name: label, body: icon.body, w: icon.width ?? set.width ?? 32, h: icon.height ?? set.height ?? 32 })
  }
  const own = Object.entries(custom[c.id] ?? {}).map(([name, v]) => ({ id: `${c.id}/${name}`, name: v.label, body: v.body, w: 32, h: 32 }))
  items.unshift(...own)
  writeFileSync(new URL(`${c.id}.json`, out), JSON.stringify(items))
  const cover = items.find((it) => it.id === `${c.id}/${covers[c.id]}`) ?? items[0]
  // El índice trae la portada de cada categoría y los nombres para el buscador (sin los dibujos)
  index.push({ id: c.id, name: c.name, count: items.length, cover: cover ? { body: cover.body, w: cover.w, h: cover.h } : null, names: items.map((it) => [it.id, it.name]) })
  total += items.length
}
writeFileSync(new URL('index.json', out), JSON.stringify(index))
console.log(`Stickers: ${total} en ${categories.length} categorías.`)
if (missing.length) console.log('No existen en el set:', missing.join(', '))
