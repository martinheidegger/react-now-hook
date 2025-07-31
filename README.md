# React-Now-Hook

Very efficient and powerful hook to have time-dependent displays.

[Live Example](https://martinheidegger.github.io/react-now-hook/)

## Install

```sh
npm i react-now-hook
```

## Quick Start

```jsx
import { useNow } from 'react-now-hook'

const TimeDisplay = () => {
  const now = useNow()
  return <span>{now}</span>
}
```

## Usage

```jsx
import {
    useNow,
    useNowEffect,
    useNowInnerTextRef,
    useNowMemo,
    NowContext,
    NowSpan,
} from 'react-now-hook'

const Time = ({
    msInterval // You can specify to which base it should round
}) => <p>{useNow(round)}</p>

const TimeWithRef = ({
    msInterval
}) => {
    // High performance,
    const ref = useNowInnerTextRef(
        time => `${time}`,
        msInterval
    )
    return <p ref={ref} />
}

const App = () => {
    const date = useNowMemo(
        time => new Date(time) // Derived value from the time
    )
    const dateForEveryMinute = useNowMemo(
        time => new Date(time),
        1000 * 60
    )
    return <>
        <Time />
        <Time round={250} />
        <TimeWithRef round={1} />
        <NowProvider value={0}>{/* Override the value of the time for tests */}
            <Time/>
            <NowSpan format={time => `${time}`}>
        </NowProvider>
    <>
}
```
