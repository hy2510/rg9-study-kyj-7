import React, { ReactNode } from 'react'

import styled, { keyframes } from 'styled-components'

import { ACTIVITY_COMPONENTS } from '@components/templates/study/remix/features/activityComponents'
import type { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import type { ShuffledQuizItem } from '@hooks/study/remix/useQuizManager'

const quizActivityEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

export const QuizActivityEnter = styled.div`
  width: 100%;
  animation: ${quizActivityEnter} 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)
    both;
`

type RenderActivityParams = {
  currentQuiz: ShuffledQuizItem
  augmentOptions: AugmentOptions
  onComplete: (isCorrect: boolean) => void
  renderFallback?: (activityType: string) => ReactNode
}

export function renderActivity({
  currentQuiz,
  augmentOptions,
  onComplete,
  renderFallback,
}: RenderActivityParams): ReactNode {
  const { activityType, quizzes } = currentQuiz
  const quizData = quizzes[0]
  const config = ACTIVITY_COMPONENTS[activityType]

  if (!config) {
    return (
      <QuizActivityEnter key={activityType}>
        {renderFallback?.(activityType) ?? (
          <div>알 수 없는 액티비티 타입: {activityType}</div>
        )}
      </QuizActivityEnter>
    )
  }

  const { component: Component, useQuizzes } = config

  const Comp = Component as React.ComponentType<Record<string, unknown>>

  if (useQuizzes) {
    return (
      <QuizActivityEnter key={activityType}>
        <Comp quizData={quizzes} onComplete={onComplete} />
      </QuizActivityEnter>
    )
  }

  return (
    <QuizActivityEnter key={`${activityType}-${quizData.QuizId}`}>
      <Comp
        augmentOptions={augmentOptions}
        quizData={quizData}
        onComplete={onComplete}
      />
    </QuizActivityEnter>
  )
}
