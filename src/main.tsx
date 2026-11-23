import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import { Layout } from './components/layout/Layout'
import { CartProvider } from './state/cart'
import { ConsentProvider } from './state/consent'
import Home from './pages/Home'
import ErrorPage from './pages/ErrorPage'
import NotFound from './pages/NotFound'
import { initMonitoring, wrapRouter } from './lib/monitoring'

initMonitoring()

// Si la página cargó bien, se permite otra recarga automática en el futuro.
window.addEventListener('load', () => window.setTimeout(() => sessionStorage.removeItem('jl-reloaded'), 10000))

// Las páginas secundarias se cargan solo cuando se visitan (archivos más ligeros).
const Coleccion = lazy(() => import('./pages/Coleccion'))
const Producto = lazy(() => import('./pages/Producto'))
const Disena = lazy(() => import('./pages/Disena'))
const Carrito = lazy(() => import('./pages/Carrito'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Confirmacion = lazy(() => import('./pages/Confirmacion'))
const legal = () => import('./pages/Legal')
const Terminos = lazy(() => legal().then((m) => ({ default: m.Terminos })))
const Reembolsos = lazy(() => legal().then((m) => ({ default: m.Reembolsos })))
const Privacidad = lazy(() => legal().then((m) => ({ default: m.Privacidad })))
const Cookies = lazy(() => legal().then((m) => ({ default: m.Cookies })))
const Envios = lazy(() => legal().then((m) => ({ default: m.Envios })))
const Preguntas = lazy(() => legal().then((m) => ({ default: m.Preguntas })))

const Admin = lazy(() => import('./admin/Admin'))

const router = wrapRouter(createBrowserRouter)([
  {
    path: '/admin',
    errorElement: <ErrorPage />,
    element: (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ),
  },
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/coleccion', element: <Coleccion /> },
      { path: '/coleccion/:categoria', element: <Coleccion /> },
      { path: '/producto/:slug', element: <Producto /> },
      { path: '/design', element: <Disena /> },
      { path: '/carrito', element: <Carrito /> },
      { path: '/checkout', element: <Checkout /> },
      { path: '/pedido/confirmado', element: <Confirmacion /> },
      { path: '/terminos', element: <Terminos /> },
      { path: '/reembolsos', element: <Reembolsos /> },
      { path: '/privacidad', element: <Privacidad /> },
      { path: '/cookies', element: <Cookies /> },
      { path: '/envios', element: <Envios /> },
      { path: '/preguntas-frecuentes', element: <Preguntas /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConsentProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </ConsentProvider>
  </StrictMode>,
)
