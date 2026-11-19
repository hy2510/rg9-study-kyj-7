import { ClozeInputValue } from '@interfaces/study/legacy/legacyTypes'
import {
  buildDisplayText,
  getInputChars,
  isSpellingCorrect,
} from '@utils/spellingUtils'

export const CLOZE_TYPE_SPACE = true

export function getClozeInputChars(text: string): string {
  return getInputChars(text, CLOZE_TYPE_SPACE)
}

export function buildClozeDisplayText(answer: string, input: string): string {
  return buildDisplayText(answer, input, CLOZE_TYPE_SPACE)
}

export function isClozeSpellingCorrect(input: string, answer: string): boolean {
  return isSpellingCorrect(input, answer, CLOZE_TYPE_SPACE)
}

export function buildEmptyInputs(examples: unknown[]): ClozeInputValue[] {
  return examples.map(() => ({ text: '', isCorrected: false }))
}

export function normalizeInputText(text: string): string {
  const tail = text.slice(-1)
  if (tail === '\u2018' || tail === '\u2019') return text.slice(0, -1) + "'"
  if (tail === '\u201D') return text.slice(0, -1) + '"'
  return text
}

export function findNextUncorrectedIndex(
  values: ClozeInputValue[],
  currentIndex: number,
): number {
  const uncorrected = values
    .map((_, i) => i)
    .filter((i) => !values[i].isCorrected && i !== currentIndex)
  if (uncorrected.length === 0) return -1
  return uncorrected.find((i) => i > currentIndex) ?? uncorrected[0]
}

export type SentenceToken = {
  word: string
  index: number
  key: number
}

export function buildSentenceTokens(sentence: string): SentenceToken[] {
  let blankIdx = -1
  return sentence.split(' ').map((word, i) => {
    const hasBlank = word.includes('┒')
    if (hasBlank) blankIdx += 1
    return { word, index: hasBlank ? blankIdx : -1, key: i }
  })
}
