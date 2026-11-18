// Stickers dibujados a mano para Julietté (originales, sin copiar obras protegidas).
// Todos usan "currentColor" para que tomen el color que elige el cliente. Caja de 32 × 32.
const C = 'currentColor'
const f = (n) => Number(n.toFixed(2))

/** Recorta huecos (ojos, adornos) con una máscara: lo negro de `holes` queda transparente. */
const masked = (id, shapes, holes) =>
  `<mask id="jm-${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32"><rect width="32" height="32" fill="#fff"/>${holes}</mask><g mask="url(#jm-${id})" fill="${C}">${shapes}</g>`

/** Repite una figura alrededor de un centro. */
const around = (n, cx, cy, r, make, offset = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = offset + (i * 360) / n
    const rad = (a * Math.PI) / 180
    return make(f(cx + Math.sin(rad) * r), f(cy - Math.cos(rad) * r), a, i)
  }).join('')

/** Estrella de puntas alternas. */
const star = (cx, cy, points, outer, inner, long = {}) => {
  const pts = []
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI * i) / points - Math.PI / 2
    const r = i % 2 === 0 ? (long[i / 2] ?? outer) : inner
    pts.push(`${f(cx + Math.cos(a) * r)} ${f(cy + Math.sin(a) * r)}`)
  }
  return `M${pts.join(' L')}Z`
}

const flowerHole = (cx, cy, r) => around(5, cx, cy, r * 0.9, (x, y) => `<circle cx="${x}" cy="${y}" r="${f(r * 0.55)}" fill="#000"/>`) + `<circle cx="${cx}" cy="${cy}" r="${f(r * 0.5)}" fill="#000"/>`

export const custom = {
  navidad: {
    baston: { label: 'Bastón de dulce', body: `<path d="M20 30V12a6 6 0 0 0-12 0v1.5" fill="none" stroke="${C}" stroke-width="5.6" stroke-linecap="round" stroke-opacity=".35"/><path d="M20 30V12a6 6 0 0 0-12 0v1.5" fill="none" stroke="${C}" stroke-width="5.6" stroke-linecap="butt" stroke-dasharray="3 2.4"/>` },
    esfera: {
      label: 'Esfera',
      body:
        `<path d="M16 3.2a2.2 2.2 0 1 1-.01 0" fill="none" stroke="${C}" stroke-width="1.2"/><rect x="12.6" y="6.4" width="6.8" height="3.6" rx="1" fill="${C}"/>` +
        masked('esfera', `<circle cx="16" cy="19.5" r="10.5"/>`, `<path d="M6 17.5 9.5 15l3.2 2.5L16 15l3.3 2.5 3.2-2.5L26 17.5v1.6l-3.5-2.5-3.2 2.5-3.3-2.5-3.3 2.5-3.2-2.5L6 19.1Z" fill="#000"/>${around(6, 16, 23.4, 0, () => '')}<circle cx="11" cy="23.5" r="1.2" fill="#000"/><circle cx="16" cy="24.5" r="1.2" fill="#000"/><circle cx="21" cy="23.5" r="1.2" fill="#000"/><path d="M10.5 11.8a9 9 0 0 1 4-1.6" fill="none" stroke="#000" stroke-width="1.2" stroke-linecap="round"/>`),
    },
    corona: {
      label: 'Corona navideña',
      body:
        `<g fill="${C}">${around(20, 16, 15, 9.5, (x, y, a) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="1.5" transform="rotate(${f(a + 90 + 25)} ${x} ${y})"/>`)}` +
        `${around(7, 16, 15, 7, (x, y) => `<circle cx="${x}" cy="${y}" r="1.2"/>`, 20)}` +
        `<path d="M16 25c-2.5-3-7-3.5-7-1s4.5 2.5 7 1Zm0 0c2.5-3 7-3.5 7-1s-4.5 2.5-7 1Z"/><path d="M15 25.5 12.5 31l2-.5L16 26Zm2 0 2.5 5.5-2-.5L16 26Z"/><circle cx="16" cy="25" r="1.6"/></g>`,
    },
    muerdago: { label: 'Muérdago', body: `<g fill="${C}"><path d="M16 15C10 8 3.5 9.5 2.5 13 8 15.5 12 16.6 16 15Z"/><path d="M16 15c6-7 12.5-5.5 13.5-2-5.5 2.5-9.5 3.6-13.5 2Z"/><path d="M15.4 14.6C12.5 9 13 4 16 1.5c3 2.5 3.5 7.5.6 13.1Z" opacity=".75"/><circle cx="13.6" cy="18.4" r="2.4"/><circle cx="18.4" cy="18.4" r="2.4"/><circle cx="16" cy="21.8" r="2.4"/></g>` },
    jengibre: {
      label: 'Galleta de jengibre',
      body: masked(
        'jengibre',
        `<circle cx="16" cy="7.2" r="5.2"/><path d="M11 12.5h10l1 9 3.4 6.2a2.2 2.2 0 0 1-3.8 2.2L18 24h-4l-3.6 5.9a2.2 2.2 0 0 1-3.8-2.2L10 21.5Z"/><path d="M11 13.5 4.5 16.2a2.1 2.1 0 1 0 1.6 3.9L11 18Zm10 0 6.5 2.7a2.1 2.1 0 1 1-1.6 3.9L21 18Z"/>`,
        `<circle cx="14" cy="6.4" r="1" fill="#000"/><circle cx="18" cy="6.4" r="1" fill="#000"/><path d="M13.6 9c1.4 1.5 3.4 1.5 4.8 0" fill="none" stroke="#000" stroke-width=".9" stroke-linecap="round"/><circle cx="16" cy="15.5" r="1.1" fill="#000"/><circle cx="16" cy="19.5" r="1.1" fill="#000"/><path d="M5.5 17.3l1 .9 1-.9M24.5 17.3l1 .9 1-.9M9 26.2l1 .9 1-.9M21 26.2l1 .9 1-.9" fill="none" stroke="#000" stroke-width=".8"/>`,
      ),
    },
    nochebuena: {
      label: 'Nochebuena',
      body: masked(
        'nochebuena',
        around(8, 16, 16, 0, (x, y, a, i) => `<path d="M16 16C13.6 ${i % 2 ? 11 : 9.5} 14.2 ${i % 2 ? 6 : 4} 16 ${i % 2 ? 3.5 : 1.5}c1.8 ${i % 2 ? 2.5 : 2.5} 2.4 ${i % 2 ? 7.5 : 8} 0 ${i % 2 ? 12.5 : 14.5}Z" transform="rotate(${a + 22.5} 16 16)"/>`) +
          around(8, 16, 16, 0, (x, y, a) => `<path d="M16 16C14.4 12.5 14.8 9 16 7c1.2 2 1.6 5.5 0 9Z" transform="rotate(${a} 16 16)" opacity=".8"/>`) +
          around(6, 16, 16, 1.6, (x, y) => `<circle cx="${x}" cy="${y}" r=".9"/>`),
        `<circle cx="16" cy="16" r="3.2" fill="#000"/>`,
      ),
    },
    calcetin: { label: 'Calcetín navideño', body: masked('calcetin', `<path d="M10 3h12v13.5c0 3-1 5-4 7l-4.8 3.2C9.8 29 5.6 27 5.6 23.6c0-2.5 1.5-4 4.4-5.6Z"/>`, `<rect x="9" y="8.6" width="14" height="1.1" fill="#000"/>${[[13, 13], [18, 13], [15.5, 16.5], [11, 21], [8.5, 24], [20, 18.5]].map(([x, y]) => `<path d="${star(x, y, 4, 1.6, .5)}" fill="#000"/>`).join('')}`) },
    luces: { label: 'Luces navideñas', body: `<path d="M1 7c6 7 10 7 15 2s9-6 15 1" fill="none" stroke="${C}" stroke-width="1.1"/>${[[5, 10.5, -30], [10.5, 12.6, -10], [16, 9, 10], [21.5, 6.4, -12], [27, 8.2, 22]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})" fill="${C}"><rect x="${x - 1.3}" y="${y - .4}" width="2.6" height="2.4" rx=".5"/><path d="M${x} ${y + 2}c-2.4 0-3 2.6-3 4.6 0 2 1.4 3.6 3 3.6s3-1.6 3-3.6c0-2-.6-4.6-3-4.6Z"/></g>`).join('')}` },
    gorro: { label: 'Gorro de Santa', body: masked('gorro', `<path d="M4 23.5C5 14 11.5 6.5 21.5 7.2c4 .3 6.2 3 5.3 6.3-2-2-5-2-6 1.2-1 3.6.6 6.6 1.7 8.8Z"/><circle cx="27" cy="14.6" r="3.2"/><rect x="2" y="23" width="24" height="6" rx="3"/>`, `<rect x="2" y="22.4" width="24" height="1" fill="#000"/>`) },
    campanas: {
      label: 'Campanas',
      body: `<g fill="${C}">${[[9, 18, -16], [23, 18, 16]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} 8)"><path d="M${x} 9c-4 0-5.6 3.4-5.6 7.6 0 3.2-.8 4.8-2.4 5.6h16c-1.6-.8-2.4-2.4-2.4-5.6 0-4.2-1.6-7.6-5.6-7.6Z"/><circle cx="${x}" cy="${y + 6}" r="1.8"/></g>`).join('')}<path d="M16 6c-2-2.6-6-3.2-6-1s4 2.2 6 1Zm0 0c2-2.6 6-3.2 6-1s-4 2.2-6 1Z"/><circle cx="16" cy="6" r="1.4"/></g>` },
    belen: { label: 'Estrella de Belén', body: `<path d="${star(16, 13, 8, 9, 2.4, { 0: 11, 2: 9, 4: 18, 6: 9 })}" fill="${C}"/>` },
    pinata: { label: 'Piñata de picos', body: masked('pinata', `<circle cx="16" cy="16" r="6.2"/>${around(7, 16, 16, 0, (x, y, a) => `<path d="M14 11.5 16 1.5l2 10Z" transform="rotate(${a} 16 16)"/>`)}${around(7, 16, 16, 15.2, (x, y) => `<circle cx="${x}" cy="${y}" r="1.1"/>`)}`, `<circle cx="16" cy="16" r="3.6" fill="none" stroke="#000" stroke-width=".9"/><circle cx="16" cy="16" r="1.2" fill="#000"/>`) },
  },
  mexico: {
    calaverita: {
      label: 'Calaverita de azúcar',
      body: masked(
        'calaverita',
        `<path d="M16 2.6C9 2.6 4.6 7.8 4.6 14c0 4 2 6.4 4.4 7.6v3.6c0 2 1.8 3.6 4 3.6h6c2.2 0 4-1.6 4-3.6v-3.6c2.4-1.2 4.4-3.6 4.4-7.6C27.4 7.8 23 2.6 16 2.6Z"/>`,
        `${flowerHole(11, 14, 3.3)}${flowerHole(21, 14, 3.3)}<path d="M16 18.6c-1.2-1.6-3-.9-2.5.6.4 1 2.5 2.3 2.5 2.3s2.1-1.3 2.5-2.3c.5-1.5-1.3-2.2-2.5-.6Z" fill="#000"/><path d="M11.5 24.6h9M13 23v3.4M16 23v3.4M19 23v3.4" stroke="#000" stroke-width=".9" fill="none"/><path d="M16 5.2c-1 1.4-1 2.8 0 4.2 1-1.4 1-2.8 0-4.2ZM13.8 7.3c1.4 1 2.8 1 4.2 0-1.4-1-2.8-1-4.2 0Z" fill="#000"/><path d="M6.8 17.5c.8 1.2 1.6 1.6 2.6 1.6M25.2 17.5c-.8 1.2-1.6 1.6-2.6 1.6" stroke="#000" stroke-width=".8" fill="none" stroke-linecap="round"/>`,
      ),
    },
    catrina: {
      label: 'Catrina',
      body: masked(
        'catrina',
        `<ellipse cx="16" cy="10.4" rx="15" ry="3.2"/><path d="M9.6 10c0-5.4 12.8-5.4 12.8 0Z"/><path d="M16 12.2c-4.6 0-6.8 3-6.8 7 0 3 1.8 5 3.8 5.8v3h6v-3c2-.8 3.8-2.8 3.8-5.8 0-4-2.2-7-6.8-7Z"/><path d="M9.4 14c-2.2 2.6-2.6 6.6-1 10 .6-3.2 1.2-6 2.6-8Zm13.2 0c2.2 2.6 2.6 6.6 1 10-.6-3.2-1.2-6-2.6-8Z" opacity=".8"/>`,
        `${flowerHole(6.5, 9.6, 1.6)}${flowerHole(25.5, 9.6, 1.6)}${flowerHole(16, 6.6, 1.5)}<ellipse cx="13.3" cy="18.2" rx="1.9" ry="2.1" fill="#000"/><ellipse cx="18.7" cy="18.2" rx="1.9" ry="2.1" fill="#000"/><path d="M16 20.6l-.9 1.6h1.8Z" fill="#000"/><path d="M13.4 24h5.2M14.6 23v2.2M16 23v2.2M17.4 23v2.2" stroke="#000" stroke-width=".7" fill="none"/>`,
      ),
    },
    'papel-picado': {
      label: 'Papel picado',
      body:
        `<path d="M0 4.6c5 1.6 11 1.6 16 0s11-1.6 16 0" fill="none" stroke="${C}" stroke-width=".9"/>` +
        [1.5, 12, 22.5]
          .map((x, i) =>
            masked(
              `picado${i}`,
              `<path d="M${x} 5.6h8v15l-1 1.6-1-1.6-1 1.6-1-1.6-1 1.6-1-1.6-1 1.6-1-1.6Z"/>`,
              `<path d="M${x + 4} 8.2l1.6 2.4-1.6 2.4-1.6-2.4Z" fill="#000"/><circle cx="${x + 2}" cy="15.6" r=".9" fill="#000"/><circle cx="${x + 6}" cy="15.6" r=".9" fill="#000"/><path d="M${x + 4} 14.2c-.9 1.2-.9 2.4 0 3.6.9-1.2.9-2.4 0-3.6Z" fill="#000"/><path d="M${x + 1.2} 18.6h5.6" stroke="#000" stroke-width=".7" stroke-dasharray="1 .8"/>`,
            ),
          )
          .join(''),
    },
    nopal: { label: 'Nopal', body: masked('nopal', `<ellipse cx="16" cy="21" rx="6.4" ry="8.4"/><ellipse cx="7.8" cy="13.6" rx="4.2" ry="5.8" transform="rotate(-32 7.8 13.6)"/><ellipse cx="24.4" cy="11.6" rx="4.2" ry="5.8" transform="rotate(30 24.4 11.6)"/><ellipse cx="27" cy="4.4" rx="2.2" ry="2.8"/>`, [[14, 17], [18, 20], [14.5, 24], [17.5, 26], [16, 14.2], [7, 12], [9, 15.5], [24, 10], [25.5, 13.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".55" fill="#000"/>`).join('') + `<path d="M13 13.6 11 11M19.6 10.2l1.8-2" stroke="#000" stroke-width="1"/>`) },
    cempasuchil: {
      label: 'Cempasúchil',
      body: masked(
        'cempasuchil',
        around(16, 16, 16, 9.6, (x, y, a) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="4.4" transform="rotate(${a} ${x} ${y})"/>`) +
          around(12, 16, 16, 6.2, (x, y, a) => `<ellipse cx="${x}" cy="${y}" rx="2.1" ry="3.4" transform="rotate(${a} ${x} ${y})"/>`, 15) +
          `<circle cx="16" cy="16" r="3.2"/>`,
        `<circle cx="16" cy="16" r="7.4" fill="none" stroke="#000" stroke-width=".8"/><circle cx="16" cy="16" r="4" fill="none" stroke="#000" stroke-width=".8"/>`,
      ),
    },
    'pan-de-muerto': { label: 'Pan de muerto', body: masked('pan', `<path d="M3.6 25C3.6 15 9.6 9.6 16 9.6S28.4 15 28.4 25Z"/><rect x="2" y="25.6" width="28" height="2.2" rx="1.1"/><circle cx="16" cy="7.4" r="2.6"/>`, `<path d="M6.6 21.6C11 18 21 18 25.4 21.6M8 14.6c4 4.8 12 4.8 16 0M16 10.6V24" stroke="#000" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="16" cy="7.4" r="3.6" fill="none" stroke="#000" stroke-width="1"/>`) + `<path d="M6.6 21.6C11 18 21 18 25.4 21.6M8 14.6c4 4.8 12 4.8 16 0M16 10.6V24" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-dasharray="1.6 .9"/>` },
    maracas: { label: 'Maracas', body: [[-22, 11], [22, 21]].map(([r, x], i) => `<g transform="rotate(${r} ${x} 28)">${masked(`maraca${i}`, `<ellipse cx="${x}" cy="11" rx="5.4" ry="6.8"/><rect x="${x - 1.2}" y="16.6" width="2.4" height="12" rx="1.2"/>`, `<path d="M${x - 5.4} 9.4h10.8M${x - 5.4} 12.8h10.8" stroke="#000" stroke-width="1"/><path d="M${x - 3} 11.1l1-1 1 1 1-1 1 1 1-1" stroke="#000" stroke-width=".7" fill="none"/>`)}</g>`).join('') },
    'ojo-de-dios': { label: 'Ojo de Dios', body: `<path d="M16 1 31 16 16 31 1 16ZM16 5.2 26.8 16 16 26.8 5.2 16ZM16 8.4 23.6 16 16 23.6 8.4 16ZM16 11.6 20.4 16 16 20.4 11.6 16Z" fill="${C}" fill-rule="evenodd"/><path d="M16 13.8 18.2 16 16 18.2 13.8 16Z" fill="${C}"/>` },
    'sagrado-corazon': { label: 'Sagrado corazón', body: masked('sagrado', `<path d="M16 29C10 24.6 4 20 4 13.6 4 9.4 7.4 7 10.4 7c2.4 0 4.4 1.4 5.6 3.4C17.2 8.4 19.2 7 21.6 7 24.6 7 28 9.4 28 13.6 28 20 22 24.6 16 29Z"/><path d="M16 8.6c-1.6-2-1.6-4.2 0-7.2 1.6 3 1.6 5.2 0 7.2ZM12.6 9c-1.8-1-2.6-2.8-2-5 1.6 1.4 2.4 3.2 2 5Zm6.8 0c-.4-1.8.4-3.6 2-5 .6 2.2-.2 4-2 5Z"/>`, `<path d="M6 15.2c3 1.6 6.4-1.2 10 0s7 1.6 10 0" stroke="#000" stroke-width="1.4" fill="none"/><path d="M8.4 13.4l1 2.6M12 13.6l.4 2.6M15.6 14.2v2.4M19.4 14.6l-.4 2.4M23 13.8l-.8 2.4" stroke="#000" stroke-width=".7"/>`) },
    colibri: { label: 'Colibrí', body: `<g fill="${C}"><ellipse cx="14.6" cy="18" rx="6.6" ry="4.2" transform="rotate(-28 14.6 18)"/><circle cx="21" cy="12.4" r="3.4"/><path d="M23.6 11 31 6.4l-6.6 6Z"/><path d="M13.4 16C12 9 15.6 3.4 23.4 1.4c-1.6 5.4-4.6 10.4-8.6 15.4Z" opacity=".85"/><path d="M9.6 20.6 2 27.6l2.6-5.8L1.4 20Z"/></g><circle cx="21.8" cy="11.8" r=".9" fill="#fff" fill-opacity=".9"/>` },
    'pez-alebrije': { label: 'Pez alebrije', body: masked('alebrije', `<path d="M3 16C7 9 15.4 7.4 22.4 12L29.4 6.6v18.8L22.4 20C15.4 24.6 7 23 3 16Z"/>`, `<circle cx="8.4" cy="14.6" r="1.4" fill="#000"/><path d="M12 10.4c1.6 3.6 1.6 7.6 0 11.2M15.6 9.8c-1.2 2-1.2 4 0 6 1.2 2 1.2 4 0 6.4" stroke="#000" stroke-width=".9" fill="none"/>${[[19, 13], [19, 18.6], [21.4, 15.8], [26.2, 11], [26.2, 20.6], [26.2, 15.8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#000"/>`).join('')}<path d="M5 18.2h3.4" stroke="#000" stroke-width=".8"/>`) },
    jarrito: { label: 'Jarrito de barro', body: masked('jarrito', `<path d="M7.4 7h15.2l-1.2 19c-.1 1.6-1.2 2.6-2.8 2.6h-7.2c-1.6 0-2.7-1-2.8-2.6Z"/><path d="M22.2 11.4c5.4 0 5.4 9.4-.8 9.4" fill="none" stroke="${C}" stroke-width="2.4"/>`, `<path d="M7.6 9.6h14.8" stroke="#000" stroke-width=".9"/><path d="M8.6 15.4l1.6-2 1.6 2 1.6-2 1.6 2 1.6-2 1.6 2 1.6-2 1.6 2" stroke="#000" stroke-width=".9" fill="none"/>${[[11, 20], [15, 20], [19, 20], [13, 23.6], [17, 23.6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".8" fill="#000"/>`).join('')}`) },
    'mascara-luchador': { label: 'Máscara de luchador', body: masked('luchador', `<path d="M16 2.4C9.4 2.4 6 8.4 6 15c0 7.2 4.4 13.4 10 14.6 5.6-1.2 10-7.4 10-14.6 0-6.6-3.4-12.6-10-12.6Z"/>`, `<path d="M8.6 14.6c1.4-2.6 4.4-3 6-1.2-.4 2.4-2.4 4-4.6 3.6-1-.2-1.4-1.2-1.4-2.4Zm14.8 0c-1.4-2.6-4.4-3-6-1.2.4 2.4 2.4 4 4.6 3.6 1-.2 1.4-1.2 1.4-2.4Z" fill="#000"/><ellipse cx="16" cy="23.6" rx="2.8" ry="1.6" fill="#000"/><path d="M16 4.6c-2 2.4-2.4 4.6-1.2 6.8.4-1 .8-1.6 1.2-1.6s.8.6 1.2 1.6c1.2-2.2.8-4.4-1.2-6.8Z" fill="#000"/><path d="M7.4 11.4c1.6-.4 3.4-.2 5 .8M24.6 11.4c-1.6-.4-3.4-.2-5 .8" stroke="#000" stroke-width=".9" fill="none"/>`) },
    'pinata-estrella': { label: 'Piñata de posada', body: masked('pinata2', `<circle cx="16" cy="16" r="6.2"/>${around(7, 16, 16, 0, (x, y, a) => `<path d="M14 11.5 16 1.5l2 10Z" transform="rotate(${a} 16 16)"/>`)}${around(7, 16, 16, 15.2, (x, y) => `<circle cx="${x}" cy="${y}" r="1.1"/>`)}`, `<circle cx="16" cy="16" r="3.6" fill="none" stroke="#000" stroke-width=".9"/><circle cx="16" cy="16" r="1.2" fill="#000"/>`) },
  },
  'arte-clasico': {
    'gran-ola': { label: 'La gran ola', body: masked('ola', `<path d="M1 27C4.6 17.6 11 11 19.4 10.6c6-.3 10.2 3.6 9.6 8.6-1.8-3.6-5.6-4.6-8-2.6-2.4 2-1 6.2 2.4 6.6-4.4 3.2-10.6 2.8-12.6-1.8C9 26 5 28.4 1 27Z"/>${around(5, 23, 14, 7.6, (x, y) => `<circle cx="${x}" cy="${y}" r="1.1"/>`, -70)}<path d="M2 30.6h28" stroke="${C}" stroke-width="1.2"/>`, `<path d="M6 24c3-5.6 7.4-9.4 12.6-10.4M9.6 25.4c2.6-4.4 6-7.4 10-8.4" stroke="#000" stroke-width=".8" fill="none"/>`) },
    'noche-estrellada': { label: 'Remolino estrellado', body: `<path d="M17 14.6a2 2 0 1 1-2.6-1.6 4 4 0 1 1-1.4 7.4 6 6 0 1 1 9.4-5.4 8 8 0 1 1-15.2 4" fill="none" stroke="${C}" stroke-width="1.8" stroke-linecap="round"/><path d="M4 31C2.6 22 3.6 14 6.2 8.4 8.6 14 9 22 7.6 31Z" fill="${C}"/><path d="M24.6 3.4a4 4 0 1 0 4 4.6 3.2 3.2 0 1 1-4-4.6Z" fill="${C}"/><path d="${star(28.4, 18, 4, 2.4, .7)}" fill="${C}"/><path d="${star(14, 4.4, 4, 2, .6)}" fill="${C}"/>` },
    'arbol-de-la-vida': { label: 'Árbol de espirales', body: `<path d="M16 31V15M16 21c-3-1-6-3-7-6M16 18c3-1 6-3 7.4-6.6M16 15c0-3-1-5-3-7M16 15c1-3 3-5 5.4-6" fill="none" stroke="${C}" stroke-width="1.8" stroke-linecap="round"/>${[[9, 15, 3.4], [23.4, 11.4, 3.4], [13, 8, 3], [21.4, 9, 2.8], [6, 9, 2.6], [26, 18, 2.6], [16, 4, 2.6]].map(([x, y, r]) => `<path d="M${x} ${y}m-${r} 0a${r} ${r} 0 1 1 ${r} ${r}a${f(r * .6)} ${f(r * .6)} 0 1 1 ${f(-r * .6)} ${f(-r * .6)}" fill="none" stroke="${C}" stroke-width="1.3" stroke-linecap="round"/>`).join('')}<path d="M10 31h12" stroke="${C}" stroke-width="1.6" stroke-linecap="round"/>` },
    'concha-venus': { label: 'Concha', body: masked('concha', `<path d="M16 27 3.4 13.4C5 7 10 3.4 16 3.4S27 7 28.6 13.4Z"/><path d="M12 27h8l-2 3h-4Z"/>`, `${[-56, -38, -19, 0, 19, 38, 56].map((a) => `<path d="M16 26.6 16 5" transform="rotate(${a} 16 26.6)" stroke="#000" stroke-width=".9"/>`).join('')}`) },
    nenufar: { label: 'Nenúfar', body: masked('nenufar', `<path d="M16 22c-9 0-14 2.4-14 5s5 4 14 4 14-1.4 14-4-5-5-14-5Z"/>${[-50, -25, 0, 25, 50].map((a) => `<path d="M16 22c-2.6-3-3-7.6 0-12.6 3 5 2.6 9.6 0 12.6Z" transform="rotate(${a} 16 22)"/>`).join('')}`, `<path d="M16 26.2 24 30.6" stroke="#000" stroke-width="1.2"/>${[-50, -25, 0, 25, 50].map((a) => `<path d="M16 21.4V13" transform="rotate(${a} 16 22)" stroke="#000" stroke-width=".6"/>`).join('')}`) },
  },
  retro: {
    cassette: { label: 'Cassette', body: masked('cassette', `<rect x="2" y="6" width="28" height="20" rx="2.4"/>`, `<rect x="6" y="9.4" width="20" height="8.4" rx="4.2" fill="#000"/><circle cx="11" cy="13.6" r="2.6" fill="#fff"/><circle cx="21" cy="13.6" r="2.6" fill="#fff"/><circle cx="11" cy="13.6" r="1.1" fill="#000"/><circle cx="21" cy="13.6" r="1.1" fill="#000"/><path d="M8.6 26 10.4 21h11.2l1.8 5" fill="#000"/><circle cx="12.6" cy="23.4" r=".7" fill="#fff"/><circle cx="19.4" cy="23.4" r=".7" fill="#fff"/>`) },
  },
  celestial: {
    'ojo-celestial': { label: 'Ojo celestial', body: masked('ojoc', `<path d="M2 16c4-6 9-9 14-9s10 3 14 9c-4 6-9 9-14 9S6 22 2 16Z"/>${around(9, 16, 16, 13.4, (x, y, a) => `<rect x="${f(x - .6)}" y="${f(y - 1.6)}" width="1.2" height="3.2" rx=".6" transform="rotate(${a} ${x} ${y})"/>`, -80).slice(0)}`, `<circle cx="16" cy="16" r="5" fill="#000"/><circle cx="16" cy="16" r="3.4" fill="#fff"/><path d="${star(16, 16, 4, 2.6, .7)}" fill="#000"/>`) },
    'carta-tarot': { label: 'Carta de tarot', body: masked('tarot', `<rect x="7" y="2" width="18" height="28" rx="2"/>`, `<rect x="8.8" y="3.8" width="14.4" height="24.4" rx="1.2" fill="none" stroke="#000" stroke-width=".8"/><circle cx="16" cy="14" r="3.4" fill="#000"/>${around(12, 16, 14, 5.6, (x, y, a) => `<rect x="${f(x - .4)}" y="${f(y - 1.2)}" width=".8" height="2.4" fill="#000" transform="rotate(${a} ${x} ${y})"/>`)}<path d="M12 24h8M13.4 25.8h5.2" stroke="#000" stroke-width=".8"/><path d="${star(16, 6.4, 4, 1.4, .4)}" fill="#000"/>`) },
    'luna-estrellas': { label: 'Luna y estrellas', body: `<path d="M14 3.6A12.4 12.4 0 1 0 28.4 19 10 10 0 1 1 14 3.6Z" fill="${C}"/><path d="${star(24, 7, 4, 3, .9)}" fill="${C}"/><path d="${star(29, 13, 4, 1.8, .5)}" fill="${C}"/><circle cx="20.4" cy="3" r=".8" fill="${C}"/>` },
    'sol-mistico': { label: 'Sol místico', body: masked('solm', `<circle cx="16" cy="16" r="7"/>${around(12, 16, 16, 0, (x, y, a, i) => `<path d="M15 ${i % 2 ? 6.6 : 5.6} 16 ${i % 2 ? 2.6 : .6} 17 ${i % 2 ? 6.6 : 5.6}Z" transform="rotate(${a} 16 16)"/>`)}`, `<path d="M12.4 14.6c.8-.8 1.8-.8 2.6 0M17 14.6c.8-.8 1.8-.8 2.6 0" stroke="#000" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="M13.4 18.6c1.6 1.4 3.6 1.4 5.2 0" stroke="#000" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="M16 15.6v2" stroke="#000" stroke-width=".7"/>`) },
  },
}
