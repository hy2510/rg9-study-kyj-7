import type { LocalSpeakRecord } from '@interfaces/study/speak/ISpeak'

export function computeSpeakAverageScore(
  records: LocalSpeakRecord[],
): number {
  if (records.length === 0) return 0
  const sum = records.reduce((acc, r) => {
    if (r.isSkipped) return acc
    return acc + (Number.isFinite(r.ScoreOverall) ? r.ScoreOverall : 0)
  }, 0)
  return Math.round(sum / records.length)
}
