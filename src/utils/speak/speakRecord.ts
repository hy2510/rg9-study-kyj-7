import type {
  ISpeakRecord,
  LocalSpeakRecord,
} from '@interfaces/study/speak/ISpeak'

type SpeakWordsPayload = {
  transcript?: string
  matchedWordIndexes?: number[]
  matchedCount?: number
  totalCount?: number
  isSkipped?: boolean
}

function parseWordsJson(
  wordsJson: string | null | undefined,
): SpeakWordsPayload | undefined {
  if (!wordsJson) return undefined
  try {
    return JSON.parse(wordsJson) as SpeakWordsPayload
  } catch {
    return undefined
  }
}

export function extractMatchedWordIndexes(
  wordsJson: string | null | undefined,
): number[] | undefined {
  const parsed = parseWordsJson(wordsJson)
  if (!parsed || !Array.isArray(parsed.matchedWordIndexes)) return undefined
  return parsed.matchedWordIndexes.filter(
    (n): n is number => typeof n === 'number' && Number.isFinite(n),
  )
}

export function extractIsSkipped(
  wordsJson: string | null | undefined,
): boolean {
  const parsed = parseWordsJson(wordsJson)
  if (!parsed) return false
  if (parsed.isSkipped === true) return true
  const transcript = (parsed.transcript ?? '').trim()
  const matched = Array.isArray(parsed.matchedWordIndexes)
    ? parsed.matchedWordIndexes.length
    : (parsed.matchedCount ?? 0)
  return transcript === '' && matched === 0
}

export function toLocalSpeakRecord(record: ISpeakRecord): LocalSpeakRecord {
  return {
    ...record,
    matchedWordIndexes: extractMatchedWordIndexes(record.WordsJson),
    isSkipped: extractIsSkipped(record.WordsJson),
  }
}
