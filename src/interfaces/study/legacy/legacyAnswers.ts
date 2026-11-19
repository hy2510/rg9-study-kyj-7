import {
  BookType,
  Mobile,
  Mode,
  WritingActivity2SaveType,
} from '@src/interfaces/common/Types'

export interface IScoreBoardData {
  readonly quizNo: number
  readonly maxCount: number
  readonly answerCount: number
  readonly ox: boolean
}

export interface IUserAnswer {
  readonly mobile: Mobile
  readonly bookType: BookType
  readonly studyId: string
  readonly studentHistoryId: string
  readonly step: string
  quizId: string
  quizNo: number
  currentQuizNo: number
  correct: string
  studentAnswer: string
  answerCount: number
  isEnabledPenalty?: boolean
  isLastQuiz?: boolean
  isFinishStudy?: boolean
  score?: number
}

export interface IUserAnswerWord {
  readonly bookType: BookType
  readonly studyId: string
  readonly studentHistoryId: string
  readonly step: string
  quizId: string
  quizNo: number
  currentQuizNo: number
  correct: string
  studentAnswer: string
  answerCount: number
}

export interface IUserAnswerPartial {
  readonly mobile: Mobile
  readonly bookType: BookType
  readonly studyId: string
  readonly studentHistoryId: string
  readonly step: string
  quizId: string
  quizNo: number
  currentQuizNo: number
  correct: string
  studentAnswer: string
  partialRecord: string
  answerCount: number
  isEnabledPenalty?: boolean
  isLastQuiz?: boolean
  isFinishStudy?: boolean
  score?: number
}

export interface IUserAnswerWriting {
  readonly bookType: BookType
  readonly studyId: string
  readonly studentHistoryId: string
  readonly step: string
  saveType: WritingActivity2SaveType
  writeText: string
  isFinishStudy?: boolean
}

export interface IUserAnswerRewriting {
  readonly bookType: BookType
  readonly studyId: string
  readonly studentHistoryId: string
  writeText: string
}

export interface IResultType {
  readonly result: string
  readonly resultMessage: '' | string
}

export interface IResultMessage {
  readonly average: number
  readonly rgpoint: number
  readonly totalpoint: number
  readonly levelup: string
  readonly levelmaster: string
  readonly newreadingunit: string
  readonly dailybook: string
  readonly dailypoint: string
  readonly dailytype: string
  readonly dailygoal: string
  readonly prizetitle: string
}

export interface IRecordAnswerType {
  readonly QuizId: string
  readonly QuizNo: number
  readonly CurrentQuizNo: number
  readonly OX: string
  readonly TempText: string
  readonly PenaltyWord: string
  readonly Correct: string
  readonly StudentAnswer: string
  readonly AnswerCount: number
}

export interface IDeletePenaltyType {
  readonly mobile: Mobile
  readonly bookType: BookType
  readonly studyId: string
  readonly studentHistoryId: string
  readonly step: string
  quizId: string
  isLastQuiz?: boolean
  isFinishStudy?: boolean
  score?: number
}

export interface IResultPreference {
  success: boolean
}

export interface ILegacyUserContext {
  readonly mode: Mode
  readonly studyId: string
  readonly studentHistoryId: string
}
