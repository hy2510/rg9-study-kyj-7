import { IRecordAnswerType } from '@interfaces/common/Common'

export type LegacyStepData = {
  activity: string
  quizData: unknown
  recordedData: IRecordAnswerType[]
  quizAnswerCount: number
}
