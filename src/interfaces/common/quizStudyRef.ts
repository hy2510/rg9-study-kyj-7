import { BookType, Mode, StudyTypeCode } from '@src/interfaces/common/Types'

export interface IUserData {
  readonly mode: Mode
  readonly studentHistoryId: string
}

export interface IQuizStudyRef extends IUserData {
  readonly studyId: string
  readonly bookType: BookType
  readonly studyTypeCode: StudyTypeCode
}
