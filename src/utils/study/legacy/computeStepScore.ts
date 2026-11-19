import type { LegacyQuizMark } from '@interfaces/common/header/LegacyQuizMark'

const ATTEMPT_WEIGHTS = [1.0, 0.5, 0.25] as const

export function computeStepScore(attempts: LegacyQuizMark[][]): number {
  const total = attempts.length
  if (total === 0) return 0

  const point = 100 / total
  let score = 0

  for (const row of attempts) {
    const firstCorrectIdx = row.indexOf('O')
    if (firstCorrectIdx >= 0 && firstCorrectIdx < ATTEMPT_WEIGHTS.length) {
      score += point * ATTEMPT_WEIGHTS[firstCorrectIdx]
    }
  }

  return Math.round(score)
}

export function countCorrectRows(attempts: LegacyQuizMark[][]): number {
  let n = 0
  for (const row of attempts) {
    if (row.includes('O')) n++
  }
  return n
}
