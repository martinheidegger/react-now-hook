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

function getNow(msInterval, time = Date.now()) {
  return Math.floor(time / msInterval) * msInterval
}

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
        for (const hook of check.hooks) {
          hook(current)
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
  return createElement('span', { ...props, ref })
}

export function useNow(msInterval) {
  msInterval = msInterval ?? second
  const override = useContext(NowContext)
  const [now, setNow] = useState(getNow(msInterval, override))
  useNowEffect(setNow, msInterval)
  return now
}

export function useNowInnerTextRef(format, msInterval, deps) {
  msInterval = msInterval ?? second
  const ref = useRef()
  deps = [ref.current, format, ...(deps ?? [])]
  useNowEffect(
    (time) => {
      if (ref.current) {
        ref.current.innerText = format(time)
      }
    },
    msInterval,
    deps,
  )
  return ref
}

export function useNowMemo(memo, msInterval, deps) {
  msInterval = msInterval ?? second
  const override = useContext(NowContext)
  const [now, setNow] = useState(memo(getNow(msInterval, override)))
  deps = [memo, ...(deps ?? [])]
  useNowEffect((time) => setNow(memo(time)), msInterval, deps)
  return now
}

export function useNowEffect(hook, msInterval, deps) {
  msInterval = msInterval ?? second
  const override = useContext(NowContext)
  deps = [hook, msInterval, override, ...(deps ?? [])]
  useEffect(() => {
    if (override !== null && override !== undefined) {
      hook(getNow(msInterval, override))
    } else if (!window.requestAnimationFrame) {
      hook(getNow(msInterval, Date.now()))
    } else {
      return listen(msInterval, hook)
    }
  }, deps)
}
