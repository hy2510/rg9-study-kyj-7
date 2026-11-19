import { useCallback, useEffect, useRef } from 'react'

import correctionIncorrectSound from '@assets/sounds/common/correction-incorrect-sound.mp3'

export function useIncorrectSoundPlayer() {
  const incorrectAudioRef = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    incorrectAudioRef.current?.pause()
    incorrectAudioRef.current = null
  }, [])

  const play = useCallback(() => {
    incorrectAudioRef.current?.pause()
    const audio = new Audio(correctionIncorrectSound)
    incorrectAudioRef.current = audio
    audio.play().catch(() => {})
  }, [])

  useEffect(() => {
    return () => {
      incorrectAudioRef.current?.pause()
      incorrectAudioRef.current = null
    }
  }, [])

  return { play, stop }
}
