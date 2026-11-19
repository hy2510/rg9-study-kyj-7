import { useEffect, useRef } from 'react'

import correctionCorrectSound from '@assets/sounds/common/correction-correct-sound.mp3'
import correctionIncorrectSound from '@assets/sounds/common/correction-incorrect-sound.mp3'
import type { SpeakRecordingResult } from '@src/hooks/story/useSpeakRecordingAnalysis'

export default function useSpeakFeedbackSound(
  recordingResult: SpeakRecordingResult | undefined,
) {
  const feedbackContextRef = useRef<AudioContext | null>(null)
  const feedbackBuffersRef = useRef<
    Partial<Record<'correct' | 'incorrect', AudioBuffer>>
  >({})
  const feedbackLoadRef = useRef<Promise<void> | null>(null)

  const prepareFeedbackAudio = () => {
    if (!feedbackContextRef.current) {
      const AudioContextConstructor =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext
          }
        ).webkitAudioContext
      if (!AudioContextConstructor) return
      feedbackContextRef.current = new AudioContextConstructor()
    }

    const context = feedbackContextRef.current
    void context.resume()
    if (!feedbackLoadRef.current) {
      feedbackLoadRef.current = Promise.all(
        [
          ['correct', correctionCorrectSound],
          ['incorrect', correctionIncorrectSound],
        ].map(async ([key, url]) => {
          const response = await fetch(url)
          const buffer = await context.decodeAudioData(
            await response.arrayBuffer(),
          )
          feedbackBuffersRef.current[key as 'correct' | 'incorrect'] = buffer
        }),
      ).then(() => undefined)
    }
  }

  useEffect(() => {
    if (recordingResult !== 'correct' && recordingResult !== 'incorrect') return
    let cancelled = false
    const playFeedback = async () => {
      await feedbackLoadRef.current
      if (cancelled) return
      const context = feedbackContextRef.current
      const buffer = feedbackBuffersRef.current[recordingResult]
      if (!context || !buffer) return
      if (context.state === 'suspended') await context.resume().catch(() => {})
      if (cancelled || context.state !== 'running') return
      const source = context.createBufferSource()
      source.buffer = buffer
      source.connect(context.destination)
      source.start()
    }
    void playFeedback()
    return () => {
      cancelled = true
    }
  }, [recordingResult])

  return { prepareFeedbackAudio }
}
