import type { WordPracticeQuizItem } from '@interfaces/study/word-practice/wordPractice'

type WordPracticeLanguage = 'ko' | 'zh' | 'ja' | 'vi' | 'id' | 'en'

const LANGUAGE_FIELD_MAP: Record<WordPracticeLanguage, keyof WordPracticeQuizItem> = {
  ko: 'Korean',
  zh: 'Chinese',
  ja: 'Japanese',
  vi: 'Vietnamese',
  id: 'Indonesian',
  en: 'English',
}

export function getWordPracticeMeaning(
  item: WordPracticeQuizItem,
  language: string,
): string {
  if (language === 'en') {
    const britannica = String(item.Britannica ?? '').trim()
    if (britannica) return item.Britannica
    return String(item.English ?? '')
  }

  const field = LANGUAGE_FIELD_MAP[language as WordPracticeLanguage]
  return field ? String(item[field] ?? '') : item.Korean
}
