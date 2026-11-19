import { useCallback, useEffect, useRef, useState } from 'react'

export interface TimerState {
  time: {
    timeMin: number
    timeSec: number
  }
  currentTime: number
  initialTime: number
  setup: (time: number) => void
  increaseTime: (time: number) => void
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  isFinished: boolean
  setTimeInterval: (interval: number) => void
}

export function useTimer(): TimerState {
  const [remainingTime, setRemainingTime] = useState(0)
  const [initialTime, setInitialTime] = useState(0)
  const [timeInterval, setTimeIntervalState] = useState(1000)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const pausedTimeRef = useRef<number>(0)

  const time = {
    timeMin: Math.floor(remainingTime / 60),
    timeSec: remainingTime % 60,
  }

  const setup = useCallback((time: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setRemainingTime(time)
    setInitialTime(time)
    pausedTimeRef.current = time
    startTimeRef.current = null
  }, [])

  const increaseTime = useCallback((addedTime: number) => {
    setRemainingTime((prev) => {
      const newTime = Math.min(prev + addedTime, 1200)
      if (!timerRef.current) {
        pausedTimeRef.current = newTime
      }
      return newTime
    })
  }, [])

  const startTimer = useCallback(() => {
    if (!timerRef.current && remainingTime > 0) {
      startTimeRef.current = Date.now()
      pausedTimeRef.current = remainingTime

      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, timeInterval)
    }
  }, [remainingTime, timeInterval])

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null

      pausedTimeRef.current = remainingTime
    }
  }, [remainingTime])

  const resumeTimer = useCallback(() => {
    if (!timerRef.current && remainingTime > 0) {
      startTimeRef.current = Date.now()

      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, timeInterval)
    }
  }, [remainingTime, timeInterval])

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setRemainingTime(pausedTimeRef.current)
    startTimeRef.current = null
  }, [])

  const setTimeInterval = useCallback(
    (interval: number) => {
      setTimeIntervalState(interval)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
        if (remainingTime > 0) {
          startTimeRef.current = Date.now()
          timerRef.current = setInterval(() => {
            setRemainingTime((prev) => {
              if (prev <= 0) {
                if (timerRef.current) {
                  clearInterval(timerRef.current)
                  timerRef.current = null
                }
                return 0
              }
              return prev - 1
            })
          }, interval)
        }
      }
    },
    [remainingTime],
  )

  useEffect(() => {
    if (remainingTime <= 0 && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [remainingTime])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return {
    time,
    currentTime: remainingTime,
    initialTime,
    setup,
    increaseTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    isFinished: remainingTime <= 0,
    setTimeInterval,
  }
}
