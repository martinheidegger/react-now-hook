import { DurationDisplay, durationFormat } from './DurationDisplay'
import { FormattedTimeDisplay } from './FormattedTimeDisplay'
import { TimeDisplay } from './TimeDisplay'
import { TimeRefDisplay } from './TimeRefDisplay'
import {
  NowProvider,
  NowSpan,
  DurationSpan,
  supportsInstant,
  useDurationEffect,
  HTML_FORMAT,
  type NowFormat,
  type DurationFormat,
} from '../useNow'
import { Temporal } from 'temporal-polyfill'
import {
  KeyboardEvent,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

const epoch = Temporal.Instant.fromEpochMilliseconds(0)
const twoWeeksLater = Temporal.Instant.fromEpochMilliseconds(
  2 * 7 * 24 * 60 * 60 * 1000,
)
const dateFormat = new Intl.DateTimeFormat('ja-JP', {
  timeStyle: 'short',
  dateStyle: 'long',
})
const relativeTo = Temporal.Now.zonedDateTimeISO('Asia/Tokyo')
const durationSpanFormat = (duration: Temporal.Duration | null) =>
  duration
    ? durationFormat.format(
        duration.round({
          largestUnit: 'weeks',
          relativeTo,
        }),
      )
    : 'not supported'

const durationHtmlFormat = (duration: Temporal.Duration | null) =>
  duration
    ? `<em style="text-decoration: underline">${duration.round('day').toString()}</em>`
    : 'not supported'
durationHtmlFormat[HTML_FORMAT] = true

const CustomHTMLFormatter: NowFormat = (time: number) =>
  `<code>&lt;<i>NowSpan</i> msInterval=250 style={{background: 'lightgreen'}} format={CustomHTMLFormatter} /&gt</code>: ${time.toString(16)}`

// HTML is unsafe. Needs to be specifically enabled.
CustomHTMLFormatter[HTML_FORMAT] = true

const IntlFormat = () => (
  <p>
    <code>
      &lt;NowSpan format=
      {
        "new Intl.DateTimeFormat('ja-JP', { timeStyle: 'short', dateStyle: 'long' })"
      }{' '}
      /&gt;
    </code>
    : <NowSpan format={dateFormat} msInterval={60 * 1000} />
  </p>
)

const DurationFormat = ({
  from,
  to,
  format,
}: {
  from?: Temporal.Instant
  to?: Temporal.Instant
  format?: DurationFormat
}) => {
  format = format ?? durationSpanFormat
  return (
    <p>
      <code>
        &lt;DurationSpan{' '}
        {from ? `from=${from.toString()}` : to ? `to=${to.toString()}` : ''}{' '}
        smallestUnit="hour" format=
        {`{${typeof format === 'function' ? format.name : String(format)}}`}
        /&gt;
      </code>
      : <DurationSpan from={from} to={to} smallestUnit="hour" format={format} />
    </p>
  )
}

const SimpleNowSpan = memo(({ msInterval }: { msInterval: number }) => (
  <p>
    <code>&lt;NowSpan msInterval={msInterval}/&gt;</code>:{' '}
    <NowSpan msInterval={msInterval} />
  </p>
))

const ContextExample = () => {
  const [time, setTime] = useState((1000 * 60 * 60 * 24).toString())
  const handleKey = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    setTime((time) => {
      let numberTime = parseInt(time)
      if (isNaN(numberTime)) {
        return time
      }
      const multi = (e.shiftKey ? 1000 : 1) * (e.altKey ? 60 : 1)
      if (e.code === 'ArrowUp') {
        numberTime += 1 * multi
        e.stopPropagation()
        e.preventDefault()
      } else if (e.code === 'ArrowDown') {
        numberTime -= 1 * multi
        e.stopPropagation()
        e.preventDefault()
      }
      return numberTime.toString()
    })
  }, [])
  const numberTime = parseInt(time)
  return (
    <section>
      <code>
        &lt;NowProvider time=
        <input
          value={time}
          onKeyDown={handleKey}
          onChange={(event) => setTime(event.target.value)}
        />{' '}
        &gt;
      </code>
      <NowProvider
        time={time === '' ? undefined : isNaN(numberTime) ? 0 : numberTime}
      >
        <div style={{ marginLeft: 30 }}>
          <FormattedTimeDisplay msInterval={1000} />
          <SimpleNowSpan msInterval={10} />
          <DurationFormat from={epoch} />
          <DurationFormat to={twoWeeksLater} />
        </div>
      </NowProvider>
      <code>&lt;/NowProvider&gt;</code>
    </section>
  )
}

export const App = () => {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    console.log({ 'ref.current': ref.current })
  })
  useDurationEffect(
    Temporal.Now.instant(),
    Temporal.Now.instant(),
    'week',
    (duration) => {
      console.log({ duration })
    },
  )
  return (
    <>
      <p>
        Example page for{' '}
        <a
          href="https://github.com/martinheidegger/react-now-hook"
          target="_blank"
          rel="noreferrer"
        >
          github.com/martinheidegger/react-now-hook
        </a>
        .
      </p>
      <p>
        Install{' '}
        <a
          href="https://react.dev/learn/react-developer-tools"
          target="_blank"
          rel="noreferrer"
        >
          React Developer Tools
        </a>{' '}
        for better analysis of behavior.
      </p>
      <p suppressHydrationWarning>
        Environment supports <code>Temporal.Instant</code>:{' '}
        {String(supportsInstant)}
      </p>
      <IntlFormat />
      <TimeDisplay msInterval={1} />
      <TimeRefDisplay msInterval={1} />
      <TimeDisplay msInterval={250} />
      <SimpleNowSpan msInterval={1} />
      <NowSpan
        ref={ref}
        style={{ background: 'lightgreen' }}
        format={CustomHTMLFormatter}
        msInterval={250}
      />
      <DurationDisplay from={epoch} smallestUnit="second" largestUnit="days" />
      <DurationFormat from={epoch} />
      <DurationFormat from={epoch} format={durationFormat} />
      <DurationFormat from={epoch} format={durationHtmlFormat} />
      <TimeDisplay msInterval={500} />
      <TimeDisplay msInterval={1000} />
      <TimeRefDisplay msInterval={1000} />
      <TimeDisplay msInterval={2500} />
      <FormattedTimeDisplay msInterval={1000} />
      <FormattedTimeDisplay msInterval={1000 * 60} />
      <ContextExample />
    </>
  )
}
