import { HeaderStudyBaseProps } from '@interfaces/common/header/HeaderStudyBaseProps'
import { StudyMode } from '@interfaces/common/Types'

export type HeaderRemixStudyProps = HeaderStudyBaseProps & {
  engine: 'remix'
  quizInfo: { mode: StudyMode }
  onModeChange: (mode: StudyMode) => void
  acquiredAugmentCount?: number
  onOpenAcquiredAugments?: () => void
  onSkipAct1?: () => void
  reviewCurrent?: number
  reviewTotal?: number
}
