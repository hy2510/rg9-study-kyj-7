import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

export type HeartState = {
  current: number
  max: number
  setMax: (n: number) => void
  setCurrent: (n: number) => void
  decrease: () => void
  reset: () => void
  isEmpty: boolean
}

const HeartContext = createContext<HeartState | null>(null)

export const HeartContextProvider = HeartContext.Provider

export function useHeartState(
  initialMax: number = 3,
  _resetSignal?: unknown,
): HeartState {
  void _resetSignal
  const [max, setMaxState] = useState<number>(initialMax)
  const [current, setCurrent] = useState<number>(initialMax)

  const setMax = useCallback((n: number) => {
    setMaxState(n)
    setCurrent(n)
  }, [])

  const setCurrentClamped = useCallback((n: number) => {
    setCurrent(Math.max(0, n))
  }, [])

  const decrease = useCallback(() => {
    setCurrent((prev) => Math.max(0, prev - 1))
  }, [])

  const reset = useCallback(() => {
    setCurrent(max)
  }, [max])

  return useMemo(
    () => ({
      current,
      max,
      setMax,
      setCurrent: setCurrentClamped,
      decrease,
      reset,
      isEmpty: current <= 0,
    }),
    [current, max, setMax, setCurrentClamped, decrease, reset],
  )
}

export function useHeartContext(): HeartState {
  const ctx = useContext(HeartContext)
  if (!ctx) {
    throw new Error('useHeartContext must be used within HeartContextProvider')
  }
  return ctx
}

export function useHeartContextOptional(): HeartState | null {
  return useContext(HeartContext)
}
