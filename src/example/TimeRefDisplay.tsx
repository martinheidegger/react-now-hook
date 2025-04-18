import { useNowInnerTextRef } from '../useNow'

export type TimeRefDisplayProps = {
  msInterval: number
}
export const TimeRefDisplay = ({ msInterval }: TimeRefDisplayProps) => {
  const ref = useNowInnerTextRef<HTMLParagraphElement>(
    (now) => `${now}`,
    msInterval,
  )
  return <p ref={ref} />
}
