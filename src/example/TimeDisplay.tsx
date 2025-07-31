import { useNow } from '../useNow'

export type TimeDisplayProps = {
  msInterval: number
}
export const TimeDisplay = ({ msInterval }: TimeDisplayProps) => (
  <p>
    <code>useNow(msInterval={msInterval})</code>:{' '}
    <span suppressHydrationWarning>{useNow(msInterval)}</span>
  </p>
)
