import 'temporal-polyfill/global'
import '@formatjs/intl-durationformat/polyfill'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { App } from './App'

hydrateRoot(
  document.getElementById('root'),
  <StrictMode>
    <App />
  </StrictMode>,
)
