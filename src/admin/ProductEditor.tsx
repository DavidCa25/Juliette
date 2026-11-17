import type { AdminProduct } from './client'
import { NumberField, Select, Text, Toggle, UploadButton } from './fields'

const categoryOptions = [
  { value: 'tote', label: 'Tote bag' },
  { value: 'prenda', label: 'Prenda (chamarra, camisa, sudadera…)' },
  { value: 'cuadro', label: 'Cuadro / lienzo' },
  { value: 'agenda', label: 'Agenda / papelería' },
  { value: 'accesorio', label: 'Accesorio' },
  { value: 'hogar', label: 'Hogar' },
  { value: 'otro', label: 'Otra pieza' },
]
const statusOptions = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'bajo-pedido', label: 'Bajo pedido' },
  { value: 'agotado', label: 'Agotado' },
]

export function ProductEditor({ product, isNew, onChange, onClose, onDelete }: { product: AdminProduct; isNew: boolean; onChange: (p: AdminProduct) => void; onClose: () => void; onDelete: () => void }) {
  const set = <K extends keyof AdminProduct>(k: K, v: AdminProduct[K]) => onChange({ ...product, [k]: v })
  const move = (i: number, d: -1 | 1) => {
    const imgs = [...product.images]
    const j = i + d
    if (j < 0 || j >= imgs.length) return
    ;[imgs[i], imgs[j]] = [imgs[j], imgs[i]]
    set('images', imgs)
  }

  return (
    <section aria-labelledby="pe-title" className="jl-fade flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <button type="button" onClick={onClose} className="jl-link self-start bg-transparent border-0 p-0 text-borgona text-[14px] font-semibold cursor-pointer">← Volver a productos</button>
          <h2 id="pe-title" className="m-0 font-display font-light text-[clamp(38px,4vw,56px)] leading-none">{product.name || 'Nueva pieza'}</h2>
          <span className="text-[13px]">Dirección: /producto/{product.slug || '…'}{isNew ? ' (se crea con el nombre)' : ''}</span>
        </div>
        <button type="button" onClick={onDelete} className="jl-link bg-transparent border-0 p-0 text-borgona text-[14px] font-semibold cursor-pointer">Eliminar esta pieza</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
        <Text label="Nombre" value={product.name} onChange={(v) => set('name', v)} placeholder="Ej. Polillas" />
        <Text label="Código" value={product.code} onChange={(v) => set('code', v)} placeholder="Ej. JLT-TB-003" />
        <Select label="Tipo de pieza" value={product.category} onChange={(v) => set('category', v)} options={categoryOptions} />
        <Text label="Colección" value={product.collection} onChange={(v) => set('collection', v)} />
        <NumberField label="Precio (MXN)" optional value={product.price} onChange={(v) => set('price', v)} hint="Déjalo vacío para mostrar “por confirmar”." />
        <Select label="Disponibilidad" value={product.status} onChange={(v) => set('status', v)} options={statusOptions} />
        <Text label="Resumen corto" value={product.short} onChange={(v) => set('short', v)} placeholder="Ej. Lona de algodón · 38 × 42 cm" />
        <NumberField label="Orden" value={product.order} onChange={(v) => set('order', v ?? 10)} hint="Número menor aparece primero." />
      </div>

      <Text label="Descripción" multiline value={product.description} onChange={(v) => set('description', v)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-6">
        <Text label="Medidas" value={product.dimensions} onChange={(v) => set('dimensions', v)} />
        <Text label="Material" value={product.material} onChange={(v) => set('material', v)} />
        <Text label="Técnica" value={product.technique} onChange={(v) => set('technique', v)} />
      </div>

      <div className="flex flex-col">
        <Toggle label="Mostrar en el inicio" checked={product.featured} onChange={(v) => set('featured', v)} hint="El inicio muestra las dos primeras piezas destacadas." />
        <Toggle label="Acepta personalización" checked={product.personalizable} onChange={(v) => set('personalizable', v)} hint="Permite pedirla con nombre, frase o diseño a medida." />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="jl-label">Fotos</span>
            <span className="text-[12px] opacity-80">La primera es la portada. Ideal: vertical 4:5 sobre fondo borgoña. Se optimizan solas al subir.</span>
          </div>
          <UploadButton accept="image/*" multiple folder="productos" label="Subir fotos" onUploaded={(url) => onChange({ ...product, images: [...product.images, { src: url, alt: product.name }] })} />
        </div>
        {product.images.length === 0 ? (
          <p className="m-0 text-[14px] border border-dashed border-borgona/50 rounded-[18px] p-6 text-center">Aún no hay fotos. Sube al menos una.</p>
        ) : (
          <ul className="m-0 p-0 list-none grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {product.images.map((img, i) => (
              <li key={img.src + i} className="flex flex-col gap-2">
                <div className="relative aspect-[4/5] rounded-t-full overflow-hidden bg-vino">
                  <img src={img.src} alt="" className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute left-2 top-2 bg-crema px-3 py-1 rounded-full text-[11px] font-semibold">Portada</span>}
                </div>
                <input aria-label={`Descripción de la foto ${i + 1}`} value={img.alt} onChange={(e) => set('images', product.images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} placeholder="Descripción de la foto" className="jl-field text-[13px]!" />
                <div className="flex items-center justify-between text-[13px] font-semibold">
                  <span className="flex gap-3">
                    <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Mover antes" className="bg-transparent border-0 p-1 text-borgona cursor-pointer disabled:opacity-30">←</button>
                    <button type="button" disabled={i === product.images.length - 1} onClick={() => move(i, 1)} aria-label="Mover después" className="bg-transparent border-0 p-1 text-borgona cursor-pointer disabled:opacity-30">→</button>
                  </span>
                  <button type="button" onClick={() => set('images', product.images.filter((_, j) => j !== i))} className="jl-link bg-transparent border-0 p-0 text-borgona cursor-pointer">Quitar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="jl-label">Video (opcional)</span>
            <span className="text-[12px] opacity-80">MP4 corto y sin sonido. Recomendado: menos de 15 MB.</span>
          </div>
          <UploadButton accept="video/mp4,video/webm" folder="videos" label={product.video ? 'Cambiar video' : 'Subir video'} onUploaded={(url) => set('video', url)} />
        </div>
        {product.video && (
          <div className="flex flex-wrap items-center gap-5">
            <video src={product.video} muted loop playsInline autoPlay className="w-[260px] aspect-video object-cover rounded-[16px] bg-vino" />
            <button type="button" onClick={() => set('video', null)} className="jl-link bg-transparent border-0 p-0 text-borgona text-[13px] font-semibold cursor-pointer">Quitar video</button>
          </div>
        )}
      </div>
    </section>
  )
}
