import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { useConsent } from '../state/consent'
import { usePageMeta } from '../lib/usePageMeta'
import { money } from '../lib/format'
import { container } from '../components/ui'

const L = site.legal

function LegalPage({ eyebrow, title, intro, children }: { eyebrow: string; title: ReactNode; intro?: string; children: ReactNode }) {
  return (
    <article className={`${container} pt-[clamp(24px,4vw,56px)] pb-[clamp(72px,9vw,130px)]`}>
      <div className="max-w-[820px]">
        <p className="m-0 jl-eyebrow mb-5">{eyebrow}</p>
        <h1 className="m-0 font-display font-light text-[clamp(48px,6vw,92px)] leading-[.92]">{title}</h1>
        {intro && <p className="mt-6 mb-0 text-[17px] leading-[1.8]">{intro}</p>}
        <p className="mt-4 mb-0 text-[13px]">Última actualización: {L.updated}</p>
        <div className="jl-prose mt-6 border-t border-borgona pt-2">{children}</div>
        <p className="mt-12 text-[13px] leading-[1.7] border-t border-borgona/40 pt-6">
          ¿Dudas? Escríbenos a {site.email} o por WhatsApp {site.whatsappDisplay}. Este texto es una base que debe revisarse con asesoría legal según el país de operación ({L.country}).
        </p>
      </div>
    </article>
  )
}

export function Terminos() {
  usePageMeta('Términos y condiciones')
  return (
    <LegalPage eyebrow="Legal" title={<>Términos y <span className="italic">condiciones</span></>} intro="Estas condiciones regulan el uso del sitio y la compra de piezas Julietté. Al hacer un pedido aceptas lo que se describe aquí.">
      <h2>1. Quiénes somos</h2>
      <p>Julietté es una marca de piezas pintadas a mano operada por {L.owner}, con domicilio en {L.address} e identificación fiscal {L.taxId}.</p>
      <h2>2. Naturaleza de las piezas</h2>
      <p>Cada pieza se pinta a mano. Las variaciones de trazo, tono y acabado respecto a las fotografías o a la vista previa del diseñador son parte de su carácter artesanal y no se consideran defectos. Las fotografías y vistas previas son ilustrativas.</p>
      <h2>3. Pedidos</h2>
      <ul>
        <li>Un pedido se considera confirmado cuando Julietté valida disponibilidad, envío y forma de pago por WhatsApp o correo, y se recibe el pago o anticipo correspondiente.</li>
        <li>Enviar el formulario del sitio no genera cargos ni obliga a la compra hasta esa confirmación.</li>
        <li>Nos reservamos el derecho de rechazar pedidos que incluyan contenido ofensivo, que infrinja derechos de terceros o que no podamos producir con la calidad de la marca.</li>
      </ul>
      <h2>4. Piezas personalizadas</h2>
      <ul>
        <li>Para iniciar una pieza personalizada se solicita un anticipo de [{site.depositPercent}%], que da inicio al boceto.</li>
        <li>El boceto incluye un ajuste sin costo. Cambios adicionales pueden tener un costo extra que se informará antes de aplicarlos.</li>
        <li>La pieza se pinta solo después de que apruebes el boceto. El tiempo de elaboración ({site.leadDays.custom} días hábiles) corre a partir de esa aprobación.</li>
        <li>Al solicitar una personalización confirmas que tienes derecho a usar los textos, imágenes o referencias que nos envías. No reproducimos logotipos ni marcas registradas de terceros para su venta.</li>
      </ul>
      <h2>5. Precios y pagos</h2>
      <p>Los precios se expresan en {site.currency} e incluyen o no impuestos según se indique al confirmar. Aceptamos transferencia bancaria, enlace de pago con tarjeta y efectivo en entregas en persona. Los costos de envío se informan antes de confirmar.</p>
      <h2>6. Envíos y entregas</h2>
      <p>Las condiciones de envío se describen en la página de <Link to="/envios">envíos</Link>. El riesgo de la pieza pasa al cliente al momento de la entrega.</p>
      <h2>7. Cambios, cancelaciones y reembolsos</h2>
      <p>Se rigen por nuestra <Link to="/reembolsos">política de cambios y reembolsos</Link>.</p>
      <h2>8. Propiedad intelectual</h2>
      <p>Los diseños originales, el logotipo, las fotografías y los textos de Julietté son propiedad de la marca. No pueden reproducirse con fines comerciales sin autorización. Comprar una pieza no transfiere los derechos del diseño.</p>
      <h2>9. Uso del sitio</h2>
      <p>Te comprometes a usar el sitio de buena fe. Podemos actualizar contenidos, precios y estas condiciones; la versión vigente es la publicada en esta página.</p>
      <h2>10. Legislación aplicable</h2>
      <p>Estos términos se rigen por las leyes de {L.country}. Cualquier controversia se intentará resolver primero de forma directa y amistosa.</p>
    </LegalPage>
  )
}

export function Reembolsos() {
  usePageMeta('Cambios y reembolsos')
  return (
    <LegalPage eyebrow="Legal" title={<>Cambios y <span className="italic">reembolsos</span></>} intro="Queremos que tu pieza llegue tal como la imaginaste. Esta política explica qué hacer si algo no sale como esperabas.">
      <h2>Piezas de colección</h2>
      <ul>
        <li>Puedes solicitar un cambio o reembolso dentro de los {site.policy.returnDays} días naturales posteriores a la entrega, siempre que la pieza no haya sido usada, lavada ni alterada y conserve su etiqueta.</li>
        <li>Los gastos de envío de la devolución corren por cuenta del cliente, salvo que la pieza presente un defecto de fabricación.</li>
      </ul>
      <h2>Piezas personalizadas</h2>
      <ul>
        <li>Por estar hechas especialmente para ti, no aceptan cambios ni reembolsos una vez aprobado el boceto, salvo defecto de fabricación.</li>
        <li>Si cancelas antes de aprobar el boceto, reembolsamos el anticipo menos el valor del trabajo de diseño realizado ({site.policy.designFee}).</li>
        <li>Las variaciones propias de la pintura a mano no se consideran defecto.</li>
      </ul>
      <h2>Defectos o daños en el envío</h2>
      <p>Si tu pieza llega dañada o con un defecto, escríbenos dentro de las {site.policy.damageHours} horas siguientes a la entrega con fotografías del empaque y de la pieza. Te ofreceremos reparación, reposición o reembolso.</p>
      <h2>Cómo solicitarlo</h2>
      <ol className="pl-5 list-decimal">
        <li>Escríbenos por WhatsApp {site.whatsappDisplay} o a {site.email} con tu número de pedido.</li>
        <li>Te confirmaremos si aplica y los pasos para el envío.</li>
        <li>Al recibir y revisar la pieza, el reembolso se procesa en un plazo de {site.policy.refundDays} días hábiles por el mismo medio de pago.</li>
      </ol>
    </LegalPage>
  )
}

export function Privacidad() {
  usePageMeta('Aviso de privacidad')
  return (
    <LegalPage eyebrow="Legal" title={<>Aviso de <span className="italic">privacidad</span></>} intro="Cuidamos tus datos con el mismo cariño con el que pintamos cada pieza.">
      <h2>Responsable</h2>
      <p>{L.owner}, con domicilio en {L.address}, es responsable del tratamiento de tus datos personales.</p>
      <h2>Datos que recabamos</h2>
      <ul>
        <li>Identificación y contacto: nombre, teléfono y correo electrónico.</li>
        <li>Entrega: domicilio y referencias, cuando eliges envío.</li>
        <li>Pedido: piezas, personalizaciones, notas e imágenes de referencia que decides enviarnos.</li>
        <li>Navegación: solo si aceptas cookies de analítica o marketing.</li>
      </ul>
      <p>No recabamos datos de tarjetas en este sitio. Los pagos con tarjeta se realizan en la plataforma del proveedor de pagos.</p>
      <h2>Para qué los usamos</h2>
      <ul>
        <li>Gestionar, confirmar, producir y entregar tu pedido.</li>
        <li>Comunicarnos contigo sobre tu pedido y el boceto de tu pieza.</li>
        <li>Enviarte lanzamientos, solo si te suscribes. Puedes darte de baja en cualquier momento.</li>
        <li>Mejorar el sitio con estadísticas agregadas, solo con tu consentimiento.</li>
      </ul>
      <h2>Con quién los compartimos</h2>
      <p>Con proveedores necesarios para operar: mensajería, paquetería, pasarela de pago, alojamiento web y, si las aceptas, herramientas de analítica. No vendemos tus datos.</p>
      <h2>Tus derechos</h2>
      <p>Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos, así como revocar tu consentimiento, escribiendo a {site.email}. Responderemos en un plazo máximo de {site.policy.privacyDays} días hábiles.</p>
      <h2>Almacenamiento en tu dispositivo</h2>
      <p>Tu carrito, tu diseño y tus preferencias se guardan en tu propio navegador. Las imágenes de referencia que subes en "Diseña la tuya" no se envían a ningún servidor hasta que tú nos las compartes.</p>
    </LegalPage>
  )
}

export function Cookies() {
  usePageMeta('Política de cookies')
  const { openPanel } = useConsent()
  return (
    <LegalPage eyebrow="Legal" title={<>Política de <span className="italic">cookies</span></>} intro="Usamos pocas cookies y solo las necesarias, salvo que nos permitas más.">
      <h2>Qué son</h2>
      <p>Las cookies y el almacenamiento local son pequeños archivos que el navegador guarda para recordar información entre visitas.</p>
      <h2>Las que usamos</h2>
      <ul>
        <li><strong>Necesarias:</strong> guardan tu carrito, tu diseño en curso, tu último pedido y tus preferencias de cookies. Siempre activas.</li>
        <li><strong>Analítica (opcional):</strong> Google Analytics, para entender de forma agregada qué secciones se visitan. Solo se cargan si las aceptas.</li>
        <li><strong>Marketing (opcional):</strong> píxel de Meta, para medir campañas en redes sociales. Solo se cargan si las aceptas.</li>
      </ul>
      <h2>Cómo cambiar tu decisión</h2>
      <p>
        Puedes modificar tus preferencias en cualquier momento:{' '}
        <button type="button" onClick={openPanel} className="bg-transparent border-0 p-0 text-borgona underline underline-offset-4 cursor-pointer text-[16px]">
          abrir preferencias de cookies
        </button>
        . También puedes borrarlas desde la configuración de tu navegador.
      </p>
    </LegalPage>
  )
}

export function Envios() {
  usePageMeta('Envíos y entregas')
  return (
    <LegalPage eyebrow="Información" title={<>Envíos y <span className="italic">entregas</span></>}>
      <h2>Zonas</h2>
      <p>Enviamos a {site.shippingZone}. También puedes recoger tu pieza en {site.pickupPoint} con cita previa.</p>
      <h2>Tiempos</h2>
      <ul>
        <li>Piezas listas: se envían en {site.readyShipDays} días hábiles tras confirmar el pago.</li>
        <li>Piezas personalizadas: {site.leadDays.custom} días hábiles de elaboración tras aprobar el boceto, más el tiempo de envío.</li>
      </ul>
      <h2>Costos</h2>
      <p>
        El costo depende del destino y se confirma antes de pagar.
        {site.freeShippingFrom !== null && ` Envío gratis a partir de ${money(site.freeShippingFrom)}.`}
      </p>
      <h2>Empaque</h2>
      <p>Cada pieza viaja protegida, con su etiqueta, tarjeta de bienvenida, guía de cuidados y nota de agradecimiento. Pasa por una revisión de calidad antes de salir.</p>
    </LegalPage>
  )
}

const faqs = [
  { q: '¿Cada pieza es realmente única?', a: 'Sí. Todas se pintan a mano, por lo que ninguna es exactamente igual a otra, incluso dentro del mismo diseño.' },
  { q: '¿Cómo funciona un pedido personalizado?', a: `Creas tu idea en "Diseña la tuya" o nos escribes. Te enviamos un boceto, lo ajustamos una vez si lo necesitas y, al aprobarlo con un anticipo de [${site.depositPercent}%], lo pintamos.` },
  { q: '¿Cuánto tarda mi pieza?', a: `Las piezas listas se envían en pocos días. Las personalizadas toman ${site.leadDays.custom} días hábiles tras aprobar el boceto.` },
  { q: '¿Puedo lavar mi tote?', a: 'Sí: al revés, con agua fría, sin cloro y sin frotar el diseño. Seca al aire y plancha al revés.' },
  { q: '¿Pueden pintar logotipos de marcas o artistas?', a: 'No reproducimos logotipos registrados para su venta. Podemos crear una ilustración original inspirada en lo que te gusta.' },
  { q: '¿Qué formas de pago aceptan?', a: 'Transferencia bancaria, enlace de pago con tarjeta y efectivo en entregas en persona.' },
]

export function Preguntas() {
  usePageMeta('Preguntas frecuentes')
  return (
    <LegalPage eyebrow="Ayuda" title={<>Preguntas <span className="italic">frecuentes</span></>}>
      <div className="not-prose flex flex-col border-b border-borgona mt-4">
        {faqs.map((f) => (
          <details key={f.q} className="group border-t border-borgona">
            <summary className="flex items-center justify-between gap-6 min-h-[64px] cursor-pointer list-none text-[16px] font-semibold">
              {f.q}
              <svg className="jl-plus flex-none group-open:rotate-45" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </summary>
            <p className="m-0 pb-6 text-[15px] leading-[1.8]">{f.a}</p>
          </details>
        ))}
      </div>
    </LegalPage>
  )
}
