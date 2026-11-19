import { useCallback, useEffect, useRef, useState } from 'react'

type UseSpeakUserAudioProps = {
  blob?: Blob
  onEnded?: () => void
}

export default function useSpeakUserAudio({
  blob,
  onEnded,
}: UseSpeakUserAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const progressFrameRef = useRef<number | null>(null)
  const playRequestRef = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAudioReady, setIsAudioReady] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const onEndedRef = useRef(onEnded)
  useEffect(() => {
    onEndedRef.current = onEnded
  })

  const clearProgressFrame = useCallback(() => {
    if (progressFrameRef.current !== null) {
      cancelAnimationFrame(progressFrameRef.current)
      progressFrameRef.current = null
    }
  }, [])

  useEffect(() => {
    setIsAudioReady(false)
    setAudioDuration(0)
    setPlaybackProgress(0)
    setIsPlaying(false)
    clearProgressFrame()

    if (!blob) return

    const url = URL.createObjectURL(blob)
    objectUrlRef.current = url

    const audio = new Audio()
    audio.preload = 'auto'

    const INFINITY_HACK_TIME = 1e101
    let infinityHackApplied = false

    const resolveReady = (duration: number) => {
      if (Number.isFinite(duration) && duration > 0) {
        setAudioDuration(duration)
      }
      setIsAudioReady(true)
    }

    const handleLoaded = () => {
      const duration = audio.duration
      if (!Number.isFinite(duration) || duration <= 0) {
        if (!infinityHackApplied) {
          infinityHackApplied = true
          try {
            audio.currentTime = INFINITY_HACK_TIME
          } catch {
            resolveReady(0)
          }
          return
        }
      }
      resolveReady(duration)
    }

    const handleDurationChange = () => {
      const duration = audio.duration
      if (!Number.isFinite(duration) || duration <= 0) return
      try {
        audio.currentTime = 0
      } catch {
      }
      resolveReady(duration)
    }

    const handleEnded = () => {
      clearProgressFrame()
      setIsPlaying(false)
      setPlaybackProgress(1)
      onEndedRef.current?.()
    }
    const handleError = () => {
      setIsAudioReady(false)
    }

    audio.addEventListener('loadedmetadata', handleLoaded)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    audio.src = url
    audio.load()
    audioRef.current = audio

    return () => {
      playRequestRef.current += 1
      clearProgressFrame()
      audio.removeEventListener('loadedmetadata', handleLoaded)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      try {
        audio.pause()
      } catch {
      }
      audio.src = ''
      if (audioRef.current === audio) audioRef.current = null
      if (objectUrlRef.current === url) {
        URL.revokeObjectURL(url)
        objectUrlRef.current = null
      }
    }
  }, [blob, clearProgressFrame])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    clearProgressFrame()
    const requestId = ++playRequestRef.current

    try {
      audio.currentTime = 0
    } catch {
    }
    setPlaybackProgress(0)

    const tick = () => {
      if (requestId !== playRequestRef.current) return
      const duration = audio.duration
      if (Number.isFinite(duration) && duration > 0) {
        setPlaybackProgress(
          Math.min(1, Math.max(0, audio.currentTime / duration)),
        )
      }
      if (!audio.paused && !audio.ended) {
        progressFrameRef.current = requestAnimationFrame(tick)
        return
      }
      clearProgressFrame()
      setIsPlaying(false)
      if (audio.ended) setPlaybackProgress(1)
    }

    void audio
      .play()
      .then(() => {
        if (requestId !== playRequestRef.current) {
          try {
            audio.pause()
          } catch {
          }
          return
        }
        setIsPlaying(true)
        progressFrameRef.current = requestAnimationFrame(tick)
      })
      .catch(() => {
        if (requestId !== playRequestRef.current) return
        setIsPlaying(false)
      })
  }, [clearProgressFrame])

  const stop = useCallback(() => {
    playRequestRef.current += 1
    clearProgressFrame()
    const audio = audioRef.current
    if (audio) {
      try {
        audio.pause()
        audio.currentTime = 0
      } catch {
      }
    }
    setIsPlaying(false)
    setPlaybackProgress(0)
  }, [clearProgressFrame])

  const suspend = useCallback(() => {
    playRequestRef.current += 1
    clearProgressFrame()
    const audio = audioRef.current
    if (audio) {
      try {
        audio.pause()
      } catch {
      }
    }
    setIsPlaying(false)
    setPlaybackProgress(0)
  }, [clearProgressFrame])

  return {
    isPlaying,
    isAudioReady,
    audioDuration,
    playbackProgress,
    play,
    stop,
    suspend,
  }
}
