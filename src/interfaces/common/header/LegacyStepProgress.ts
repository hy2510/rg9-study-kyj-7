import { LegacyQuizMark } from '@interfaces/common/header/LegacyQuizMark'

export type LegacyStepProgress = {
  quizCount: number
  quizAnswerCount: number
  attempts: LegacyQuizMark[][]
}
