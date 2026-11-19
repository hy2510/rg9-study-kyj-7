import { ShuffledQuizItem } from '@hooks/study/remix/useQuizManager'
import { StudyMode } from '@interfaces/common/Types'

export type QuizInfo = {
  mode: StudyMode
  stage: number
  round: number
  isAct1: boolean
  incorrectQuizzes: ShuffledQuizItem[]
}
