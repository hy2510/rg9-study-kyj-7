import type { IStudyInfo } from '@src/interfaces/study/IStudyInfo'
import type { ViewType } from '@interfaces/common/ViewType'

export type InitialEntry =
  | { kind: 'view'; view: ViewType }
  | { kind: 'guideReady' }

export function resolveInitialEntry(studyInfo: IStudyInfo): InitialEntry {
  if (studyInfo.isStartWordPractice) {
    return { kind: 'view', view: 'WordPractice' }
  }
  if (studyInfo.isStartSpeak) {
    return { kind: 'view', view: 'Speak' }
  }

  switch (studyInfo.mode) {
    case 'guide':
      return { kind: 'guideReady' }

    case 'preview':
      return { kind: 'view', view: 'Story' }

    case 'student':
    case 'trial':
    case 'staff':
    case 'review':
      return resolveDefaultEntry(studyInfo)
  }
}

function resolveDefaultEntry(studyInfo: IStudyInfo): InitialEntry {
  if (studyInfo.isReview) return { kind: 'view', view: 'Study' }
  if (studyInfo.isSubmitPreference) return { kind: 'view', view: 'Study' }
  if (studyInfo.bookType === 'EB') return { kind: 'view', view: 'Story' }
  return { kind: 'view', view: 'Study' }
}
