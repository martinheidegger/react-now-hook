import {
  useEffect,
  useState,
  createElement,
  useContext,
  createContext,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
} from 'react'

export const supportsInstant = !!(
  typeof Temporal !== 'undefined' && typeof Temporal.Instant !== 'undefined'
)

export const getInstant = supportsInstant
  ? (now) => Temporal.Instant.fromEpochMilliseconds(now)
  : (_now) => null

export const getNowInstant = supportsInstant
  ? (msInterval, time) =>
      Temporal.Instant.fromEpochMilliseconds(getNow(msInterval, time))
  : (_msInterval, _time) => null

const fnRef = (ref) =>
  typeof ref === 'function'
    ? ref
    : (value) => {
        ref.current = value
        return () => (ref.current = null)
      }

const useMerged = (a, b) =>
  useMemo(() => {
    if (!b) return a
    a = fnRef(a)
    b = fnRef(b)
    return (value) => {
      const unA = a(value)
      const unB = b(value)
      return () => (unA(), unB())
    }
  }, [a, b])

class SimpleControl extends Map {
  constructor(time = null, fallback = null) {
    super()
    this.time = time
    this.fallback = fallback
    this.prev = time ?? fallback
    this.prevInstant = getInstant(this.prev)
    this.setFallback = this.setFallback.bind(this)
  }
  check() {
    const current = this.time ?? this.fallback
    if (current === this.prev) {
      return
    }
    this.prev = current
    this.prevInstant = getInstant(current)
    for (const [msInterval, check] of this.entries()) {
      let time, instant
      if (msInterval === 1) {
        time = current
        instant = this.prevInstant
      } else {
        time = getNow(msInterval, current)
        if (time === check.time) {
          continue
        }
        instant = getInstant(current)
      }
      check.time = time
      check.instant = instant
      for (const hook of check.hooks) {
        try {
          hook(time, instant)
        } catch (cause) {
          check.hooks.delete(hook)
          if (check.hooks.size === 0) {
            this.delete(msInterval)
          }
          console.error(
            new Error('Removing now hook due to error in execution', { cause }),
          )
        }
      }
    }
  }
  setTime(msTime) {
    this.time = msTime
    queueMicrotask(() => this.check())
  }
  setFallback(fallback) {
    this.fallback = fallback
    queueMicrotask(() => this.check())
  }
  useNow(msInterval, deps) {
    const [now, setNow] = useState(() => getNow(msInterval, this.prev))
    this.useNowEffect(setNow, msInterval, deps)
    return now
  }
  useNowEffect(hook, msInterval, deps) {
    useEffect(() => {
      const check = this.get(msInterval)
      if (check) {
        hook(check.time, check.instant)
      } else {
        const time = getNow(msInterval, this.prev)
        hook(time, getInstant(time))
      }
    }, [msInterval, hook, ...deps])
    useEffect(() => this.listen(msInterval, hook), [msInterval, hook])
  }
  useNowInnerTextRef(format, msInterval, deps) {
    const ref = useRef()
    const setter = useFormatSetter(ref, format, deps)
    this.useNowEffect(setter, msInterval, [ref.current])
    return ref
  }
  useDurationEffect(from, to, smallestUnit, hook, deps) {
    this.useNowEffect(
      useCallback(
        (_, instant) => hook(getDuration(instant, from, to, smallestUnit)),
        [hook, from, to, smallestUnit],
      ),
      stringInterval[smallestUnit] ?? second,
      deps,
    )
  }
  useDurationInnerTextRef(from, to, smallestUnit, format, deps) {
    const ref = useRef()
    const setter = useFormatSetter(ref, format, deps)
    this.useDurationEffect(from, to, smallestUnit, setter, [])
    return ref
  }
  listen(msInterval, hook) {
    let check = this.get(msInterval)
    if (!check) {
      const time = getNow(msInterval, this.prev)
      check = {
        time,
        instant: getInstant(time),
        hooks: new Set([hook]),
      }
      this.set(msInterval, check)
    } else {
      check.hooks.add(hook)
    }
    return () => {
      check.hooks.delete(hook)
      if (check.hooks.size === 0) {
        this.delete(msInterval)
      }
    }
  }
}

class BrowserControl extends SimpleControl {
  constructor(time) {
    super(time)
    this.run = this.run.bind(this)
    this.pending = false
  }
  run() {
    this.pending = false
    try {
      this.setTime(Date.now())
    } finally {
      this.queue()
    }
  }
  queue() {
    if (!this.size || this.pending) {
      return
    }
    this.pending = true
    globalThis.requestAnimationFrame(this.run)
  }
  listen(msInterval, hook) {
    try {
      return super.listen(msInterval, hook)
    } finally {
      this.queue()
    }
  }
}

const rootControl = globalThis.requestAnimationFrame
  ? new BrowserControl(Date.now())
  : new SimpleControl(Date.now())

export function listen(msInterval, hook) {
  return rootControl.listen(msInterval, hook)
}

const NowContext = createContext(rootControl)

export const NowProvider = ({ time, children }) => {
  const parent = useContext(NowContext)
  const control = useMemo(() => new SimpleControl(time, parent.prev), [])
  control.setTime(time)
  useEffect(() => parent.listen(1, control.setFallback), [])
  return createElement(NowContext.Provider, { value: control }, children)
}

export const HTML_FORMAT = Symbol.for('react-now-hook:format():html')

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

function getNow(msInterval, time = Date.now()) {
  return Math.floor(time / msInterval) * msInterval
}

function stringify(input) {
  return input.toString()
}

export const NowSpan = forwardRef(function NowSpan(
  { format, msInterval, ...props },
  outerRef,
) {
  msInterval = msInterval ?? second
  format = format ?? stringify
  const control = useContext(NowContext)
  const ref = control.useNowInnerTextRef(format, msInterval, [])
  const formatter = getFormatter(format)
  const formatted = formatter(control.prev, control.prevInstant)
  props.suppressHydrationWarning = true
  if (formatter[HTML_FORMAT]) {
    props.dangerouslySetInnerHTML = { __html: formatted }
  }
  props.ref = useMerged(ref, outerRef)
  return createElement('span', props, formatter[HTML_FORMAT] ? null : formatted)
})

export function useNow(msInterval) {
  return useContext(NowContext).useNow(msInterval ?? second, [])
}

export function useInstant(msInterval) {
  msInterval = msInterval ?? second
  const context = useContext(NowContext)
  const [instant, setInstant] = useState(() => context.prevInstant)
  const takeInstant = useCallback((_, instant) => setInstant(instant), [])
  context.useNowEffect(takeInstant, msInterval, [])
  return instant
}

function getFormatter(format) {
  if (typeof format === 'function') {
    return format
  } else if (
    typeof format === 'object' &&
    typeof format.format === 'function'
  ) {
    const formatter = (num, tempObj) => format.format(tempObj ? tempObj : num)
    if (format[HTML_FORMAT]) {
      formatter[HTML_FORMAT] = true
    }
    return formatter
  } else {
    throw new Error('Format should be function or a formatter object')
  }
}

const useFormatSetter = (ref, format, deps) =>
  useMemo(() => {
    const actual = getFormatter(format)
    if (format[HTML_FORMAT]) {
      return (...args) => {
        if (ref.current) ref.current.innerHTML = actual(...args)
      }
    }
    return (...args) => {
      if (ref.current) ref.current.innerText = actual(...args)
    }
  }, [ref, format, ...deps])

export function useNowInnerTextRef(format, msInterval, deps) {
  return useContext(NowContext).useNowInnerTextRef(
    format,
    msInterval ?? second,
    deps ?? [],
  )
}

export function useNowMemo(factory, msInterval, deps) {
  msInterval = msInterval ?? second
  const now = useContext(NowContext).useNow(msInterval, deps ?? [])
  return useMemo(() => factory(now), [now])
}

export function useNowEffect(hook, msInterval, deps) {
  useContext(NowContext).useNowEffect(hook, msInterval ?? second, deps ?? [])
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
  useContext(NowContext).useDurationEffect(
    from,
    to,
    smallestUnit ?? 'second',
    hook,
    deps ?? [],
  )
}

export function useDurationInnerTextRef(from, to, smallestUnit, format, deps) {
  return useContext(NowContext).useDurationInnerTextRef(
    from,
    to,
    smallestUnit ?? 'second',
    format,
    deps ?? [],
  )
}

export function useDuration(from, to, smallestUnit) {
  smallestUnit = smallestUnit ?? 'second'
  const control = useContext(NowContext)
  if (!from) {
    from = control.prevInstant
    if (!to) {
      to = from
    }
  } else if (!to) {
    to = control.prevInstant
  }
  const [duration, setDuration] = useState(() =>
    getDuration(control.prevInstant, from, to, smallestUnit),
  )
  control.useDurationEffect(from, to, smallestUnit, setDuration, [])
  return duration
}

export const DurationSpan = forwardRef(function DurationSpan(
  { from, to, smallestUnit, format, ...props },
  outerRef,
) {
  smallestUnit = smallestUnit ?? 'second'
  format = format ?? stringify
  const formatter = getFormatter(format)
  const control = useContext(NowContext)
  const ref = control.useDurationInnerTextRef(
    from,
    to,
    smallestUnit,
    format,
    [],
  )
  const formatted = formatter(
    getDuration(control.prevInstant, from, to, smallestUnit),
  )
  props.suppressHydrationWarning = true
  if (formatter[HTML_FORMAT]) {
    props.dangerouslySetInnerHTML = { __html: formatted }
  }
  props.ref = useMerged(ref, outerRef)
  return createElement('span', props, formatter[HTML_FORMAT] ? null : formatted)
})
