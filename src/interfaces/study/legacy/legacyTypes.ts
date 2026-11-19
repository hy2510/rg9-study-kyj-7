export type LegacyPenaltyState = 'none' | 'penalty' | 'success'

export type ClozeInputValue = {
  text: string
  isCorrected: boolean
  isRevealed?: boolean
}

export type Summary2FilledEntry = {
  text: string
  isCorrect: boolean
}
