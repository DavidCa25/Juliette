/**
 * Vista 3D de las piezas: el cliente la gira con el dedo o el mouse y ve su diseño estampado al frente.
 * Con `paint`, además se puede pintar y poner stickers directo sobre la pieza en 3D.
 *
 * Rendimiento:
 * - three.js y los modelos solo se descargan al abrir la vista 3D (o al pasar sobre el botón "3D").
 * - Cada modelo se descarga una vez y queda en memoria: cambiar de pieza y regresar es instantáneo.
 * - Solo se dibuja cuando algo cambia y la vista está en pantalla; fuera de pantalla queda en pausa.
 */
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import type { Stroke } from '../../data/design'
import { DESIGN_BOX, serializeWithFonts, type DrawTool } from './ToteCanvas'

/** Modelo 3D de cada tipo de pieza. Para agregar otra pieza basta con sumar su archivo aquí. */
const MODELS: Record<string, string> = { tote: '/media/3d/tote.glb' }
/** Tono de la tela que se multiplica sobre la textura original (lona natural). */
const tints: Record<string, string> = { 'tote-natural': '#ffffff', 'tote-negra': '#3a3434', 'tote-mezclilla': '#86a7cc' }

export const has3D = (kind: string) => kind in MODELS

// ---- Caché de modelos (se comparte entre todas las vistas 3D de la página) ----
const cache = new Map<string, Promise<GLTF>>()
function loadModel(kind: string) {
  const url = MODELS[kind]
  if (!url) return Promise.reject(new Error('Sin modelo 3D'))
  if (!cache.has(url)) {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    const p = loader.loadAsync(url)
    p.catch(() => cache.delete(url))
    cache.set(url, p)
  }
  return cache.get(url)!
}
/** Descarga el modelo por adelantado (por ejemplo, al pasar el dedo o el mouse sobre el botón "3D"). */
export function preload(kind = 'tote') {
  loadModel(kind).catch(() => undefined)
}

const [BX, BY, BW, BH] = DESIGN_BOX
// 768 px de ancho: nítido para el tamaño en pantalla y casi la mitad de datos que subir a la gráfica
const TEX_W = 768
const TEX_H = Math.round((TEX_W * BH) / BW)

/** Convierte la capa del diseño (SVG) en una imagen con fondo transparente. */
async function rasterize(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('width', String(TEX_W))
  clone.setAttribute('height', String(TEX_H))
  const url = URL.createObjectURL(new Blob([await serializeWithFonts(clone)], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = new Image()
    await new Promise<void>((res, rej) => {
      img.onload = () => res()
      img.onerror = () => rej(new Error('No se pudo preparar el diseño'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = TEX_W
    canvas.height = TEX_H
    canvas.getContext('2d')!.drawImage(img, 0, 0, TEX_W, TEX_H)
    return canvas
  } finally {
    URL.revokeObjectURL(url)
  }
}

type Props = {
  kind: string
  surface: string
  getDesignSvg: () => SVGSVGElement | null
  version: string
  /** Si se pasa, se puede pintar sobre la pieza (los trazos usan las mismas herramientas del estudio). */
  paint?: DrawTool
}

export default function Tote3D({ kind, surface, getDesignSvg, version, paint }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<{ applyDesign: (c: HTMLCanvasElement) => void; tint: (hex: string) => void } | null>(null)
  const paintRef = useRef<DrawTool | undefined>(paint)
  paintRef.current = paint
  const [status, setStatus] = useState<'cargando' | 'listo' | 'error'>('cargando')
  const painting = !!paint

  useEffect(() => {
    const el = host.current
    if (!el) return
    let disposed = false
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      setStatus('error')
      return
    }
    renderer.setPixelRatio(Math.min(1.75, window.devicePixelRatio || 1))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.touchAction = 'none'
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(0.6, 1.2, 1.4)
    scene.add(key, new THREE.HemisphereLight(0xfff4ea, 0x5f272d, 0.6))

    const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 10)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minPolarAngle = Math.PI / 2 - 0.45
    controls.maxPolarAngle = Math.PI / 2 + 0.25
    controls.autoRotate = !paintRef.current
    controls.autoRotateSpeed = 1.2
    controls.addEventListener('start', () => (controls.autoRotate = false))

    // ---- Dibujo bajo demanda: solo cuando hay cambios y la vista está en pantalla ----
    let dirty = true
    let visible = true
    let raf = 0
    let liveTexture: THREE.CanvasTexture | null = null
    let texDirty = false
    const frame = () => {
      raf = 0
      if (disposed || !visible || document.hidden) return
      const moved = controls.update()
      if (texDirty && liveTexture) {
        // La textura se sube a la gráfica como mucho una vez por cuadro, aunque haya varios movimientos
        liveTexture.needsUpdate = true
        texDirty = false
        dirty = true
      }
      if (moved || dirty) {
        renderer.render(scene, camera)
        dirty = false
      }
      // Sigue animando solo mientras gira sola o la inercia del arrastre se está deteniendo
      if (moved || controls.autoRotate) raf = requestAnimationFrame(frame)
    }
    const invalidate = () => {
      dirty = true
      if (!raf) raf = requestAnimationFrame(frame)
    }
    controls.addEventListener('change', invalidate)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) invalidate()
    })
    io.observe(el)
    const onVis = () => !document.hidden && invalidate()
    document.addEventListener('visibilitychange', onVis)

    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = `${w}px`
      renderer.domElement.style.height = `${h}px`
      camera.aspect = w / Math.max(1, h)
      camera.updateProjectionMatrix()
      invalidate()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    const owned: { dispose: () => void }[] = [envTex, pmrem]
    const teardownPaint: (() => void)[] = []

    loadModel(kind)
      .then((gltf) => {
        if (disposed) return
        // Copia del modelo en caché: la geometría y las texturas se comparten, el material es propio
        const model = gltf.scene.clone(true)
        let mesh: THREE.Mesh | null = null
        model.traverse((o) => {
          const m = o as THREE.Mesh
          if (m.isMesh && !mesh) {
            mesh = m
            const mat = (m.material as THREE.MeshStandardMaterial).clone()
            mat.roughness = 1
            mat.metalness = 0
            m.material = mat
            owned.push(mat)
          }
        })
        if (!mesh) return setStatus('error')
        const m = mesh as THREE.Mesh
        const mat = m.material as THREE.MeshStandardMaterial

        // Centra el modelo y ubica el frente del cuerpo (sin asas) para estampar el diseño
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        scene.add(model)
        model.updateMatrixWorld(true)
        const size = box.getSize(new THREE.Vector3())
        const pos = m.geometry.getAttribute('position')
        const v = new THREE.Vector3()
        let bodyTop = -Infinity
        let frontZ = -Infinity
        for (let i = 0; i < pos.count; i += 3) {
          v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld)
          if (Math.abs(v.x) > size.x * 0.38) bodyTop = Math.max(bodyTop, v.y)
          if (Math.abs(v.x) < size.x * 0.15 && v.y < 0) frontZ = Math.max(frontZ, v.z)
        }
        const bottom = -size.y / 2
        const bodyH = bodyTop - bottom
        const decalW = size.x * 0.8
        const decalH = Math.min(bodyH * 0.9, (decalW * BH) / BW)
        const decalCenter = new THREE.Vector3(0, bottom + bodyH * 0.5, frontZ)

        // El diseño se dibuja en un lienzo que sirve de textura; al pintar se le agregan los trazos en vivo
        const texCanvas = document.createElement('canvas')
        texCanvas.width = TEX_W
        texCanvas.height = TEX_H
        const texCtx = texCanvas.getContext('2d')!
        let base: HTMLCanvasElement | null = null
        const texture = new THREE.CanvasTexture(texCanvas)
        liveTexture = texture
        const markTex = () => {
          texDirty = true
          invalidate()
        }
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
        const decalMat = new THREE.MeshStandardMaterial({ map: texture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, roughness: 0.95, metalness: 0 })
        const decalGeo = new DecalGeometry(m, decalCenter, new THREE.Euler(0, 0, 0), new THREE.Vector3(decalW, decalH, size.z * 1.2))
        const decal = new THREE.Mesh(decalGeo, decalMat)
        scene.add(decal)
        owned.push(texture, decalMat, decalGeo)

        const drawBase = () => {
          texCtx.clearRect(0, 0, TEX_W, TEX_H)
          if (base) texCtx.drawImage(base, 0, 0)
        }
        api.current = {
          applyDesign: (canvas) => {
            base = canvas
            drawBase()
            markTex()
          },
          tint: (hex) => {
            mat.color.set(hex)
            invalidate()
          },
        }

        // ---- Pintar sobre la pieza 3D ----
        const raycaster = new THREE.Raycaster()
        const ndc = new THREE.Vector2()
        /** Punto de la pantalla → coordenadas del diseño (las mismas del lienzo plano, 600 × 740). */
        const frontPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -frontZ)
        const planeHit = new THREE.Vector3()
        const setRay = (e: PointerEvent) => {
          const r = renderer.domElement.getBoundingClientRect()
          ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
          raycaster.setFromCamera(ndc, camera)
        }
        const mapPoint = (pt: THREE.Vector3): [number, number] | null => {
          const u = (pt.x - decalCenter.x) / decalW + 0.5
          const vv = 0.5 - (pt.y - decalCenter.y) / decalH
          if (u < -0.02 || u > 1.02 || vv < -0.02 || vv > 1.02) return null
          return [Math.round((BX + Math.min(1, Math.max(0, u)) * BW) * 10) / 10, Math.round((BY + Math.min(1, Math.max(0, vv)) * BH) * 10) / 10]
        }
        /** Al empezar: se revisa contra el modelo real (para saber si se tocó el frente y no la espalda). */
        const toDesign = (e: PointerEvent): [number, number] | null => {
          setRay(e)
          const hit = raycaster.intersectObject(m, false)[0]
          if (!hit || !hit.face) return null
          const n = hit.face.normal.clone().transformDirection(m.matrixWorld)
          if (n.z < 0.15) return null
          return mapPoint(hit.point)
        }
        /** Mientras se arrastra: basta el plano del frente, mucho más rápido que revisar los 40 mil triángulos. */
        const toDesignFast = (e: PointerEvent): [number, number] | null => {
          setRay(e)
          return raycaster.ray.intersectPlane(frontPlane, planeHit) ? mapPoint(planeHit) : null
        }
        const toTex = (x: number, y: number) => [((x - BX) / BW) * TEX_W, ((y - BY) / BH) * TEX_H]
        const mirrorX = (x: number) => Math.round((600 - x) * 10) / 10
        let live: number[] | null = null
        let pointer = -1
        /** Dibuja solo el tramo nuevo del trazo (no todo el lienzo) en cada movimiento. */
        const drawSegment = (from: number, to: number) => {
          const t = paintRef.current
          if (!t || !live) return
          const k = TEX_W / BW
          const lines = t.mirror ? [live, live.map((val, i) => (i % 2 === 0 ? mirrorX(val) : val))] : [live]
          texCtx.save()
          texCtx.lineCap = 'round'
          texCtx.lineJoin = 'round'
          texCtx.lineWidth = t.size * k * (t.brush === 'acuarela' ? 1.4 : t.brush === 'marcador' ? 1.3 : 1)
          texCtx.globalAlpha = t.brush === 'goma' ? 1 : t.opacity * (t.brush === 'acuarela' ? 0.45 : t.brush === 'marcador' ? 0.55 : 1)
          texCtx.globalCompositeOperation = t.brush === 'goma' ? 'destination-out' : 'source-over'
          texCtx.strokeStyle = t.color
          for (const line of lines) {
            texCtx.beginPath()
            const [x0, y0] = toTex(line[from], line[from + 1])
            texCtx.moveTo(x0, y0)
            if (to === from) texCtx.lineTo(x0 + 0.1, y0)
            else {
              const [x1, y1] = toTex(line[to], line[to + 1])
              texCtx.lineTo(x1, y1)
            }
            texCtx.stroke()
          }
          texCtx.restore()
          markTex()
        }
        const onDown = (e: PointerEvent) => {
          const t = paintRef.current
          if (!t) return
          const p = toDesign(e)
          if (!p) return // fuera del frente: se usa para girar la pieza
          e.preventDefault()
          e.stopImmediatePropagation()
          controls.enabled = false
          if (t.mode === 'sticker') {
            const st: Stroke = { t: 'stamp', c: t.color, k: t.sticker, x: p[0], y: p[1], s: t.stickerSize / 12, r: t.rotation }
            t.onAdd(t.mirror ? [st, { ...st, x: mirrorX(p[0]), r: -t.rotation, f: true }] : [st])
            controls.enabled = true
            return
          }
          pointer = e.pointerId
          try {
            renderer.domElement.setPointerCapture(e.pointerId)
          } catch {
            /* algunos navegadores no permiten capturar este puntero */
          }
          live = [p[0], p[1]]
          drawSegment(0, 0)
        }
        const onMove = (e: PointerEvent) => {
          if (!live || e.pointerId !== pointer) return
          const p = toDesignFast(e)
          if (!p) return
          const lx = live[live.length - 2]
          const ly = live[live.length - 1]
          if (Math.hypot(p[0] - lx, p[1] - ly) < 2.2) return
          live.push(p[0], p[1])
          drawSegment(live.length - 4, live.length - 2)
        }
        const onUp = (e: PointerEvent) => {
          if (e.pointerId !== pointer) return
          pointer = -1
          controls.enabled = true
          const t = paintRef.current
          if (!live || !t) return
          const pts = live.length >= 4 ? live : [...live, live[0] + 0.1, live[1]]
          live = null
          const snap = document.createElement('canvas')
          snap.width = TEX_W
          snap.height = TEX_H
          snap.getContext('2d')!.drawImage(texCanvas, 0, 0)
          base = snap
          const st: Stroke = { t: 'line', b: t.brush, c: t.color, w: t.size, o: t.opacity, p: pts }
          t.onAdd(t.mirror ? [st, { ...st, p: pts.map((val, i) => (i % 2 === 0 ? mirrorX(val) : val)) }] : [st])
        }
        // Se registra antes que los controles para poder decidir si el gesto pinta o gira
        renderer.domElement.addEventListener('pointerdown', onDown, { capture: true })
        renderer.domElement.addEventListener('pointermove', onMove)
        renderer.domElement.addEventListener('pointerup', onUp)
        renderer.domElement.addEventListener('pointercancel', onUp)
        teardownPaint.push(() => {
          renderer.domElement.removeEventListener('pointerdown', onDown, { capture: true })
          renderer.domElement.removeEventListener('pointermove', onMove)
          renderer.domElement.removeEventListener('pointerup', onUp)
          renderer.domElement.removeEventListener('pointercancel', onUp)
        })

        const dist = (size.y / 2 / Math.tan((camera.fov * Math.PI) / 360)) * 1.35
        camera.position.set(0, size.y * 0.05, dist)
        controls.target.set(0, 0, 0)
        controls.minDistance = dist * 0.6
        controls.maxDistance = dist * 1.6
        controls.update()
        setStatus('listo')
        invalidate()
      })
      .catch(() => !disposed && setStatus('error'))

    return () => {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      teardownPaint.forEach((f) => f())
      controls.dispose()
      owned.forEach((o) => o.dispose())
      renderer.dispose()
      renderer.domElement.remove()
      api.current = null
    }
  }, [kind])

  useEffect(() => {
    if (status === 'listo') api.current?.tint(tints[surface] ?? '#ffffff')
  }, [surface, status])

  // El diseño se vuelve a estampar cuando cambia (con una pequeña espera para no recalcular en cada trazo)
  useEffect(() => {
    if (status !== 'listo') return
    const t = window.setTimeout(async () => {
      const svg = getDesignSvg()
      if (!svg) return
      try {
        api.current?.applyDesign(await rasterize(svg))
      } catch {
        /* si falla, se queda el último diseño */
      }
    }, painting ? 900 : 200)
    return () => window.clearTimeout(t)
  }, [version, status, getDesignSvg, painting])

  return (
    <div className="absolute inset-0">
      <div ref={host} className={`absolute inset-0 ${paint ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`} aria-label={paint ? 'Pinta directo sobre la pieza en 3D. Arrastra fuera de la pieza para girarla.' : 'Vista 3D de tu pieza. Arrastra para girarla.'} role="img" />
      {status === 'cargando' && <p className="absolute inset-0 m-0 flex items-center justify-center text-crema text-[13px] tracking-[2px] uppercase font-semibold">Cargando 3D…</p>}
      {status === 'error' && <p className="absolute inset-0 m-0 flex items-center justify-center text-center px-8 text-crema text-[14px]">Tu navegador no puede mostrar la vista 3D. Usa la vista plana.</p>}
      {status === 'listo' && (
        <p className="pointer-events-none absolute left-0 right-0 bottom-3 m-0 text-center text-crema/80 text-[12px] tracking-[1.5px] uppercase font-semibold">
          {paint ? 'Pinta sobre el frente · arrastra el fondo para girarla' : 'Arrastra para girarla'}
        </p>
      )}
    </div>
  )
}
