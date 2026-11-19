import { type Ref } from 'react'

import type { StoryReadingProfile } from '@constants/story/storyReadingProfile'
import { HeaderBaseProps } from '@interfaces/common/header/HeaderBaseProps'
import type { StoryVocaKeywordRow } from '@utils/story/flattenVocabularyPracticeRows'

export type HeaderStoryProps = HeaderBaseProps & {
  variant: 'story'
  progress?: number
  total?: number
  onVocaClick?: () => void
  onSpeakClick?: () => void
  onMovieClick?: () => void
  onReadAgainClick?: () => void
  vocaAnchorRef?: Ref<HTMLButtonElement>
  isAutoNext?: boolean
  onAutoNextToggle?: () => void
  readingProfile?: StoryReadingProfile
  profileAnchorRef?: Ref<HTMLButtonElement>
  isProfileBalloonOpen?: boolean
  onProfileBalloonToggle?: () => void
  playbackRate?: number
  speedAnchorRef?: Ref<HTMLButtonElement>
  isSpeedBalloonOpen?: boolean
  onSpeedBalloonToggle?: () => void
  storyVocaKeywordRows?: StoryVocaKeywordRow[]
  storyVocabularyPrintUrl?: string
  pauseBookAudio?: () => void
  isGoQuizDisabled?: boolean
  goQuizDisabledMessageKey?: string
}
