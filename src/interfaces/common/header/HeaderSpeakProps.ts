import { HeaderBaseProps } from '@interfaces/common/header/HeaderBaseProps'

export type HeaderSpeakProps = HeaderBaseProps & {
  variant: 'speak'
  progress?: number
  total?: number
  onBackToStory: () => void
  onOpenSpeakPractice?: () => void
}
