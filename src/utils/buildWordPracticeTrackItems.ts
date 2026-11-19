import type { WordMeaningPracticeItem } from '@interfaces/study/word-practice/wordMeaningPractice'
import type {
  WordPracticeContentItem,
  WordPracticeQuizItem,
} from '@interfaces/study/word-practice/wordPractice'
import { type WordPracticeTrack } from '@src/constants/study/word-practice/wordPracticeLevels'

import { getWordPracticeMeaning } from './getWordPracticeMeaning'

export function buildWordPracticeTrackItems(
  quizItems: WordPracticeQuizItem[],
  track: WordPracticeTrack,
  language: string,
): {
  trackAItems: WordPracticeContentItem[]
  trackBItems: WordMeaningPracticeItem[]
} {
  if (track === 'a') {
    return {
      trackAItems: quizItems.map((item) => ({
        wordId: item.WordId,
        image: item.ImagePath,
        word: item.Word,
        sound: item.SoundPath,
        meaning: getWordPracticeMeaning(item, language),
      })),
      trackBItems: [],
    }
  }
  return {
    trackAItems: [],
    trackBItems: quizItems.map((item) => ({
      wordId: item.WordId,
      word: item.Word,
      meaning: getWordPracticeMeaning(item, language),
      sound: item.SoundPath,
    })),
  }
}
