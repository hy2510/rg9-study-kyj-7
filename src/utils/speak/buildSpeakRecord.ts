import type {
  LocalSpeakRecord,
  SpeakPageProps,
} from '@src/interfaces/study/speak/ISpeak'

export function buildSpeakRecord(
  item: SpeakPageProps,
  scoreOverall: number,
  matchedWordIndexes?: number[],
  isSkipped: boolean = false,
): LocalSpeakRecord {
  return {
    Page: item.Page,
    Sequence: item.Sequence,
    QuizNo: item.QuizNo,
    Sentence: item.Sentence,
    ScoreOverall: scoreOverall,
    ScoreWord: 0,
    ScorePronunciation: 0,
    ScoreProsody: 0,
    ScoreIntonation: 0,
    ScoreTiming: 0,
    ScoreLoudness: 0,
    matchedWordIndexes,
    isSkipped,
  }
}
