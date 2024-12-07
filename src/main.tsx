import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { NowContext } from './useNow'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NowContext.Provider value={undefined}>
      <App />
    </NowContext.Provider>
  </StrictMode>,
)
