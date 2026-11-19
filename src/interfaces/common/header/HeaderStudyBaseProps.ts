import { HeaderBaseProps } from '@interfaces/common/header/HeaderBaseProps'

export type HeaderStudyBaseProps = HeaderBaseProps & {
  variant: 'study'
  shouldShowCenterInfo: boolean
  currentHeart: number
  maxHeart: number
  time: { timeMin: number; timeSec: number }
  formatTime: (timeMin: number, timeSec: number) => string
  progress: number
  total: number
  questionNumber?: number
  isBookTypePB: boolean
  statusLabel?: string
  reviewBadge?: string
}
