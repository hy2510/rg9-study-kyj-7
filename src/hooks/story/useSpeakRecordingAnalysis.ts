import { useCallback, useEffect, useRef, useState } from 'react'

import { transcribeSpeakRecordingLocally } from '@services/localSpeakTranscription'
import {
  getTextSimilarity,
  normalizeSpeechText,
} from '@utils/speechTextSimilarity'

export type SpeakRecordingResult =
  | 'correct'
  | 'incorrect'
  | 'unsupported'
  | 'error'

export type SpeakMicrophoneError =
  | 'not-found'
  | 'permission-denied'
  | 'unavailable'

const WORD_MATCH_THRESHOLD = 0.45
const SENTENCE_PASS_THRESHOLD = 0.5

function getSpeechWords(text: string): string[] {
  const normalizedText = normalizeSpeechText(text)
  if (!normalizedText) return []
  return normalizedText.split(' ').filter(Boolean)
}

function isSentenceSpeechMatch(transcript: string, sentence: string): boolean {
  const matchedWordCount = getSequentialMatchedWordIndexes(
    transcript,
    sentence,
  ).length
  const targetWords = getSpeechWords(sentence)
  if (targetWords.length === 0) return false

  return matchedWordCount / targetWords.length >= SENTENCE_PASS_THRESHOLD
}

function getSequentialMatchedWordIndexes(
  transcript: string,
  sentence: string,
): number[] {
  const targetWords = getSpeechWords(sentence)
  const spokenWords = getSpeechWords(transcript)
  if (targetWords.length === 0 || spokenWords.length === 0) return []

  const matchedIndexes: number[] = []
  let spokenCursor = 0

  targetWords.forEach((targetWord, targetIndex) => {
    for (let i = spokenCursor; i < spokenWords.length; i += 1) {
      if (
        getTextSimilarity(spokenWords[i] ?? '', targetWord) <
        WORD_MATCH_THRESHOLD
      ) {
        continue
      }

      matchedIndexes.push(targetIndex)
      spokenCursor = i + 1
      break
    }
  })

  return matchedIndexes
}

type UseSpeakRecordingAnalysisParams = {
  targetSentence: string
  maxDurationMs?: number
}

export function useSpeakRecordingAnalysis({
  targetSentence,
  maxDurationMs,
}: UseSpeakRecordingAnalysisParams) {
  const [isRecordingMode, setIsRecordingMode] = useState(false)
  const [recordingResult, setRecordingResult] = useState<SpeakRecordingResult>()
  const [recognizedText, setRecognizedText] = useState('')
  const [matchedWordIndexes, setMatchedWordIndexes] = useState<number[]>([])
  const [userRecordingUrl, setUserRecordingUrl] = useState<string>()
  const [recordingProgress, setRecordingProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [microphoneError, setMicrophoneError] =
    useState<SpeakMicrophoneError>()
  const [userRecordingBlob, setUserRecordingBlob] = useState<Blob>()
  const isCaptureActiveRef = useRef(false)
  const durationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const recordingProgressFrameRef = useRef<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const discardedRecordersRef = useRef(new WeakSet<MediaRecorder>())
  const recordingSessionRef = useRef(0)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const releaseWakeLock = useCallback(() => {
    const lock = wakeLockRef.current
    wakeLockRef.current = null
    if (!lock) return
    lock.release().catch(() => {})
  }, [])

  const requestWakeLock = useCallback(async () => {
    if (typeof navigator === 'undefined') return
    const wakeLock = (navigator as Navigator & { wakeLock?: WakeLock }).wakeLock
    if (!wakeLock) return
    try {
      const sentinel = await wakeLock.request('screen')
      wakeLockRef.current = sentinel
      sentinel.addEventListener('release', () => {
        if (wakeLockRef.current === sentinel) wakeLockRef.current = null
      })
    } catch {
    }
  }, [])

  const revokeUserRecordingUrl = useCallback(() => {
    setUserRecordingUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl)
      return undefined
    })
  }, [])

  const stopUserAudioRecording = useCallback((discard = false) => {
    const recorder = mediaRecorderRef.current
    mediaRecorderRef.current = null

    if (recorder && recorder.state !== 'inactive') {
      if (discard) discardedRecordersRef.current.add(recorder)
      recorder.stop()
      return
    }

    const stream = mediaStreamRef.current
    if (stream) {
      stream.getAudioTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
  }, [])

  const stopRecordingProgress = useCallback(() => {
    if (recordingProgressFrameRef.current !== null) {
      cancelAnimationFrame(recordingProgressFrameRef.current)
      recordingProgressFrameRef.current = null
    }
  }, [])

  const resetRecordingAnalysis = useCallback(() => {
    recordingSessionRef.current += 1
    stopRecordingProgress()
    if (durationTimerRef.current !== null) {
      clearTimeout(durationTimerRef.current)
      durationTimerRef.current = null
    }
    isCaptureActiveRef.current = false
    stopUserAudioRecording(true)
    revokeUserRecordingUrl()
    releaseWakeLock()
    setIsRecordingMode(false)
    setRecordingResult(undefined)
    setRecognizedText('')
    setMatchedWordIndexes([])
    setRecordingProgress(0)
    setIsAnalyzing(false)
    setMicrophoneError(undefined)
    setUserRecordingBlob(undefined)
  }, [
    releaseWakeLock,
    revokeUserRecordingUrl,
    stopRecordingProgress,
    stopUserAudioRecording,
  ])

  const startRecordingAnalysis = useCallback(async () => {
    if (
      typeof MediaRecorder === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setIsRecordingMode(false)
      setRecordingResult('unsupported')
      return
    }

    revokeUserRecordingUrl()
    const sessionId = recordingSessionRef.current + 1
    recordingSessionRef.current = sessionId
    setRecordingResult(undefined)
    setRecognizedText('')
    setMatchedWordIndexes([])
    setRecordingProgress(0)
    setIsAnalyzing(false)
    setMicrophoneError(undefined)
    setIsRecordingMode(true)
    isCaptureActiveRef.current = true
    void requestWakeLock()

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      if (sessionId !== recordingSessionRef.current) return
      const errorName = error instanceof DOMException ? error.name : ''
      setMicrophoneError(
        errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError'
          ? 'not-found'
          : errorName === 'NotAllowedError' ||
              errorName === 'PermissionDeniedError'
            ? 'permission-denied'
            : 'unavailable',
      )
      setRecordingResult('error')
      setIsRecordingMode(false)
      isCaptureActiveRef.current = false
      releaseWakeLock()
      return
    }

    if (sessionId !== recordingSessionRef.current) {
      stream.getTracks().forEach((track) => track.stop())
      return
    }

    const applyFinalEvaluation = (transcript: string) => {
      if (sessionId !== recordingSessionRef.current) return
      const normalizedTranscript = transcript.trim()
      const indexes = getSequentialMatchedWordIndexes(
        normalizedTranscript,
        targetSentence,
      )
      setRecognizedText(normalizedTranscript)
      setMatchedWordIndexes(indexes)
      setRecordingResult(
        isSentenceSpeechMatch(normalizedTranscript, targetSentence)
          ? 'correct'
          : 'incorrect',
      )
    }

    let recorder: MediaRecorder
    try {
      const preferredMimeType = [
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/webm',
      ].find((type) => MediaRecorder.isTypeSupported(type))
      recorder = new MediaRecorder(
        stream,
        preferredMimeType ? { mimeType: preferredMimeType } : undefined,
      )
    } catch {
      stream.getTracks().forEach((track) => track.stop())
      isCaptureActiveRef.current = false
      setIsRecordingMode(false)
      setRecordingResult('error')
      releaseWakeLock()
      return
    }

    const chunks: Blob[] = []
    mediaStreamRef.current = stream
    mediaRecorderRef.current = recorder
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    recorder.onstop = () => {
      stream.getAudioTracks().forEach((track) => track.stop())
      if (mediaStreamRef.current === stream) mediaStreamRef.current = null
      if (discardedRecordersRef.current.has(recorder)) return
      if (chunks.length === 0) {
        if (sessionId === recordingSessionRef.current) {
          setIsAnalyzing(false)
          setRecordingResult('error')
        }
        return
      }

      const blob = new Blob(chunks, {
        type: recorder.mimeType || chunks[0]?.type || 'audio/webm',
      })
      setUserRecordingBlob(blob)
      setUserRecordingUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl)
        return URL.createObjectURL(blob)
      })
      setIsAnalyzing(true)
      void transcribeSpeakRecordingLocally(blob)
        .then(applyFinalEvaluation)
        .catch((error) => {
          console.error('[SpeakRecording] local analysis failed', error)
          if (sessionId === recordingSessionRef.current) {
            setRecordingResult('error')
          }
        })
        .finally(() => {
          if (sessionId === recordingSessionRef.current) {
            setIsAnalyzing(false)
          }
        })
    }

    const finishRecording = () => {
      if (
        sessionId !== recordingSessionRef.current ||
        !isCaptureActiveRef.current
      ) {
        return
      }
      isCaptureActiveRef.current = false
      stopRecordingProgress()
      if (durationTimerRef.current !== null) {
        clearTimeout(durationTimerRef.current)
        durationTimerRef.current = null
      }
      setIsRecordingMode(false)
      stopUserAudioRecording()
      releaseWakeLock()
    }

    try {
      if (recorder.state === 'inactive') recorder.start()
    } catch {
      stream.getTracks().forEach((track) => track.stop())
      if (mediaStreamRef.current === stream) mediaStreamRef.current = null
      mediaRecorderRef.current = null
      isCaptureActiveRef.current = false
      setIsRecordingMode(false)
      setRecordingResult('error')
      releaseWakeLock()
      return
    }

    if (!maxDurationMs || durationTimerRef.current !== null) return

    const recordingStartedAt = performance.now()
    const updateRecordingProgress = () => {
      const elapsed = performance.now() - recordingStartedAt
      const progress = Math.min(1, elapsed / maxDurationMs)
      setRecordingProgress(progress)
      if (progress < 1 && isCaptureActiveRef.current) {
        recordingProgressFrameRef.current = requestAnimationFrame(
          updateRecordingProgress,
        )
      }
    }
    recordingProgressFrameRef.current = requestAnimationFrame(
      updateRecordingProgress,
    )
    durationTimerRef.current = setTimeout(() => {
      finishRecording()
    }, maxDurationMs)
  }, [
    targetSentence,
    maxDurationMs,
    releaseWakeLock,
    requestWakeLock,
    revokeUserRecordingUrl,
    stopRecordingProgress,
    stopUserAudioRecording,
  ])

  useEffect(() => resetRecordingAnalysis, [resetRecordingAnalysis])

  return {
    isRecordingMode,
    isAnalyzing,
    microphoneError,
    matchedWordIndexes,
    recognizedText,
    recordingResult,
    recordingProgress,
    userRecordingUrl,
    userRecordingBlob,
    resetRecordingAnalysis,
    startRecordingAnalysis,
  }
}
