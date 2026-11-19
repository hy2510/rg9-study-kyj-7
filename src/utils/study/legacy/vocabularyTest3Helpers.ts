import type { RecordingResult } from '@hooks/story/useVocaRecordingAnalysis'

export const PRACTICE_GROUP_SIZE = 5

export function isPracticeGroupStart(quizNo: number): boolean {
  return (quizNo - 1) % PRACTICE_GROUP_SIZE === 0
}

export function isPracticeRecordingSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined'
  )
}

export function resolveVocabularyTest3PronunciationLabelKey({
  isRecordingMode,
  isAnalyzing,
  recordingResult,
  defaultPromptKey,
}: {
  isRecordingMode: boolean
  isAnalyzing: boolean
  recordingResult: RecordingResult | undefined
  defaultPromptKey: string
}): string {
  if (isRecordingMode) return 'study.vocabularyPractice.recording'
  if (isAnalyzing) return 'study.vocabularyPractice.analyzing'
  switch (recordingResult) {
    case 'correct':
      return 'study.vocabularyPractice.goodJob'
    case 'incorrect':
      return 'study.vocabularyPractice.tryAgain'
    case 'unsupported':
      return 'study.vocabularyPractice.unsupported'
    case 'microphone-unavailable':
      return 'study.vocabularyPractice.microphoneUnavailable'
    case 'error':
      return 'study.vocabularyPractice.error'
    default:
      return defaultPromptKey
  }
}
