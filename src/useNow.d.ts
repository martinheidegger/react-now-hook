import React from 'react'
import { Temporal } from 'temporal-spec'
import type {
  HTMLAttributes,
  DependencyList,
} from 'react'

export type NowEffect = (now: number, instant: Temporal.Instant | null) => void

export const HTML_FORMAT: unique symbol
export type NowFormatObject = {
  // Typescript: format(...) typescript signature in Temporal tends to be not compatible
  format(instant?: unknown): str
  [HTML_FORMAT]?: bool
}
export interface NowFormatFunction {
  (now: number, instant: Temporal.Instant | null): string
  [HTML_FORMAT]?: bool
}
export type NowFormat = NowFormatObject | NowFormatFunction

export type UnsupportedUnits = 'microsecond' | 'nanosecond'
export type SupportedUnits =
  | 'year'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond'
export type SmallestUnit = SupportedUnits | `${SupportedUnits}s`

export const NowContext: React.Context<number | undefined>

export const supportsInstant: boolean
export function getInstant(now: number): Temporal.Instant | null
export function getNowInstant(
  msInterval: number,
  now: number,
): Temporal.Instant | null

export type Destructor = () => void
export function listen(msInterval: number, hook: NowEffect): Destructor

export function useNow(msInterval: number = 1000): number
export function useInstant(msInterval: number = 1000): Temporal.Instant | null
export function useNowMemo<T>(
  hook: (time: number) => T,
  msInterval: number = 1000,
  deps?: DependencyList,
): T

export function useNowEffect(
  hook: NowEffect,
  msInterval: number = 1000,
  deps?: DependencyList,
): void

export function useNowInnerTextRef<T extends { innerText: string }>(
  format: NowFormat,
  msInterval: number = 1000,
  deps?: DependencyList,
): React.MutableRefObject<T>

export type NowSpanProps = Omit<HTMLAttributes<HTMLSpanElement>, 'ref'> & {
  format: NowFormat
  msInterval?: number
}

export function NowSpan(props: NowSpanProps): React.ReactNode

export function useDurationEffect(
  from: Temporal.Instant | null | undefined,
  to: Temporal.Instant | null | undefined,
  smallestUnit: SmallestUnit,
  hook: (duration: Temporal.Duration) => void,
  deps?: DependencyList,
): void
export function useDuration(
  from: Temporal.Instant | null | undefined,
  to: Temporal.Instant | null | undefined,
  smallestUnit: SmallestUnit,
): Temporal.Duration
