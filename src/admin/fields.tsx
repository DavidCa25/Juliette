import { useId, useState, type ReactNode } from 'react'
import { uploadFile } from './client'

export function Field({ label, hint, children, id }: { label: string; hint?: string; children: ReactNode; id: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="jl-label">{label}</label>
      {children}
      {hint && <span className="text-[12px] leading-snug opacity-80">{hint}</span>}
    </div>
  )
}

export function Text({ label, value, onChange, hint, multiline, placeholder }: { label: string; value: string; onChange: (v: string) => void; hint?: string; multiline?: boolean; placeholder?: string }) {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint}>
      {multiline ? (
        <textarea id={id} rows={4} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="jl-field resize-y" />
      ) : (
        <input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="jl-field" />
      )}
    </Field>
  )
}

export function NumberField({ label, value, onChange, hint, optional }: { label: string; value: number | null; onChange: (v: number | null) => void; hint?: string; optional?: boolean }) {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint}>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={value ?? ''}
        placeholder={optional ? 'Vacío = por confirmar' : ''}
        onChange={(e) => onChange(e.target.value === '' ? (optional ? null : 0) : Number(e.target.value))}
        className="jl-field"
      />
    </Field>
  )
}

export function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const id = useId()
  return (
    <Field id={id} label={label}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="jl-field cursor-pointer">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  )
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId()
  return (
    <label htmlFor={id} className="flex items-start justify-between gap-6 py-3 border-t border-borgona/25 cursor-pointer">
      <span className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold">{label}</span>
        {hint && <span className="text-[12px] opacity-80">{hint}</span>}
      </span>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 w-5 h-5 accent-[#82001a] cursor-pointer" />
    </label>
  )
}

/** Botón para subir un archivo a la nube, con progreso y errores. */
export function UploadButton({ accept, folder, onUploaded, label, multiple }: { accept: string; folder: 'productos' | 'videos' | 'ajustes'; onUploaded: (url: string, file: File) => void; label: string; multiple?: boolean }) {
  const id = useId()
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setError('')
    for (const f of Array.from(files)) {
      if (f.size > 60 * 1024 * 1024) {
        setError(`"${f.name}" pesa más de 60 MB.`)
        continue
      }
      try {
        setProgress(0)
        const url = await uploadFile(f, folder, setProgress)
        onUploaded(url, f)
      } catch (e) {
        setError((e as Error).message || 'No se pudo subir el archivo.')
      } finally {
        setProgress(null)
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={`jl-btn inline-flex self-start items-center gap-3 min-h-[46px] px-6 rounded-full border border-borgona text-borgona text-[14px] font-semibold cursor-pointer ${progress !== null ? 'pointer-events-none opacity-70' : ''}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></svg>
        {progress !== null ? `Subiendo… ${progress}%` : label}
      </label>
      <input id={id} type="file" accept={accept} multiple={multiple} className="sr-only" onChange={(e) => { onFiles(e.target.files); e.target.value = '' }} />
      {error && <p role="alert" className="m-0 text-[13px] font-semibold">{error}</p>}
    </div>
  )
}
