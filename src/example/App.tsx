import { FormattedTimeDisplay } from './FormattedTimeDisplay'
import { TimeDisplay } from './TimeDisplay'
import { TimeRefDisplay } from './TimeRefDisplay'
import { NowContext, NowSpan } from '../useNow'

export const App = () => (
  <>
    <TimeDisplay msInterval={1} />
    <TimeRefDisplay msInterval={1} />
    <TimeDisplay msInterval={250} />
    <NowSpan
      style={{ background: 'lightgreen' }}
      format={(now) => `${now}`}
      msInterval={250}
    />
    <TimeDisplay msInterval={500} />
    <TimeDisplay msInterval={1000} />
    <TimeDisplay msInterval={2500} />
    <FormattedTimeDisplay msInterval={1000} />
    <FormattedTimeDisplay msInterval={1000 * 60} />
    <NowContext.Provider value={1000 * 60 * 60 * 24}>
      <FormattedTimeDisplay msInterval={1000} />
      <NowSpan format={(now) => `${now}`} />
    </NowContext.Provider>
  </>
)
