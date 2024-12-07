import React from 'react'
import type { ReactHTMLElement, HTMLAttributes } from 'react'

export type NowEffect = (now: number) => void
export type NowFormat = (now: number) => string

export const NowContext: React.Context<number | undefined>

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

export function useNowInnerTextRef(
  format: NowFormat,
  msInterval: number = 1000,
  deps?: DependencyList,
): React.Ref

export type NowSpanProps = Omit<HTMLAttributes<HTMLSpanElement>, 'ref'> & {
  format: NowFormat
  msInterval?: number
}

export function NowSpan(props: NowSpanProps): React.ReactNode
