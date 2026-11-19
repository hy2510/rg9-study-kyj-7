import { HeaderStudyBaseProps } from '@interfaces/common/header/HeaderStudyBaseProps'
import { LegacyStepProgress } from '@interfaces/common/header/LegacyStepProgress'

export type HeaderLegacyStudyProps = HeaderStudyBaseProps & {
  engine: 'legacy'
  openSteps: number[]
  currentStepId: number
  stepProgressMap: Record<number, LegacyStepProgress | undefined>
  mappedStepActivity: string[]
  showVocaCardsMenu?: boolean
  onOpenVocaCards?: () => void
  onNavigateStep?: (stepId: number) => void
}
