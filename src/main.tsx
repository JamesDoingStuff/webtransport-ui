import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, DiamondTheme } from '@diamondlightsource/sci-react-ui'
import App from './WTApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={DiamondTheme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
