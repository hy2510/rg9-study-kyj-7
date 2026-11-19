import type { BookInfo } from '@src/interfaces/common/IBookInfo'

export type QuizReward = {
  tier: 'none' | 'half' | 'full'
  point: number
}

export function computeQuizReward(bookInfo: BookInfo): QuizReward {
  const completedCount = Number(bookInfo.PassCount) || 0
  const currentMode = `${bookInfo.StudyMode ?? ''} ${
    bookInfo.FullEasyCode ?? ''
  }`
    .trim()
    .toLowerCase()
  const isEasyMode =
    currentMode.includes('easy') ||
    currentMode.split(/\s+/).some((value) => value === 'e')

  if (completedCount >= 2) {
    return { tier: 'none', point: 0 }
  }

  if (completedCount === 1 || isEasyMode) {
    const configuredSecondPoint = Number(bookInfo.SecondRgPoint) || 0
    const halfPoint =
      configuredSecondPoint > 0
        ? configuredSecondPoint
        : (Number(bookInfo.RgPoint) || 0) / 2
    return {
      tier: 'half',
      point: Number(halfPoint.toFixed(2)),
    }
  }

  return {
    tier: 'full',
    point: Number((Number(bookInfo.RgPoint) || 0).toFixed(2)),
  }
}
