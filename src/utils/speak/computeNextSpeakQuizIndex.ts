import type { SpeakPageProps } from '@src/interfaces/study/speak/ISpeak'

export function computeNextSpeakQuizIndex(
  speakData: SpeakPageProps[],
  from: number,
): number {
  let next = from
  while (next < speakData.length && speakData[next]?.Sequence === 999) {
    next++
  }
  return Math.min(next, speakData.length - 1)
}
