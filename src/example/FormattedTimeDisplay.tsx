import { useNowMemo } from '../useNow'

export type FormattedTimeDisplayProps = {
  msInterval: number
}

const format = (time: number) => new Date(time).toString()

export const FormattedTimeDisplay = ({
  msInterval,
}: FormattedTimeDisplayProps) => (
  <p suppressHydrationWarning>
    <code>useNowMemo(time =&gt; new Date(time).toString(), {msInterval})</code>:
    <br />
    {useNowMemo(format)}
  </p>
)
