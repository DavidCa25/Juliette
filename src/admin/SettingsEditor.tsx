import type { ReactNode } from 'react'
import type { AdminSettings, AdminVideo } from './client'
import { NumberField, Text, UploadButton } from './fields'

type Obj = Record<string, unknown>

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 p-0 border-0 flex flex-col gap-6 border-t border-borgona pt-6">
      <legend className="jl-eyebrow float-left w-full mb-2">{title}</legend>
      <div className="clear-both grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">{children}</div>
    </fieldset>
  )
}

export function SettingsEditor({ settings, onChange }: { settings: AdminSettings; onChange: (s: AdminSettings) => void }) {
  const get = (k: string) => (settings[k] ?? '') as string
  const getN = (k: string) => (settings[k] ?? null) as number | null
  const set = (k: string, v: unknown) => onChange({ ...settings, [k]: v })
  const sub = (k: string) => (settings[k] ?? {}) as Obj
  const setSub = (k: string, f: string, v: unknown) => onChange({ ...settings, [k]: { ...sub(k), [f]: v } })
  const videos = (settings.videos ?? []) as AdminVideo[]
  const setVideo = (i: number, v: Partial<AdminVideo>) => set('videos', videos.map((x, j) => (j === i ? { ...x, ...v } : x)))

  return (
    <section className="jl-fade flex flex-col gap-10" aria-label="Ajustes de la tienda">
      <Group title="Contacto y redes">
        <Text label="WhatsApp (como se muestra)" value={get('whatsappDisplay')} onChange={(v) => set('whatsappDisplay', v)} hint="El número al que llegan los pedidos se configura en Vercel." />
        <Text label="Correo de contacto" value={get('email')} onChange={(v) => set('email', v)} />
        <Text label="Instagram · usuario" value={(sub('instagram').handle as string) ?? ''} onChange={(v) => setSub('instagram', 'handle', v)} />
        <Text label="Instagram · enlace" value={(sub('instagram').url as string) ?? ''} onChange={(v) => setSub('instagram', 'url', v)} />
        <Text label="TikTok · usuario" value={(sub('tiktok').handle as string) ?? ''} onChange={(v) => setSub('tiktok', 'handle', v)} />
        <Text label="TikTok · enlace" value={(sub('tiktok').url as string) ?? ''} onChange={(v) => setSub('tiktok', 'url', v)} />
      </Group>

      <Group title="Entregas y tiempos">
        <Text label="Ciudad" value={get('city')} onChange={(v) => set('city', v)} />
        <Text label="Zona de envío" value={get('shippingZone')} onChange={(v) => set('shippingZone', v)} />
        <Text label="Punto de entrega" value={get('pickupPoint')} onChange={(v) => set('pickupPoint', v)} />
        <NumberField label="Cupo de pedidos por semana" value={getN('weeklySlots')} onChange={(v) => set('weeklySlots', v ?? 0)} />
        <NumberField label="Anticipo para personalizados (%)" value={getN('depositPercent')} onChange={(v) => set('depositPercent', v ?? 0)} />
        <Text label="Días de elaboración · piezas listas" value={get('leadDaysReady')} onChange={(v) => set('leadDaysReady', v)} />
        <Text label="Días de elaboración · personalizadas" value={get('leadDaysCustom')} onChange={(v) => set('leadDaysCustom', v)} />
        <Text label="Días para enviar una pieza lista" value={get('readyShipDays')} onChange={(v) => set('readyShipDays', v)} />
        <NumberField label="Costo de envío (MXN)" optional value={getN('shippingCost')} onChange={(v) => set('shippingCost', v)} hint="Vacío = se cotiza." />
        <NumberField label="Envío gratis desde (MXN)" optional value={getN('freeShippingFrom')} onChange={(v) => set('freeShippingFrom', v)} hint="Vacío = no aplica." />
        <NumberField label="Precio “desde” de una pieza a medida" optional value={getN('customFrom')} onChange={(v) => set('customFrom', v)} />
        <Text label="Próximo lanzamiento" value={get('nextDrop')} onChange={(v) => set('nextDrop', v)} hint="Ej. Diciembre 2026" />
      </Group>

      <Group title="Políticas">
        <NumberField label="Días para cambios" value={(sub('policy').returnDays as number) ?? null} onChange={(v) => setSub('policy', 'returnDays', v ?? 0)} />
        <NumberField label="Horas para reportar daños" value={(sub('policy').damageHours as number) ?? null} onChange={(v) => setSub('policy', 'damageHours', v ?? 0)} />
        <NumberField label="Días para procesar reembolsos" value={(sub('policy').refundDays as number) ?? null} onChange={(v) => setSub('policy', 'refundDays', v ?? 0)} />
        <NumberField label="Días para responder solicitudes de privacidad" value={(sub('policy').privacyDays as number) ?? null} onChange={(v) => setSub('policy', 'privacyDays', v ?? 0)} />
        <Text label="Costo del diseño si se cancela" value={(sub('policy').designFee as string) ?? ''} onChange={(v) => setSub('policy', 'designFee', v)} />
      </Group>

      <Group title="Datos legales">
        <Text label="Nombre o razón social" value={(sub('legal').owner as string) ?? ''} onChange={(v) => setSub('legal', 'owner', v)} />
        <Text label="RFC / ID fiscal" value={(sub('legal').taxId as string) ?? ''} onChange={(v) => setSub('legal', 'taxId', v)} />
        <Text label="Domicilio fiscal" value={(sub('legal').address as string) ?? ''} onChange={(v) => setSub('legal', 'address', v)} />
        <Text label="País" value={(sub('legal').country as string) ?? ''} onChange={(v) => setSub('legal', 'country', v)} />
        <Text label="Fecha de actualización" value={(sub('legal').updated as string) ?? ''} onChange={(v) => setSub('legal', 'updated', v)} />
      </Group>

      <fieldset className="m-0 p-0 border-0 flex flex-col gap-6 border-t border-borgona pt-6">
        <legend className="jl-eyebrow float-left w-full mb-2">Videos del inicio</legend>
        <p className="clear-both m-0 text-[13px]">El primero aparece en grande. Máximo 3.</p>
        <ul className="m-0 p-0 list-none flex flex-col gap-6">
          {videos.map((v, i) => (
            <li key={i} className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start border border-borgona/25 rounded-[20px] p-5">
              <div className="flex flex-col gap-3">
                {v.video ? <video src={v.video} poster={v.poster} muted loop playsInline autoPlay className="w-full aspect-video object-cover rounded-[14px] bg-vino" /> : <div className="w-full aspect-video rounded-[14px] bg-vino" />}
                <UploadButton accept="video/mp4,video/webm" folder="videos" label="Cambiar video" onUploaded={(url) => setVideo(i, { video: url })} />
                <UploadButton accept="image/*" folder="ajustes" label="Cambiar portada" onUploaded={(url) => setVideo(i, { poster: url })} />
              </div>
              <div className="flex flex-col gap-5">
                <Text label="Título" value={v.title} onChange={(t) => setVideo(i, { title: t })} />
                <Text label="Etiqueta" value={v.tag} onChange={(t) => setVideo(i, { tag: t })} />
                <button type="button" onClick={() => set('videos', videos.filter((_, j) => j !== i))} className="jl-link self-start bg-transparent border-0 p-0 text-borgona text-[13px] font-semibold cursor-pointer">Quitar este video</button>
              </div>
            </li>
          ))}
        </ul>
        {videos.length < 3 && (
          <UploadButton accept="video/mp4,video/webm" folder="videos" label="Agregar un video" onUploaded={(url, f) => set('videos', [...videos, { title: f.name.replace(/\.[^.]+$/, ''), tag: 'Diseño Julietté', video: url, poster: '' }])} />
        )}
      </fieldset>
    </section>
  )
}
