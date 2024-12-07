import { useNow } from './useNow'

export type TimeDisplayProps = {
  msInterval: number
}
export const TimeDisplay = ({ msInterval }: TimeDisplayProps) => (
  <p>{useNow(msInterval)}</p>
)
