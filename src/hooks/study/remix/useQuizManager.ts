import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import shuffle from 'lodash/shuffle'

import { AppContext, AppContextProps } from '@contexts/AppContext'
import {
  getClozeTest1,
  getClozeTest2,
  getClozeTest3,
} from '@services/quiz/ClozeTestAPI'
import {
  getListeningActivity1,
  getListeningActivity2,
  getListeningActivity3,
  getListeningActivity4,
} from '@services/quiz/ListeningActivityApi'
import {
  getReadingComprehension1,
  getReadingComprehension2,
  getReadingComprehension3,
  getReadingComprehension4,
} from '@services/quiz/ReadingComprehensionAPI'
import { getSummary1, getSummary2 } from '@services/quiz/SummaryApi'
import { getTrueOrFalse } from '@services/quiz/TrueOrFalseAPI'
import {
  getVocabularyTest1,
  getVocabularyTest2,
  getVocabularyTest3,
  getVocabularyTest4,
} from '@services/quiz/VocabularyAPI'
import {
  getWritingActivity1,
  getWritingActivity2,
} from '@services/quiz/WritingActivityAPI'
import { ACTIVITY } from '@src/constants/study/studyConstants'
import { IQuizStudyRef } from '@src/interfaces/common/Common'

export type ActivityType = (typeof ACTIVITY)[keyof typeof ACTIVITY]

const ACTIVITY_API_MAP: Record<
  ActivityType,
  (studyData: IQuizStudyRef) => Promise<QuizData>
> = {
  [ACTIVITY.CLOZE_1]: getClozeTest1,
  [ACTIVITY.CLOZE_2]: getClozeTest2,
  [ACTIVITY.CLOZE_3]: getClozeTest3,
  [ACTIVITY.TRUE_OR_FALSE]: getTrueOrFalse,
  [ACTIVITY.READING_COMP_1]: getReadingComprehension1,
  [ACTIVITY.READING_COMP_2]: getReadingComprehension2,
  [ACTIVITY.READING_COMP_3]: getReadingComprehension3,
  [ACTIVITY.READING_COMP_4]: getReadingComprehension4,
  [ACTIVITY.LISTENING_1]: getListeningActivity1,
  [ACTIVITY.LISTENING_2]: getListeningActivity2,
  [ACTIVITY.LISTENING_3]: getListeningActivity3,
  [ACTIVITY.LISTENING_4]: getListeningActivity4,
  [ACTIVITY.VOCABULARY_1]: getVocabularyTest1,
  [ACTIVITY.VOCABULARY_2]: getVocabularyTest2,
  [ACTIVITY.VOCABULARY_3]: getVocabularyTest3,
  [ACTIVITY.VOCABULARY_4]: getVocabularyTest4,
  [ACTIVITY.WRITING_1]: getWritingActivity1,
  [ACTIVITY.WRITING_2]: getWritingActivity2,
  [ACTIVITY.SUMMARY_1]: getSummary1,
  [ACTIVITY.SUMMARY_2]: getSummary2,
} as Record<ActivityType, (studyData: IQuizStudyRef) => Promise<QuizData>>

const QUIZ_CONSTANTS = {
  ROUNDS_PER_STAGE: 5,
  OTHERS_ROUNDS: 4,
  VOCABULARY_ROUND: 5,
} as const

const LevelUtils = {
  isKLevel: (bookLevel: string): boolean => {
    return bookLevel.toUpperCase().startsWith('K')
  },

  isLevel1: (bookLevel: string): boolean => {
    return bookLevel.toUpperCase().startsWith('1')
  },

  isCardVocaLevel: (bookLevel: string): boolean => {
    const upper = bookLevel.toUpperCase()
    return !upper.startsWith('K') && !upper.startsWith('1')
  },

  getTotalStages: (bookLevel: string): number => {
    const level = bookLevel.toUpperCase().substring(0, 1)
    const stageMap: Record<string, number> = {
      K: 1,
      '1': 2,
      '2': 3,
      '3': 3,
      '4': 4,
      '5': 4,
      '6': 4,
    }
    return stageMap[level] ?? 1
  },

  getLevelPrefix: (bookLevel: string): string => {
    return bookLevel.toUpperCase().substring(0, 1)
  },
}

export type BaseQuiz = {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Sound: string
    Image: string
    Korean: string
    English: string
    Britannica: string
    Chinese: string
    Japanese: string
    Vietnamese: string
    Indonesian: string
    [key: string]: any
  }
  Examples: {
    Text: string
    Sound: string
    Image: string
    Korean: string
    [key: string]: any
  }[]
  [key: string]: any
}

type QuizData = {
  Quiz: BaseQuiz[]
  ContentsId?: number
  IsQuizTimeoutIncorrect?: boolean
  QuizAnswerCount?: number
  QuizTime?: number
  [key: string]: any
}

function normalizeQuizToBase(quiz: any): BaseQuiz {
  return {
    QuizId: quiz.QuizId || '',
    QuizNo: quiz.QuizNo || 0,
    Question: quiz.Question || {},
    Examples: quiz.Examples || [],
    ...quiz,
  }
}

export interface QuizDataWithActivityType {
  activityType: ActivityType
  data: QuizData
}

export interface ShuffledQuizItem {
  activityType: ActivityType
  quizzes: BaseQuiz[]
  originalQuizNo: number
}

export interface QuizStage {
  stage: number
  quizzes: ShuffledQuizItem[]
}

function isVocabularyActivity(activityType: ActivityType): boolean {
  return (
    activityType === ACTIVITY.VOCABULARY_1 ||
    activityType === ACTIVITY.VOCABULARY_2 ||
    activityType === ACTIVITY.VOCABULARY_3 ||
    activityType === ACTIVITY.VOCABULARY_4
  )
}

function separateVocabularyQuizzes(quizzes: ShuffledQuizItem[]): {
  vocabulary: ShuffledQuizItem[]
  others: ShuffledQuizItem[]
} {
  const vocabulary: ShuffledQuizItem[] = []
  const others: ShuffledQuizItem[] = []

  quizzes.forEach((quiz) => {
    if (isVocabularyActivity(quiz.activityType)) {
      vocabulary.push(quiz)
    } else {
      others.push(quiz)
    }
  })

  return { vocabulary, others }
}

function groupVocabulary(
  vocabularyQuizzes: ShuffledQuizItem[],
  totalStages: number,
): ShuffledQuizItem[] {
  const ordered = [...vocabularyQuizzes].sort(
    (a, b) => a.originalQuizNo - b.originalQuizNo,
  )
  const groupSize = Math.floor(ordered.length / totalStages)
  const groups: ShuffledQuizItem[] = []

  for (let i = 0; i < ordered.length; i += groupSize) {
    const vocabularyGroup = ordered.slice(i, i + groupSize)

    groups.push({
      activityType: ordered[i].activityType,
      quizzes: vocabularyGroup.flatMap((item) => item.quizzes),
      originalQuizNo: ordered[i].originalQuizNo,
    })
  }

  return groups
}

function groupAndShuffleByType(quizzes: ShuffledQuizItem[]): {
  shuffledGroups: Map<string, ShuffledQuizItem[]>
  shuffledTypeOrder: string[]
  typeIndices: Map<string, number>
} {
  const groupedByType = new Map<string, ShuffledQuizItem[]>()
  quizzes.forEach((quiz) => {
    const type = quiz.activityType
    if (!groupedByType.has(type)) {
      groupedByType.set(type, [])
    }
    groupedByType.get(type)!.push(quiz)
  })

  const shuffledGroups = new Map<string, ShuffledQuizItem[]>()
  groupedByType.forEach((items, type) => {
    shuffledGroups.set(
      type,
      isVocabularyActivity(type as ActivityType)
        ? [...items].sort((a, b) => a.originalQuizNo - b.originalQuizNo)
        : shuffle(items),
    )
  })

  const typeKeys = Array.from(shuffledGroups.keys())
  const shuffledTypeOrder = shuffle(typeKeys)
  const typeIndices = new Map<string, number>()
  typeKeys.forEach((key) => typeIndices.set(key, 0))

  return { shuffledGroups, shuffledTypeOrder, typeIndices }
}

function distributeByRoundRobin(
  quizzes: ShuffledQuizItem[],
  maxItems?: number,
): ShuffledQuizItem[] {
  if (quizzes.length === 0) return []

  const { shuffledGroups, shuffledTypeOrder, typeIndices } =
    groupAndShuffleByType(quizzes)

  const distributed: ShuffledQuizItem[] = []
  const totalItems = maxItems ?? quizzes.length
  let distributedCount = 0
  const maxRounds = quizzes.length
  let currentRound = 0

  while (distributedCount < totalItems && currentRound < maxRounds) {
    for (const type of shuffledTypeOrder) {
      const items = shuffledGroups.get(type)!
      const currentIndex = typeIndices.get(type)!

      if (currentIndex < items.length) {
        distributed.push(items[currentIndex])
        typeIndices.set(type, currentIndex + 1)
        distributedCount++

        if (distributedCount >= totalItems) break
      }
    }
    currentRound++
  }

  return distributed
}

function distributeCardVocaLevel(
  quizzes: ShuffledQuizItem[],
  totalStages: number,
  bookLevel: string,
): ShuffledQuizItem[] {
  const { vocabulary, others } = separateVocabularyQuizzes(quizzes)

  const vocabularyGroups = groupVocabulary(vocabulary, totalStages)

  const distributedOthers = distributeByRoundRobin(others)

  const result: ShuffledQuizItem[] = []

  for (let stage = 1; stage <= totalStages; stage++) {
    const startIdx = (stage - 1) * QUIZ_CONSTANTS.OTHERS_ROUNDS
    const endIdx = startIdx + QUIZ_CONSTANTS.OTHERS_ROUNDS
    const stageOthers = distributedOthers.slice(startIdx, endIdx)

    result.push(...stageOthers, vocabularyGroups[stage - 1])
  }

  return result
}

function distributeActivityTypes(
  bookLevel: string,
  totalStages: number,
  quizzes: ShuffledQuizItem[],
  useCardVocaLayout: boolean,
): ShuffledQuizItem[] {
  if (quizzes.length === 0) return []

  if (useCardVocaLayout) {
    return distributeCardVocaLevel(quizzes, totalStages, bookLevel)
  }

  return distributeByRoundRobin(quizzes)
}

function transformListeningActivity1(data: QuizData): QuizData {
  const { Quiz = [], Examples = [] } = data
  const examples = Examples as { Text?: string; Image?: string }[]

  if (!Array.isArray(examples) || examples.length === 0) {
    return { ...data, Quiz: [] }
  }

  const merged: BaseQuiz[] = examples.map((ex, idx) => {
    const matchingQuiz = Array.isArray(Quiz)
      ? Quiz.find((q) => q.Question?.Text === ex.Text)
      : null

    if (matchingQuiz) {
      return normalizeQuizToBase({
        ...matchingQuiz,
        Question: {
          ...matchingQuiz.Question,
          Text: ex.Text ?? '',
          Image: ex.Image ?? '',
          Sound: matchingQuiz.Question?.Sound ?? '',
        },
        Examples: [],
      })
    }

    return normalizeQuizToBase({
      QuizId: `distractor-${idx}`,
      QuizNo: 0,
      Question: { Text: ex.Text ?? '', Image: ex.Image ?? '', Sound: '' },
      Examples: [],
    })
  })

  return {
    ...data,
    Quiz: shuffle(merged),
  }
}

const LA2_MAX_CARDS = 6

function transformListeningActivity2(data: QuizData): QuizData {
  const { Quiz = [], Examples = [] } = data
  const examples = Examples as { Text?: string }[]

  if (!Array.isArray(examples) || examples.length === 0) {
    const quizOnly = Array.isArray(Quiz)
      ? Quiz.map(normalizeQuizToBase).slice(0, LA2_MAX_CARDS)
      : []
    return { ...data, Quiz: shuffle(quizOnly) }
  }

  const correct: BaseQuiz[] = []
  const distractors: BaseQuiz[] = []

  examples.forEach((ex, idx) => {
    const matchingQuiz = Array.isArray(Quiz)
      ? Quiz.find((q) => q.Question?.Text === ex.Text)
      : null

    const item = matchingQuiz
      ? normalizeQuizToBase({
          ...matchingQuiz,
          Question: {
            ...matchingQuiz.Question,
            Text: ex.Text ?? '',
            Image: '',
            Sound: matchingQuiz.Question?.Sound ?? '',
          },
          Examples: [],
        })
      : normalizeQuizToBase({
          QuizId: `distractor-${idx}`,
          QuizNo: 0,
          Question: { Text: ex.Text ?? '', Image: '', Sound: '' },
          Examples: [],
        })

    if (matchingQuiz) {
      correct.push(item)
    } else {
      distractors.push(item)
    }
  })

  const distractorSlots = Math.max(0, LA2_MAX_CARDS - correct.length)
  const selectedDistractors = shuffle(distractors).slice(0, distractorSlots)
  const merged = shuffle([...correct, ...selectedDistractors])

  return { ...data, Quiz: merged }
}

function shuffleQuizIfNeeded(
  data: QuizData | null,
  activityType?: ActivityType,
): QuizData {
  if (!data || !Array.isArray(data.Quiz) || data.Quiz.length === 0) {
    return { Quiz: [] }
  }

  switch (activityType) {
    case ACTIVITY.LISTENING_1:
      return transformListeningActivity1(data)
    case ACTIVITY.LISTENING_2:
      return transformListeningActivity2(data)
    default:
      return {
        ...data,
        Quiz: (isVocabularyActivity(activityType as ActivityType)
          ? [...data.Quiz].sort((a, b) => a.QuizNo - b.QuizNo)
          : shuffle(data.Quiz)
        ).map(normalizeQuizToBase),
      }
  }
}

interface UseQuizManagerReturn {
  isLoading: boolean
  act1Data: QuizDataWithActivityType[]
  shuffledQuizStages: QuizStage[]
  activityTypes: ActivityType[]
}

export function useQuizManager(studyData: IQuizStudyRef): UseQuizManagerReturn {
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps

  const [act1Data, setAct1Data] = useState<QuizDataWithActivityType[]>([])
  const [act2Data, setAct2Data] = useState<QuizDataWithActivityType[]>([])
  const [shuffledQuizStages, setShuffledQuizStages] = useState<QuizStage[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const getQuizDataByActivityType = useCallback(
    async (activityType: ActivityType): Promise<QuizData | null> => {
      const apiFunction = ACTIVITY_API_MAP[activityType]

      if (!apiFunction) {
        console.warn(`Unknown activity type: ${activityType}`, {
          allActivities: Object.values(ACTIVITY),
          received: activityType,
        })
        return null
      }

      return await apiFunction(studyData)
    },
    [studyData],
  )

  const fetchAllQuizData = useCallback(async () => {
    setIsLoading(true)

    try {
      const quizDataPromises = studyInfo.mappedStepActivity.map(
        async (
          activityType: ActivityType,
        ): Promise<QuizDataWithActivityType> => {
          try {
            const data = await getQuizDataByActivityType(activityType)
            const shuffledData = shuffleQuizIfNeeded(data, activityType)

            return {
              activityType,
              data: shuffledData,
            }
          } catch (err) {
            return {
              activityType,
              data: {
                Quiz: [],
              },
            }
          }
        },
      )
      const results = await Promise.all(quizDataPromises)

      const act1Data = filterQuizDataForAct1(results, bookInfo.BookLevel)
      setAct1Data(act1Data)

      const act2Data = filterQuizDataForAct2(results)
      setAct2Data(act2Data)

      const stages = prepareShuffledQuizStages(act2Data, bookInfo.BookLevel)
      setShuffledQuizStages(stages)
    } catch (err) {
      setAct1Data([])
      setAct2Data([])
      setShuffledQuizStages([])
      console.error('퀴즈 데이터 로딩 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }, [
    studyInfo.mappedStepActivity,
    getQuizDataByActivityType,
    bookInfo.BookLevel,
  ])

  useEffect(() => {
    if (
      studyInfo.mappedStepActivity &&
      studyInfo.mappedStepActivity.length > 0
    ) {
      fetchAllQuizData()
    }
  }, [fetchAllQuizData])

  const activityTypes = useMemo<ActivityType[]>(() => {
    const types = act2Data.map((data) => data.activityType)
    return [...new Set(types)]
  }, [act2Data])

  return {
    isLoading,
    act1Data,
    shuffledQuizStages,
    activityTypes,
  }
}

export function filterQuizDataForAct1(
  allQuizData: QuizDataWithActivityType[],
  bookLevel: string,
): QuizDataWithActivityType[] {
  let act1Activities: string[] = []

  if (LevelUtils.isKLevel(bookLevel)) {
    act1Activities = [
      ACTIVITY.LISTENING_1,
      ACTIVITY.LISTENING_2,
      ACTIVITY.SUMMARY_1,
    ]
  } else {
    act1Activities = [
      ACTIVITY.SUMMARY_1,
      ACTIVITY.SUMMARY_2,
      ACTIVITY.TRUE_OR_FALSE,
    ]
  }

  return allQuizData.filter((quiz) =>
    act1Activities.includes(quiz.activityType),
  )
}

export function filterQuizDataForAct2(
  allQuizData: QuizDataWithActivityType[],
): QuizDataWithActivityType[] {
  return allQuizData.filter((quiz) => {
    const { activityType } = quiz

    if (
      activityType === ACTIVITY.WRITING_2 ||
      activityType === ACTIVITY.LISTENING_1 ||
      activityType === ACTIVITY.LISTENING_2 ||
      activityType === ACTIVITY.SUMMARY_1 ||
      activityType === ACTIVITY.SUMMARY_2 ||
      activityType === ACTIVITY.TRUE_OR_FALSE
    ) {
      return false
    }

    return true
  })
}

function convertQuizDataToItems(
  quizQuizData: QuizDataWithActivityType[],
): ShuffledQuizItem[] {
  const allQuizzes: ShuffledQuizItem[] = []

  quizQuizData.forEach(({ activityType, data }) => {
    if (data?.Quiz && Array.isArray(data.Quiz)) {
      data.Quiz.forEach((quiz) => {
        allQuizzes.push({
          activityType,
          quizzes: [quiz],
          originalQuizNo: quiz.QuizNo,
        })
      })
    }
  })

  return allQuizzes
}

function distributeToStages(
  quizzes: ShuffledQuizItem[],
  totalStages: number,
  isKLevel: boolean,
): QuizStage[] {
  const stages: QuizStage[] = []

  for (let stage = 1; stage <= totalStages; stage++) {
    let stageQuizzes: ShuffledQuizItem[]

    if (isKLevel) {
      stageQuizzes = quizzes
    } else {
      const startIndex = (stage - 1) * QUIZ_CONSTANTS.ROUNDS_PER_STAGE
      const endIndex = startIndex + QUIZ_CONSTANTS.ROUNDS_PER_STAGE
      stageQuizzes = quizzes.slice(startIndex, endIndex)
    }

    stages.push({
      stage,
      quizzes: stageQuizzes,
    })
  }

  return stages
}

export function prepareShuffledQuizStages(
  quizQuizData: QuizDataWithActivityType[],
  bookLevel: string,
): QuizStage[] {
  const allQuizzes = convertQuizDataToItems(quizQuizData)

  const totalStages = LevelUtils.getTotalStages(bookLevel)
  const isKLevel = LevelUtils.isKLevel(bookLevel)

  const hasVocabulary3 = quizQuizData.some(
    ({ activityType }) => activityType === ACTIVITY.VOCABULARY_3,
  )

  const shuffledQuizzes = distributeActivityTypes(
    bookLevel,
    totalStages,
    shuffle(allQuizzes),
    hasVocabulary3,
  )

  return distributeToStages(shuffledQuizzes, totalStages, isKLevel)
}
