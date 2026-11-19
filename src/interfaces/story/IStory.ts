import { ViewType } from '@interfaces/common/ViewType'
import type { StoryReadingProfile } from '@src/constants/story/storyReadingProfile'

interface StoryProps {
  bookLevel: string
  studyId: string
  studentHistoryId: string
  isEbAnotherSizeYn: boolean
  isMovieShow: boolean
  storyData: PageProps[]
  toggleMovieShow: (isShow: boolean) => void
  isReadingComplete: boolean
  changeReadingComplete: () => Promise<void>
  isVisible?: boolean
  onRegisterPause?: (pauseFn: () => void) => void
  onRegisterStop?: (stopFn: () => void) => void
  onPageNumberChange?: (maxVisibleBookPage: number) => void
  onRegisterChangeAutoNextPage?: (change: (next: boolean) => void) => void
  onAutoNextChange?: (isAutoNext: boolean) => void
  onPlaybackRateChange?: (rate: number) => void
  onRegisterChangePlaybackRate?: (setRate: (rate: number) => void) => void
  readingProfile: StoryReadingProfile
  hasHighlightData?: boolean
  onFinalNext?: () => void
  onImagesLoaded?: () => void
  bookInteractionMode?: 'default' | 'speak'
  initialPageNumber?: number
  initialSpreadHalf?: 0 | 1
  isBookmarkEnabled?: boolean
}
interface StoryMobileProps {
  isRatingShow: boolean
  isMovieShow: boolean
  storyData: PageProps[]
  changeCurrentView: (view: ViewType) => void
  toggleMovieShow: (isShow: boolean) => void
  changeReadingComplete: (
    studyId: string,
    studentHistoryId: string,
  ) => Promise<void>
}

type PageState = '' | 'play' | 'left' | 'right'
type PageProps = {
  BookId: string
  Page: number
  Css: string
  Contents: string
  FontColor: string
  ImagePath: string
  Sequence: number
  StartTime: number
  EndTime: number
  SoundPath: string
  SoundPath2: string
  MarginTop: number
  MarginLeft: number
}

type StoryPageProps = {
  isTextShow: boolean
  pageSeq: PageSequenceProps
  pageNumber: number
  storyData: PageProps[]
  currentTime: number
  readCnt: number
  isHighlight: boolean
  clickSentence: (page: number, sequence: number) => void
}

type PageSequenceProps = {
  playPage: number
  sequence: number
}

type StoryMenuItemProps = {
  name: string
  selected: '' | 'on'
}

type StoryMenuSpeedItemProps = {
  rate: number
  selected: '' | 'on'
}

type PlayState = '' | 'play' | 'stop' | 'pause' | 'resume'

type MovieBookPCProps = {
  isRatingShow: boolean
  url: string
  changeCurrentView: (view: ViewType) => void
}

type MovieBookMobileProps = {
  isRatingShow: boolean
  url: string
  changeCurrentView: (view: ViewType) => void
}

export type {
  MovieBookMobileProps,
  MovieBookPCProps,
  PageProps,
  PageSequenceProps,
  PageState,
  PlayState,
  StoryMenuItemProps,
  StoryMenuSpeedItemProps,
  StoryMobileProps,
  StoryPageProps,
  StoryProps,
}

export type { StoryReadingProfile } from '@src/constants/story/storyReadingProfile'
