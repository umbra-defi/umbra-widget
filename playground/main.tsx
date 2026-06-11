import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

// DEBUG: catch what unloads/reloads the page during claim.
window.addEventListener('beforeunload', () => {
  console.warn('[uw debug] BEFOREUNLOAD — page is about to reload/navigate')
  console.trace('[uw debug] unload trigger')
})
window.addEventListener('error', (e) =>
  console.error('[uw debug] window error', e.message, e.error)
)
window.addEventListener('unhandledrejection', (e) =>
  console.error('[uw debug] unhandledrejection', e.reason)
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
