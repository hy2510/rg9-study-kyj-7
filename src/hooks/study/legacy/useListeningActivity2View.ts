import { useCallback, useEffect, useMemo, useState } from 'react'

import shuffle from 'lodash/shuffle'

import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import { IListeningActivity2 } from '@src/interfaces/study/IListeningActivity'
import { calcStartPosition } from '@src/utils/study/legacy/calcStartPosition'

type UseListeningActivity2ViewArgs = {
  quizData: IListeningActivity2 | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

type CurrentQuizMeta = {
  quizId: string
  quizNo: number
  correctText: string
  sound: string
}

export type ListeningActivity2View = {
  isReady: boolean
  cards: BaseQuiz[]
  totalQuiz: number
  startQuizNo: number
  startTryCount: number
  initialSolvedQuizNos: Set<number>
  getQuizMeta: (quizIndex: number) => CurrentQuizMeta | null
  quizAnswerCount: number
}

export function useListeningActivity2View({
  quizData,
  recordedData,
  studyMode,
}: UseListeningActivity2ViewArgs): ListeningActivity2View {
  const baseCards = useMemo<BaseQuiz[] | null>(() => {
    if (!quizData) return null

    const quizSlice = quizData.Quiz.slice(0, 6)
    const examples = quizData.Examples.slice(0, 6)

    return examples.map((example, i) => {
      const matched = quizSlice.find((q) => q.Question.Text === example.Text)
      return {
        QuizId: matched?.QuizId ?? `card-${i}`,
        QuizNo: matched?.QuizNo ?? -1,
        Question: {
          Text: example.Text,
          Sound: matched?.Question.Sound ?? '',
        },
      } as BaseQuiz
    })
  }, [quizData])

  const [cards, setCards] = useState<BaseQuiz[]>([])
  useEffect(() => {
    if (!baseCards) return
    setCards((studyMode === 'student' || studyMode === 'guide' || studyMode === 'trial') ? shuffle(baseCards) : baseCards)
  }, [baseCards, studyMode])

  const initialSolvedQuizNos = useMemo<Set<number>>(() => {
    if (studyMode !== 'student') return new Set<number>()
    return new Set(
      recordedData.filter((r) => r.OX === '1').map((r) => r.QuizNo),
    )
  }, [recordedData, studyMode])

  const [startQuizNo, startTryCount] = useMemo<[number, number]>(() => {
    if (!quizData) return [1, 0]
    return calcStartPosition(studyMode, recordedData, quizData.QuizAnswerCount)
  }, [quizData, recordedData, studyMode])

  const getQuizMeta = useCallback(
    (quizIndex: number): CurrentQuizMeta | null => {
      if (!quizData) return null
      const q = quizData.Quiz.slice(0, 6)[quizIndex - 1]
      if (!q) return null
      return {
        quizId: q.QuizId,
        quizNo: q.QuizNo,
        correctText: q.Question.Text,
        sound: q.Question.Sound,
      }
    },
    [quizData],
  )

  return {
    isReady: !!quizData && cards.length > 0,
    cards,
    totalQuiz: quizData ? quizData.Quiz.slice(0, 6).length : 0,
    startQuizNo,
    startTryCount,
    initialSolvedQuizNos,
    getQuizMeta,
    quizAnswerCount: quizData?.QuizAnswerCount ?? 0,
  }
}
