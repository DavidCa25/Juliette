import { useEffect } from 'react'
import { site } from '../config/site'

/** Título y descripción por página (SEO básico y pestañas del navegador). */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${site.name}` : `${site.name} · ${site.tagline}`
    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', description)
    }
  }, [title, description])
}
