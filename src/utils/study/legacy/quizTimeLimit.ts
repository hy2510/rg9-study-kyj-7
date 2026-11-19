import { ACTIVITY, DEFAULT_STUDY_TIME } from '@src/constants/study/studyConstants'

const CONFIRM_ON_TIMEOUT_ACTIVITIES = new Set<string>([
  ACTIVITY.CLOZE_1,
  ACTIVITY.CLOZE_2,
  ACTIVITY.CLOZE_3,
  ACTIVITY.READING_COMP_4,
  ACTIVITY.VOCABULARY_1,
  ACTIVITY.VOCABULARY_3,
  ACTIVITY.VOCABULARY_4,
  ACTIVITY.SUMMARY_1,
  ACTIVITY.SUMMARY_2,
  ACTIVITY.TRUE_OR_FALSE,
])

const TRUE_OR_FALSE_LOGOUT_THRESHOLD_SEC = 300

export function readAdminQuizTimeSec(quizData: unknown): number {
  const raw = Number(
    (quizData as { QuizTime?: unknown } | null | undefined)?.QuizTime,
  )
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0
}

export function resolveQuizTimeSec(quizData: unknown): number {
  return readAdminQuizTimeSec(quizData) || DEFAULT_STUDY_TIME
}

export function isConfirmOnTimeoutActivity(activity: string): boolean {
  return CONFIRM_ON_TIMEOUT_ACTIVITIES.has(activity)
}

export function shouldLogoutOnTimeoutContinue({
  activity,
  bookCode,
  bookLevel,
  adminQuizTimeSec,
}: {
  activity: string
  bookCode?: string
  bookLevel?: string
  adminQuizTimeSec: number
}): boolean {
  if (activity === ACTIVITY.SUMMARY_1) {
    const isEB = bookCode?.includes('EB') ?? false
    const level = bookLevel ?? ''
    return isEB && (level.includes('1') || level.includes('K'))
  }
  if (activity === ACTIVITY.TRUE_OR_FALSE) {
    return adminQuizTimeSec > TRUE_OR_FALSE_LOGOUT_THRESHOLD_SEC
  }
  return false
}
