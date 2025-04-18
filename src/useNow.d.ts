import React from 'react'
import { Temporal } from 'temporal-spec'

export type NowEffect = (now: number) => void
export type NowFormat = (now: number) => string

export const NowContext: React.Context<number | undefined>

export const supportsInstant: boolean
export function getInstant(now: number): Temporal.Instant | null

export type Destructor = () => void;
export function listen(msInterval: number, hook: NowEffect): Destructor; 

export function useNow(msInterval: number = 1000): number
export function useNowMemo<T>(
  hook: (time: number) => T,
  msInterval: number = 1000,
  deps?: DependencyList,
): T

export function useNowEffect(
  hook: NowEffect,
  msInterval: number = 1000,
  deps?: DependencyList,
)

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
