# React-Now-Hook

```sh
npm i @leichtgewicht/react-now-hook
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
} from '@leichtgewicht/react-now-hook'

const Time = ({
    msInterval // You can specify to which base it should round
}) => <p>{useNow(round)}</p>

const TimeWithRef = ({
    msInterval
}) => {
    // If you want to avoide state changes
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
        <NowContext.Provider value={0}>{/* Override the value of the time for tests */}
            <Time/>
            <NowSpan format={time => `${time}`}>
        </NowContext.Provider>
    <>
}
```
