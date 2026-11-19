import type { IRecordAnswerType } from '@src/interfaces/common/Common'

export function pendingQuizTryCount(
  recordedData: IRecordAnswerType[] | undefined,
  maxQuizCount: number,
): number {
  if (!recordedData || recordedData.length === 0) return 0

  const last = recordedData[recordedData.length - 1]
  if (!last) return 0
  if (last.OX === '1') return 0

  const cnt = last.AnswerCount ?? 0
  if (cnt >= maxQuizCount) return 0

  return cnt
}
