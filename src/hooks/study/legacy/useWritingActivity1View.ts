import { useCallback, useMemo } from 'react'

import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import {
  IWritingActivity1,
  IWritingActivity1Example,
  IWritingActivity1Quiz,
} from '@src/interfaces/study/IWritingActivity'
import { calcStartPositionByIndex } from '@src/utils/study/legacy/calcStartPositionByIndex'

type UseWritingActivity1ViewArgs = {
  quizData: IWritingActivity1 | undefined
  recordedData: IRecordAnswerType[]
  studyMode: Mode
}

export type WritingActivity1Token = {
  id: string
  text: string
  answerIndex: number
}

export type WritingActivity1QuizMeta = {
  quizId: string
  quizNo: number
  correctText: string
  sound: string
  orderedTokens: WritingActivity1Token[]
  slotCount: number
  examples: IWritingActivity1Example[]
}

export type WritingActivity1View = {
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  startQuizNo: number
  startTryCount: number
  getQuizMeta: (quizIndex: number) => WritingActivity1QuizMeta | null
}

function resolveAnswerOrder(
  questionText: string,
  cardTexts: string[],
): number[] {
  let remaining = questionText.trim()
  const answerSequence: string[] = []

  while (remaining.length > 0) {
    remaining = remaining.trimStart()
    if (!remaining) break

    const sortedTexts = [...cardTexts].sort((a, b) => b.length - a.length)
    const matched = sortedTexts.find((t) => remaining.startsWith(t))

    if (matched) {
      answerSequence.push(matched)
      remaining = remaining.slice(matched.length)
    } else {
      remaining = remaining.slice(1)
    }
  }

  const usedPositions = new Set<number>()
  return cardTexts.map((text) => {
    for (let i = 0; i < answerSequence.length; i++) {
      if (answerSequence[i] === text && !usedPositions.has(i)) {
        usedPositions.add(i)
        return i
      }
    }
    return -1
  })
}

function buildQuizMeta(q: IWritingActivity1Quiz): WritingActivity1QuizMeta {
  const cardTexts = q.Examples.map((e) => e.Text)
  const answerIndices = resolveAnswerOrder(q.Question.Text, cardTexts)
  const orderedTokens: WritingActivity1Token[] = cardTexts.map((text, i) => ({
    id: `opt_${i}`,
    text,
    answerIndex: answerIndices[i],
  }))

  return {
    quizId: q.QuizId,
    quizNo: q.QuizNo,
    correctText: q.Question.Text,
    sound: q.Question.Sound,
    orderedTokens,
    slotCount: orderedTokens.length,
    examples: q.Examples,
  }
}

export function useWritingActivity1View({
  quizData,
  recordedData,
  studyMode,
}: UseWritingActivity1ViewArgs): WritingActivity1View {
  const [startQuizNo, startTryCount] = useMemo<[number, number]>(() => {
    if (!quizData) return [1, 0]
    return calcStartPositionByIndex(
      studyMode,
      recordedData,
      quizData.Quiz,
      quizData.QuizAnswerCount,
    )
  }, [quizData, recordedData, studyMode])

  const getQuizMeta = useCallback(
    (quizIndex: number): WritingActivity1QuizMeta | null => {
      if (!quizData) return null
      const q = quizData.Quiz[quizIndex - 1]
      if (!q) return null
      return buildQuizMeta(q)
    },
    [quizData],
  )

  return {
    isReady: !!quizData,
    totalQuiz: quizData ? quizData.Quiz.length : 0,
    quizAnswerCount: quizData?.QuizAnswerCount ?? 0,
    startQuizNo,
    startTryCount,
    getQuizMeta,
  }
}
