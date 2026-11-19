export const DEFAULT_STUDY_TIME = 1200

export const ACTIVITY = {
  LISTENING_1: 'ListeningActivity1',
  LISTENING_2: 'ListeningActivity2',
  LISTENING_3: 'ListeningActivity3',
  LISTENING_4: 'ListeningActivity4',
  VOCABULARY_1: 'Vocabulary1',
  VOCABULARY_2: 'Vocabulary2',
  VOCABULARY_3: 'Vocabulary3',
  VOCABULARY_4: 'Vocabulary4',
  VOCABULARY_PRACTICE_1: 'VocabularyPractice1',
  VOCABULARY_PRACTICE_2: 'VocabularyPractice2',
  VOCABULARY_PRACTICE_3: 'VocabularyPractice3',
  VOCABULARY_PRACTICE_4: 'VocabularyPractice4',
  VOCABULARY_TEST_1: 'VocabularyTest1',
  VOCABULARY_TEST_2: 'VocabularyTest2',
  VOCABULARY_TEST_3: 'VocabularyTest3',
  VOCABULARY_TEST_4: 'VocabularyTest4',
  READING_COMP_1: 'ReadingComprehension1',
  READING_COMP_2: 'ReadingComprehension2',
  READING_COMP_3: 'ReadingComprehension3',
  READING_COMP_4: 'ReadingComprehension4',
  SUMMARY_1: 'Summary1',
  SUMMARY_2: 'Summary2',
  TRUE_OR_FALSE: 'TrueOrFalse',
  CLOZE_1: 'ClozeTest1',
  CLOZE_2: 'ClozeTest2',
  CLOZE_3: 'ClozeTest3',
  WRITING_1: 'WritingActivity1',
  WRITING_2: 'WritingActivity2',
}

const STUDY_API_PATH = 'api/study'
const STUDY_API_PATH_BOOK_READING = 'api/study/book-reading'
const TRIAL_STUDY_API_PATH_BOOK_READING = 'api/trial/study/book-reading'

export const GET_STUDY_INFO_PATH = `${STUDY_API_PATH_BOOK_READING}/quiz/info`

export const GET_TRIAL_STUDY_INFO_PATH = `${TRIAL_STUDY_API_PATH_BOOK_READING}/quiz/info`

export const GET_BOOK_DATA_PATH = `${STUDY_API_PATH_BOOK_READING}/quiz/e-book`

export const SUBMIT_READING_START_PATH = `${STUDY_API_PATH_BOOK_READING}/book/start`

export const SUBMIT_READING_END_PATH = `${STUDY_API_PATH_BOOK_READING}/book/end`

export const SUBMIT_BOOK_MARK_PATH = `${STUDY_API_PATH_BOOK_READING}/book/book-mark`

export const SUBMIT_PREFERENCE_PATH = `${STUDY_API_PATH_BOOK_READING}/book/preference`

export const SUBMIT_ANIMATION_COMPLETE_PATH = `${STUDY_API_PATH_BOOK_READING}/book/animation-complete`

export const SUBMIT_ANIMATION_COMPLETE_PATH_NB = `${STUDY_API_PATH_BOOK_READING}/book/animation-complete-neulbom`

export const GET_QUIZ_DATA_PATH = `${STUDY_API_PATH_BOOK_READING}/quiz/question`

export const GET_RECORD_DATA_PATH = `${STUDY_API_PATH_BOOK_READING}/quiz/record`

export const GET_HINT_PATH = `${STUDY_API_PATH_BOOK_READING}/quiz/hint`

export const SAVE_STUDENT_ANSWER_PATH = `${STUDY_API_PATH_BOOK_READING}/quiz/save`

export const SAVE_STUDENT_PARTIAL_ANSWER_PATH = `${STUDY_API_PATH_BOOK_READING}/quiz/save/partial-record`

export const SAVE_WRITING_PATH = `${STUDY_API_PATH_BOOK_READING}/quiz/save/writing`
export const SAVE_RE_WRITING_PATH = `${STUDY_API_PATH_BOOK_READING}/quiz/save/re-writing`

export const SAVE_VOCA_PRACTICE_PATH = `${STUDY_API_PATH_BOOK_READING}/quiz/save/vocabulary-practice`

export const DELETE_PENALTY_PATH = `${STUDY_API_PATH_BOOK_READING}/quiz/save/clear-penalty`

export const CHECK_SESSION_PATH = `${STUDY_API_PATH}/check-session`
