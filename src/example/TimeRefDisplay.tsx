import { useNowInnerTextRef } from '../useNow'

export type TimeRefDisplayProps = {
  msInterval: number
}
export const TimeRefDisplay = ({ msInterval }: TimeRefDisplayProps) => {
  const ref = useNowInnerTextRef<HTMLSpanElement>((now) => `${now}`, msInterval)
  return (
    <p>
      <code>useNowInnerTextRef(msInterval={msInterval})</code>:{' '}
      <span suppressHydrationWarning ref={ref} />
    </p>
  )
}
