import { useCallback, useEffect, useRef, useState } from 'react'

import { transcribeSpeakRecordingLocally } from '@services/localSpeakTranscription'
import {
  getTextSimilarity,
  normalizeSpeechText,
} from '@utils/speechTextSimilarity'

export type RecordingResult =
  | 'correct'
  | 'incorrect'
  | 'unsupported'
  | 'microphone-unavailable'
  | 'error'

const FALLBACK_RECORDING_MS = 2000
const MIN_RECORDING_MS = 1500
const SPEECH_MATCH_THRESHOLD = 0.2

const soundDurationCache = new Map<string, number>()

function computeMaxRecordingMs(soundDurationMs: number): number {
  if (!Number.isFinite(soundDurationMs) || soundDurationMs <= 0) {
    return FALLBACK_RECORDING_MS
  }
  const multiplier = soundDurationMs >= 5000 ? 1.4 : 1.2
  return Math.max(MIN_RECORDING_MS, soundDurationMs * multiplier)
}

function getBestSpeechSimilarity(transcript: string, word: string): number {
  const normalizedTranscript = normalizeSpeechText(transcript)
  const normalizedWord = normalizeSpeechText(word)
  if (!normalizedTranscript || !normalizedWord) return 0

  const candidates = [normalizedTranscript, ...normalizedTranscript.split(' ')]
  return Math.max(
    ...candidates.map((candidate) =>
      getTextSimilarity(candidate, normalizedWord),
    ),
  )
}

function isSpeechMatch(transcript: string, word: string): boolean {
  return getBestSpeechSimilarity(transcript, word) >= SPEECH_MATCH_THRESHOLD
}

type UseVocaRecordingAnalysisParams = {
  targetWord: string
  targetSoundUrl?: string
  pauseBookAudio: () => void
}

export function useVocaRecordingAnalysis({
  targetWord,
  targetSoundUrl,
  pauseBookAudio,
}: UseVocaRecordingAnalysisParams) {
  const [isRecordingMode, setIsRecordingMode] = useState(false)
  const [isStartingRecording, setIsStartingRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recordingResult, setRecordingResult] = useState<RecordingResult>()
  const [recognizedText, setRecognizedText] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recordingSessionRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxRecordingMsRef = useRef<number>(FALLBACK_RECORDING_MS)

  const releaseActiveStream = useCallback(() => {
    const stream = mediaStreamRef.current
    mediaStreamRef.current = null
    if (!stream) return
    stream.getAudioTracks().forEach((track) => track.stop())
  }, [])

  useEffect(() => {
    if (!targetSoundUrl) {
      maxRecordingMsRef.current = FALLBACK_RECORDING_MS
      return
    }

    const cached = soundDurationCache.get(targetSoundUrl)
    if (cached !== undefined) {
      maxRecordingMsRef.current = computeMaxRecordingMs(cached)
      return
    }

    let cancelled = false
    const probe = new Audio()
    probe.preload = 'metadata'

    const cleanup = () => {
      probe.removeEventListener('loadedmetadata', handleLoaded)
      probe.removeEventListener('error', handleError)
      probe.src = ''
    }

    function handleLoaded() {
      if (cancelled) return
      const durationMs = probe.duration * 1000
      if (Number.isFinite(durationMs) && durationMs > 0) {
        soundDurationCache.set(targetSoundUrl as string, durationMs)
        maxRecordingMsRef.current = computeMaxRecordingMs(durationMs)
      } else {
        maxRecordingMsRef.current = FALLBACK_RECORDING_MS
      }
      cleanup()
    }

    function handleError() {
      if (cancelled) return
      maxRecordingMsRef.current = FALLBACK_RECORDING_MS
      cleanup()
    }

    probe.addEventListener('loadedmetadata', handleLoaded, { once: true })
    probe.addEventListener('error', handleError, { once: true })
    probe.src = targetSoundUrl

    return () => {
      cancelled = true
      cleanup()
    }
  }, [targetSoundUrl])

  const resetRecordingAnalysis = useCallback(() => {
    recordingSessionRef.current += 1

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const recorder = mediaRecorderRef.current
    mediaRecorderRef.current = null
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }

    releaseActiveStream()

    setIsRecordingMode(false)
    setIsStartingRecording(false)
    setIsAnalyzing(false)
    setRecordingResult(undefined)
    setRecognizedText('')
  }, [releaseActiveStream])

  const startRecordingAnalysis = useCallback(async () => {
    if (
      typeof MediaRecorder === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setIsRecordingMode(false)
      setRecordingResult('unsupported')
      return
    }

    resetRecordingAnalysis()
    pauseBookAudio()

    const sessionId = ++recordingSessionRef.current
    setIsStartingRecording(true)

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      if (sessionId !== recordingSessionRef.current) return
      setIsStartingRecording(false)
      setRecordingResult('microphone-unavailable')
      return
    }

    if (sessionId !== recordingSessionRef.current) {
      stream.getAudioTracks().forEach((track) => track.stop())
      return
    }

    const preferredMimeType = [
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/webm',
    ].find((type) => MediaRecorder.isTypeSupported(type))

    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(
        stream,
        preferredMimeType ? { mimeType: preferredMimeType } : undefined,
      )
    } catch {
      stream.getAudioTracks().forEach((track) => track.stop())
      if (sessionId !== recordingSessionRef.current) return
      setIsStartingRecording(false)
      setRecordingResult('error')
      return
    }

    mediaRecorderRef.current = recorder
    mediaStreamRef.current = stream

    const chunks: Blob[] = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    recorder.onstop = () => {
      stream.getAudioTracks().forEach((track) => track.stop())
      if (mediaStreamRef.current === stream) mediaStreamRef.current = null

      if (sessionId !== recordingSessionRef.current) return
      setIsRecordingMode(false)

      if (chunks.length === 0) {
        setRecordingResult('error')
        return
      }

      const blob = new Blob(chunks, {
        type: recorder.mimeType || chunks[0]?.type || 'audio/webm',
      })

      setIsAnalyzing(true)
      void transcribeSpeakRecordingLocally(blob)
        .then((transcript) => {
          if (sessionId !== recordingSessionRef.current) return
          const trimmed = transcript.trim()
          setRecognizedText(trimmed)
          setRecordingResult(
            isSpeechMatch(trimmed, targetWord) ? 'correct' : 'incorrect',
          )
        })
        .catch(() => {
          if (sessionId !== recordingSessionRef.current) return
          setRecordingResult('error')
        })
        .finally(() => {
          if (sessionId === recordingSessionRef.current) {
            setIsAnalyzing(false)
          }
        })
    }

    try {
      recorder.start()
    } catch {
      stream.getAudioTracks().forEach((track) => track.stop())
      if (mediaStreamRef.current === stream) mediaStreamRef.current = null
      mediaRecorderRef.current = null
      if (sessionId !== recordingSessionRef.current) return
      setIsStartingRecording(false)
      setRecordingResult('error')
      return
    }

    setIsStartingRecording(false)
    setIsRecordingMode(true)

    timerRef.current = setTimeout(() => {
      timerRef.current = null
      if (recorder.state !== 'inactive') recorder.stop()
    }, maxRecordingMsRef.current)
  }, [pauseBookAudio, resetRecordingAnalysis, targetWord])

  useEffect(() => resetRecordingAnalysis, [resetRecordingAnalysis])

  return {
    isRecordingMode,
    isStartingRecording,
    isAnalyzing,
    recognizedText,
    recordingResult,
    resetRecordingAnalysis,
    startRecordingAnalysis,
  }
}
