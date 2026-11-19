import { IQuizStudyRef } from '@interfaces/common/quizStudyRef'
import { IRecordAnswerType } from '@src/interfaces/study/legacy/legacyAnswers'

export interface ILegacyStudyData extends IQuizStudyRef {
  readonly currentStep: number
  readonly lastStep: number
  onFinishActivity: () => void
  changeStep: (step: number) => void

  quizData?: unknown
  recordedData?: IRecordAnswerType[]
  onUpdateRecord?: (record: IRecordAnswerType) => void
  onActiveQuizChange?: (currentQuizIndex: number) => void
  onPauseTimer?: () => void
  onResumeTimer?: () => void
  onResetQuizTimer?: () => void
  quizTimeoutSignal?: number
  isRetest?: boolean
}
