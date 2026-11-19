import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'

export function calcStartPositionByIndex(
  studyMode: Mode,
  recordedData: IRecordAnswerType[],
  quizArr: ReadonlyArray<{ QuizNo: number }>,
  maxQuizCount: number,
): [number, number] {
  if (
    studyMode !== 'student' ||
    recordedData.length === 0 ||
    quizArr.length === 0
  ) {
    return [1, 0]
  }

  const last = recordedData[recordedData.length - 1]
  const lastIdx = quizArr.findIndex((q) => q.QuizNo === last.CurrentQuizNo)
  if (lastIdx < 0) return [1, 0]

  const isCleared = last.AnswerCount === maxQuizCount || last.OX === '1'

  if (isCleared) {
    const next = lastIdx + 2
    return [Math.min(next, quizArr.length), 0]
  }

  return [lastIdx + 1, last.AnswerCount]
}
