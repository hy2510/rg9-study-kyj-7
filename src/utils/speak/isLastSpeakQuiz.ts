import type { SpeakPageProps } from '@src/interfaces/study/speak/ISpeak'

export function isLastSpeakQuiz(
  speakData: SpeakPageProps[],
  quizIndex: number,
): boolean {
  return (
    speakData.filter(
      (d, i) => i > quizIndex && !!d.Sentence && d.Sequence !== 999,
    ).length === 0
  )
}
