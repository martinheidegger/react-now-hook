import { useNowMemo } from '../useNow'

export type FormattedTimeDisplayProps = {
  msInterval: number
}

export const FormattedTimeDisplay = ({
  msInterval,
}: FormattedTimeDisplayProps) => (
  <p>{useNowMemo((time) => new Date(time).toString(), msInterval)}</p>
)
