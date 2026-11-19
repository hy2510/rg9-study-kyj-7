import { BookType, Mode, StudyEntryType } from '@src/interfaces/common/Types'

interface IStudyInfo {
  allSteps: number[]
  availableQuizStatus: 0 | 1 | 2
  isAvailableSpeaking: boolean
  isSubmitPreference: boolean
  mappedStepActivity: string[]
  openSteps: number[]
  startStep: number

  studyId: string
  studentHistoryId: string
  bookType: BookType
  mode: Mode
  isReview?: boolean
  isReTestYn?: boolean
  isSuper: boolean
  isQuizLearning: boolean

  token: string
  isDev: boolean

  isEbAnotherSizeYn: boolean

  bookmarkPage: number
  pbookStorySoundPath: string | undefined

  studyEntryType: StudyEntryType

  isStartWordPractice?: boolean

  isStartSpeak?: boolean
}

export type { IStudyInfo }
