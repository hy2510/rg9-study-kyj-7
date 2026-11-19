import type { BookInfo } from '@src/interfaces/common/IBookInfo'
import type { IStudyInfo } from '@src/interfaces/study/IStudyInfo'

export function canEnterQuiz(
  studyInfo: Pick<IStudyInfo, 'mode' | 'isSubmitPreference'>,
  bookInfo: Pick<BookInfo, 'ReadingCompletedEB'> | undefined,
): boolean {
  if (studyInfo.mode === 'preview') return false
  if (studyInfo.mode === 'staff') return true
  return Boolean(
    studyInfo.isSubmitPreference || bookInfo?.ReadingCompletedEB === 'Y',
  )
}

export function getGoQuizDisabledMessageKey(
  studyInfo: Pick<IStudyInfo, 'mode'>,
): string {
  if (studyInfo.mode === 'preview') return 'story.previewCannotStudy'
  return 'story.quizRequiresFullReading'
}
