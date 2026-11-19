import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'

export function calcStartPosition(
  studyMode: Mode,
  recordedData: IRecordAnswerType[],
  maxQuizCount: number,
): [number, number] {
  let currentQuizNo = 1
  let tryCnt = 0

  if (studyMode === 'student' && recordedData && recordedData.length > 0) {
    const last = recordedData[recordedData.length - 1]

    if (last.AnswerCount === maxQuizCount) {
      currentQuizNo = last.CurrentQuizNo + 1
    } else if (last.OX === '1') {
      currentQuizNo = last.CurrentQuizNo + 1
    } else {
      currentQuizNo = last.CurrentQuizNo
      tryCnt = last.AnswerCount
    }
  }

  return [currentQuizNo, tryCnt]
}
