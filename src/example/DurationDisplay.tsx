import { Temporal } from 'temporal-polyfill'
import { SmallestUnit, useDuration } from '../useNow'

export const durationFormat = new Intl.DurationFormat('ja-JP')

export type DurationDisplayProps = Temporal.DurationRoundTo & {
  from: Temporal.Instant
  smallestUnit: SmallestUnit
}
export const DurationDisplay = ({
  from,
  smallestUnit,
  // @ts-ignore
  ...args
}: DurationDisplayProps) => {
  const since = useDuration(from, null, smallestUnit)?.round({
    smallestUnit,
    ...args,
  })
  return (
    <p suppressHydrationWarning>
      <code>
        useDuration(from={from.toString()}, to=null, smallestUnit={smallestUnit}
        )
      </code>
      : {since ? durationFormat.format(since) : 'not supported'}
    </p>
  )
}
