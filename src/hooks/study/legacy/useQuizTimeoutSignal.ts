import { useEffect, useRef } from 'react'

export function useQuizTimeoutSignal(
  signal: number | undefined,
  onTimeout: () => void,
) {
  const lastSignalRef = useRef(signal)
  const onTimeoutRef = useRef(onTimeout)

  useEffect(() => {
    onTimeoutRef.current = onTimeout
  })

  useEffect(() => {
    if (signal === lastSignalRef.current) return
    lastSignalRef.current = signal
    onTimeoutRef.current()
  }, [signal])
}

export function useQuizTimerHold({
  enabled,
  isHeld,
  onPauseTimer,
  onResumeTimer,
  onResetQuizTimer,
}: {
  enabled: boolean
  isHeld: boolean
  onPauseTimer?: () => void
  onResumeTimer?: () => void
  onResetQuizTimer?: () => void
}) {
  const wasHeldRef = useRef(false)
  const onResumeTimerRef = useRef(onResumeTimer)

  useEffect(() => {
    onResumeTimerRef.current = onResumeTimer
  })

  useEffect(
    () => () => {
      if (wasHeldRef.current) onResumeTimerRef.current?.()
    },
    [],
  )

  useEffect(() => {
    if (!enabled) return
    if (isHeld) {
      wasHeldRef.current = true
      onPauseTimer?.()
    } else if (wasHeldRef.current) {
      wasHeldRef.current = false
      onResetQuizTimer?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isHeld])
}
