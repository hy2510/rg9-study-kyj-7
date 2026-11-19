import type { LegacyQuizMark } from '@interfaces/common/header/LegacyQuizMark'
import type { LegacyStepProgress } from '@interfaces/common/header/LegacyStepProgress'
import { LegacyStepData } from '@interfaces/study/legacy/LegacyStepData'
import { ACTIVITY } from '@src/constants/study/studyConstants'
import { IRecordAnswerType } from '@src/interfaces/common/Common'

const BLANK_HISTORY_SEPARATOR: Record<string, string | undefined> = {
  [ACTIVITY.SUMMARY_2]: ',',
  [ACTIVITY.CLOZE_3]: '/',
}

type BlankQuizShape = {
  Quiz?: { QuizNo: number; Examples: { Text: string }[] }[]
}

type DefaultQuizShape = {
  Quiz?: { QuizNo: number }[]
}

function emptyRow(quizAnswerCount: number): LegacyQuizMark[] {
  return Array.from({ length: quizAnswerCount }, () => '' as LegacyQuizMark)
}

function buildBlankAttempts(
  data: LegacyStepData,
  quizAnswerCount: number,
  splitChar: string,
): LegacyQuizMark[][] {
  const partialQuizArr =
    (data.quizData as BlankQuizShape | null | undefined)?.Quiz ?? []

  const blankRows: LegacyQuizMark[][] = []
  const handledQuizNos = new Set<number>()

  for (const record of data.recordedData) {
    handledQuizNos.add(record.QuizNo)
    const sentenceMeta = partialQuizArr.find((q) => q.QuizNo === record.QuizNo)
    const tokens = record.StudentAnswer.split(splitChar)
    const examplesLen = sentenceMeta?.Examples.length ?? tokens.length

    for (let i = 0; i < examplesLen; i++) {
      const history = tokens[i] ?? ''
      const row = emptyRow(quizAnswerCount)
      if (quizAnswerCount > 0) {
        const lim = Math.min(history.length, quizAnswerCount)
        for (let j = 0; j < lim; j++) {
          row[j] = history[j] === '1' ? 'O' : 'X'
        }
      }
      blankRows.push(row)
    }
  }

  for (const q of partialQuizArr) {
    if (handledQuizNos.has(q.QuizNo)) continue
    for (let i = 0; i < q.Examples.length; i++) {
      blankRows.push(emptyRow(quizAnswerCount))
    }
  }
  return blankRows
}

function recordToRow(
  record: IRecordAnswerType | undefined,
  quizAnswerCount: number,
): LegacyQuizMark[] {
  const row = emptyRow(quizAnswerCount)
  if (quizAnswerCount <= 0 || !record) return row

  const tried = Math.min(record.AnswerCount, quizAnswerCount)
  if (tried <= 0) return row

  for (let i = 0; i < tried - 1; i++) row[i] = 'X'
  row[tried - 1] = record.OX === '1' ? 'O' : 'X'
  return row
}

function buildDefaultAttempts(
  data: LegacyStepData,
  quizAnswerCount: number,
): LegacyQuizMark[][] {
  const quizCount =
    (data.quizData as DefaultQuizShape | null | undefined)?.Quiz?.length ?? 0

  const rows: LegacyQuizMark[][] = []
  for (const record of data.recordedData) {
    rows.push(recordToRow(record, quizAnswerCount))
  }
  for (let i = rows.length; i < quizCount; i++) {
    rows.push(emptyRow(quizAnswerCount))
  }
  return rows
}

export function buildStepProgressMap(
  stepDataMap: Record<number, LegacyStepData | undefined>,
): Record<number, LegacyStepProgress> {
  const map: Record<number, LegacyStepProgress> = {}

  for (const stepIdStr of Object.keys(stepDataMap)) {
    const stepId = Number(stepIdStr)
    const data = stepDataMap[stepId]
    if (!data) continue

    const quizAnswerCount = data.quizAnswerCount
    const splitChar = BLANK_HISTORY_SEPARATOR[data.activity]

    const attempts = splitChar
      ? buildBlankAttempts(data, quizAnswerCount, splitChar)
      : buildDefaultAttempts(data, quizAnswerCount)

    map[stepId] = {
      quizCount: attempts.length,
      quizAnswerCount,
      attempts,
    }
  }

  return map
}
