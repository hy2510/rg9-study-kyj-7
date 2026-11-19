import { BookInfo } from '@src/interfaces/common/IBookInfo'
import { IStudyInfo } from '@src/interfaces/study/IStudyInfo'

export function isObserverMode(
  studyInfo: Pick<IStudyInfo, 'mode'> | undefined,
): boolean {
  return studyInfo?.mode === 'staff'
}

export function isReviewPassMode(
  studyInfo: Pick<IStudyInfo, 'mode'> | undefined,
  bookInfo: Pick<BookInfo, 'Average'> | undefined,
): boolean {
  if (!studyInfo || !bookInfo) return false
  if (studyInfo.mode !== 'review') return false
  return Number(bookInfo.Average) >= 70
}

export function isReviewFailMode(
  studyInfo: Pick<IStudyInfo, 'mode'> | undefined,
  bookInfo: Pick<BookInfo, 'Average'> | undefined,
): boolean {
  if (!studyInfo || !bookInfo) return false
  if (studyInfo.mode !== 'review') return false
  return Number(bookInfo.Average) < 70
}
