import { LegacyStepData } from '@interfaces/study/legacy/LegacyStepData'
import { IRecordAnswerType } from '@src/interfaces/common/Common'

export type LegacyQuizManagerState = {
  stepDataMap: Record<number, LegacyStepData>
  isLoading: boolean
  error: Error | null
  patchStepRecord: (stepId: number, record: IRecordAnswerType) => void
  resetStepRecord: (stepId: number) => void
}
