/// <reference types="vite/client" />
import { DurationFormat as PolyDurationFormat } from '@formatjs/intl-durationformat'
declare global {
  namespace Intl {
    const DurationFormat: typeof PolyDurationFormat
  }
}
