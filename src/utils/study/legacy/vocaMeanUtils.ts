import {
  IVocaQuestionBase,
  MeanLanguage,
} from '@src/interfaces/study/IVocabulary'

export function meanLangKey(
  lang: MeanLanguage,
):
  | 'Korean'
  | 'Chinese'
  | 'Japanese'
  | 'Vietnamese'
  | 'Indonesian'
  | 'English'
  | null {
  switch (lang) {
    case 'korean':
      return 'Korean'
    case 'chinese':
      return 'Chinese'
    case 'japanese':
      return 'Japanese'
    case 'vietnamese':
      return 'Vietnamese'
    case 'indonesian':
      return 'Indonesian'
    case 'english':
      return 'English'
    default:
      return null
  }
}

export function pickMainMean(
  question: IVocaQuestionBase,
  mainLang: MeanLanguage,
): string {
  const key = meanLangKey(mainLang)
  if (key) return question[key] ?? question.Korean
  return question.Korean
}

export function pickSubMean(
  question: IVocaQuestionBase,
  subLang: MeanLanguage,
): string {
  if (question.Britannica) return question.Britannica
  const key = meanLangKey(subLang)
  if (key) return question[key] ?? ''
  return ''
}
