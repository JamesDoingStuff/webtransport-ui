import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './WTApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
