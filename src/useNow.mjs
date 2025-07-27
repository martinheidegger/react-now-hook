import {
  useEffect,
  useState,
  createElement,
  useContext,
  createContext,
  useRef,
} from 'react'

export const NowContext = createContext(undefined)

const second = 1000
const minute = 60000
const hour = 3600000
const day = 86400000
const stringInterval = {
  second: second,
  seconds: second,
  minute: minute,
  minutes: minute,
  hour: hour,
  hours: hour,
  day: day,
  days: day,
  week: day,
  weeks: day,
  month: day,
  months: day,
  year: day,
  years: day,
}

export const supportsInstant = !!(
  typeof Temporal !== 'undefined' && typeof Temporal.Instant !== 'undefined'
)

function resolveInterval(msInterval) {
  return stringInterval[msInterval] ?? second
}

function getNow(msInterval, time = Date.now()) {
  return Math.floor(time / msInterval) * msInterval
}

export const getInstant = supportsInstant
  ? (now) => Temporal.Instant.fromEpochMilliseconds(now)
  : (_now) => null

export const getNowInstant = supportsInstant
  ? (msInterval, time) =>
      Temporal.Instant.fromEpochMilliseconds(getNow(msInterval, time))
  : (_msInterval, _time) => null

const checks = new Map()

let active = false
let prev = null
function run() {
  const now = Date.now()
  if (active && now !== prev) {
    prev = now
    for (const [msInterval, check] of checks.entries()) {
      const current = getNow(msInterval, now)
      if (current != check.prev) {
        check.prev = current
        const instant = getInstant(current)
        for (const hook of check.hooks) {
          try {
            hook(current, instant)
          } catch (e) {
            check.hooks.delete(hook)
            console.error(e)
          }
        }
      }
    }
  }
  // The called hooks might deactivate the background process
  if (active) {
    globalThis.requestAnimationFrame(run)
  }
}

export function listen(msInterval, hook) {
  let check = checks.get(msInterval)
  if (!check) {
    check = {
      prev: getNow(msInterval),
      hooks: new Set([hook]),
    }
    checks.set(msInterval, check)
  } else {
    check.hooks.add(hook)
  }
  if (!active) {
    active = true
    prev = null
    globalThis.requestAnimationFrame(run)
  }
  return () => {
    check.hooks.delete(hook)
    if (check.hooks.size === 0) {
      checks.delete(msInterval)
      active = checks.size > 0
    }
  }
}

export function NowSpan({ format, msInterval, ...props }) {
  msInterval = msInterval ?? second
  const ref = useNowInnerTextRef(format, msInterval)
  return createElement('span', {
    suppressHydrationWarning: true,
    ...props,
    ref,
  })
}

export function useNow(msInterval) {
  msInterval = msInterval ?? second
  const override = useContext(NowContext)
  const [now, setNow] = useState(getNow(msInterval, override))
  useNowEffect((time) => setNow(time), msInterval)
  return now
}

export function useInstant(msInterval) {
  msInterval = msInterval ?? second
  const override = useContext(NowContext)
  const now = getNow(msInterval, override)
  const [instant, setInstant] = useState(getInstant(now))
  useNowEffect((_, instant) => setInstant(instant), msInterval)
  return instant
}

function useFormatSetter(ref, format) {
  return useMemo(() => {
    let actual
    if (typeof format === 'function') {
      actual = format
    } else if (
      typeof format === 'object' &&
      typeof format.format === 'function'
    ) {
      actual = (num, tempObj) => format.format(tempObj ? tempObj : num)
    } else {
      throw new Exception('Format should be function or a formatter object')
    }
    return (...args) => {
      if (ref.current) ref.current.innerText = actual(...args)
    }
  }, [format, ref])
}

export function useNowInnerTextRef(format, msInterval, deps) {
  msInterval = msInterval ?? second
  const ref = useRef()
  const override = useContext(NowContext)
  const setter = useFormatSetter(ref, format)
  useNowEffect(setter, msInterval, [])
  useEffect(() => {
    if (!ref.current) return
    const now = getNow(msInterval, override)
    setter(now, getInstant(now))
  }, [ref.current, msInterval, override, ...(deps || [])])
  return ref
}

export function useNowMemo(memo, msInterval, deps) {
  msInterval = msInterval ?? second
  const override = useContext(NowContext)
  const [now, setNow] = useState(memo(getNow(msInterval, override)))
  deps = [memo, ...(deps ?? [])]
  useNowEffect((time, instant) => setNow(memo(time, instant)), msInterval, deps)
  return now
}

export function useNowEffect(hook, msInterval, deps) {
  msInterval = msInterval ?? second
  const override = useContext(NowContext)
  useEffect(() => {
    if (
      (override !== null && override !== undefined) ||
      !window.requestAnimationFrame
    ) {
      const now = getNow(msInterval, override)
      hook(now, getInstant(now))
    } else {
      return listen(msInterval, hook)
    }
  }, [hook, msInterval, override, ...(deps ?? [])])
}

function getDuration(instant, from, to, smallestUnit) {
  from = from ?? instant
  to = to ?? instant
  if (!(to && from)) {
    return null
  }
  const duration = from.until(to)
  return duration.round(smallestUnit)
}

export function useDurationEffect(from, to, smallestUnit, hook, deps) {
  const msInterval = resolveInterval(smallestUnit)
  useNowEffect(
    (_, instant) => hook(getDuration(instant, from, to, smallestUnit)),
    msInterval,
    [to, from, smallestUnit, hook, ...(deps ?? [])],
  )
}
