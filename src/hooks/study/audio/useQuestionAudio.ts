import { useCallback, useEffect, useRef, useState } from 'react'

import { useStudyVisibility } from '@contexts/StudyVisibilityContext'
import { AugmentOptions } from '@hooks/study/remix/useAugmentManager'

const DEFAULT_QUESTION_AUDIO = {
  isInfinitePlay: true,
  enablePlayCount: 0,
  playback: 1 as const,
}

type UseQuestionAudioOptions = {
  augmentOptions?: AugmentOptions
  autoPlay?: boolean
  replayKey?: string | number
}

export type QuestionAudioController = {
  isPlaying: boolean
  canPlay: boolean
  play: () => void
  stop: () => void
}

export function useQuestionAudio(
  soundUrl: string,
  options: UseQuestionAudioOptions = {},
): QuestionAudioController {
  const { augmentOptions, autoPlay = false, replayKey } = options
  const isStudyVisible = useStudyVisibility()

  const questionAudio = augmentOptions?.questionAudio ?? DEFAULT_QUESTION_AUDIO
  const { isInfinitePlay, enablePlayCount, playback } = questionAudio

  const [isPlaying, setIsPlaying] = useState(false)
  const [remainingPlayCount, setRemainingPlayCount] = useState(enablePlayCount)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    setRemainingPlayCount(enablePlayCount)
  }, [soundUrl, enablePlayCount])

  const canPlay = isInfinitePlay || remainingPlayCount > 0

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const play = useCallback(() => {
    if (!soundUrl) return
    if (!canPlay) return
    stop()
    const audio = new Audio(soundUrl)
    audioRef.current = audio
    audio.playbackRate = playback

    const clearPlaying = () => {
      if (audioRef.current === audio) {
        audioRef.current = null
        setIsPlaying(false)
      }
    }

    audio.addEventListener('play', () => {
      setIsPlaying(true)
      if (!isInfinitePlay) {
        setRemainingPlayCount((c) => c - 1)
      }
    })
    audio.addEventListener('ended', clearPlaying)
    audio.addEventListener('error', () => {
      console.error('Audio play failed')
      clearPlaying()
    })

    audio.play().catch((err) => {
      console.error('Audio play failed:', err)
      clearPlaying()
    })
  }, [soundUrl, stop, canPlay, isInfinitePlay, playback])

  useEffect(() => {
    if (soundUrl && autoPlay) {
      play()
    }
  }, [autoPlay, soundUrl, play, replayKey])

  useEffect(() => {
    if (isStudyVisible) return
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
    setIsPlaying(false)
  }, [isStudyVisible])

  useEffect(() => {
    return () => {
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      audioRef.current = null
    }
  }, [soundUrl, replayKey])

  return { isPlaying, canPlay, play, stop }
}
