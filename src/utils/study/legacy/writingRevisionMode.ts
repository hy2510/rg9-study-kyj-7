import { IWritingActivity2 } from '@src/interfaces/study/IWritingActivity'

export type WritingRevisionMode = 'all' | 'free' | 'limit'

export function resolveWritingRevisionMode(
  mode?: IWritingActivity2['Writing']['Mode'],
): WritingRevisionMode {
  switch (mode) {
    case 'Free':
      return 'free'
    case 'Limit':
      return 'limit'
    case 'All':
    default:
      return 'all'
  }
}

export function writingRevisionModeLabelKey(mode: WritingRevisionMode): string {
  return `study.writing.mode.${mode}`
}
