import type {
  ISpeakRecord,
  SpeakPageProps,
} from '@src/interfaces/study/speak/ISpeak'

export function resolveInitialSpeakQuizIndex(
  speakData: SpeakPageProps[],
  recordedData: ISpeakRecord[],
): number {
  let nextIndex = 0

  if (recordedData.length > 0) {
    const lastRecord = recordedData[recordedData.length - 1]
    const lastIndex = speakData.findIndex(
      (d) =>
        d.Page === lastRecord.Page &&
        d.Sequence === lastRecord.Sequence &&
        d.DataPath !== '',
    )
    nextIndex = lastIndex + 1
  }

  while (nextIndex < speakData.length) {
    if (
      speakData[nextIndex].Contents !== '' &&
      speakData[nextIndex].DataPath !== ''
    ) {
      break
    }
    nextIndex++
  }

  return Math.min(nextIndex, speakData.length - 1)
}
