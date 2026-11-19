import { useEffect, useMemo, useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

import QuizContainerStatusHeader from '@components/molecules/study/layout/QuizContainerStatusHeader'
import { renderActivity } from '@components/templates/study/remix/features/renderActivity'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import {
  getAugmentOptions,
  type SelectedAugment,
} from '@hooks/study/remix/useAugmentManager'
import {
  type ActivityType,
  type ShuffledQuizItem,
} from '@hooks/study/remix/useQuizManager'
import { QuizInfo } from '@interfaces/study/remix/QuizInfo'
import { ACTIVITY } from '@src/constants/study/studyConstants'
import { playAudioBeforeContinue } from '@utils/audio/playAudioBeforeContinue'

type ReviewProps = {
  incorrectQuizzes: ShuffledQuizItem[]
  quizInfo: QuizInfo
  totalStages: number
  selectedAugments: SelectedAugment[]
  setQuizInfo: (quizInfo: QuizInfo) => void
  setIsAugmentOpen: (isOpen: boolean) => void
}

export default function Review({
  incorrectQuizzes,
  quizInfo,
  totalStages,
  selectedAugments,
  setQuizInfo,
  setIsAugmentOpen,
}: ReviewProps) {
  const [retryCount, setRetryCount] = useState(0)

  const currentQuiz = incorrectQuizzes[0]

  const augmentOptions = useMemo(
    () =>
      getAugmentOptions(
        selectedAugments,
        currentQuiz?.activityType as ActivityType | undefined,
      ),
    [selectedAugments, currentQuiz?.activityType],
  )

  const quizFeedback = useQuizFeedbackOptional()

  useEffect(() => {
    if (incorrectQuizzes.length === 0 && quizInfo.stage < totalStages - 1) {
      setIsAugmentOpen(true)
    }
  }, [incorrectQuizzes.length, quizInfo.stage, totalStages, setIsAugmentOpen])

  const handleCompleteQuestion = (isCorrect: boolean) => {
    if (!currentQuiz) return

    if (!isCorrect) {
      const retry = () => setRetryCount((prev) => prev + 1)
      if (quizFeedback) {
        quizFeedback.presentResult(false, retry)
      } else {
        retry()
      }
      return
    }

    const onCorrect = () => {
      const advance = () => {
        setRetryCount(0)
        const updatedIncorrectQuizzes = incorrectQuizzes.filter(
          (item) => item.quizzes[0].QuizId !== currentQuiz.quizzes[0].QuizId,
        )

        setQuizInfo({
          ...quizInfo,
          incorrectQuizzes: updatedIncorrectQuizzes,
        })
      }

      if (currentQuiz.activityType === ACTIVITY.WRITING_1) {
        playAudioBeforeContinue(currentQuiz.quizzes[0]?.Question.Sound, advance)
        return
      }
      advance()
    }

    if (quizFeedback) {
      quizFeedback.presentResult(true, onCorrect)
    } else {
      onCorrect()
    }
  }

  const renderCurrentQuiz = () => {
    if (!currentQuiz) {
      return (
        <ReviewContent>
          <EmptyState>복습할 문제가 없습니다.</EmptyState>
        </ReviewContent>
      )
    }

    return renderActivity({
      currentQuiz,
      augmentOptions,
      onComplete: handleCompleteQuestion,
      renderFallback: (activityType) => (
        <ReviewContent>
          <EmptyState>
            해당 액티비티({activityType})는 아직 지원되지 않습니다.
          </EmptyState>
        </ReviewContent>
      ),
    })
  }

  return (
    <ReviewWrapper>
      {incorrectQuizzes.length === 0 ? (
        <ReviewContent>
          <EmptyState>틀린 문제가 없습니다.</EmptyState>
        </ReviewContent>
      ) : (
        <ReviewContent>
          <QuizContainerStatusHeader />
          {currentQuiz && (
            <ActivityTypeBadge>{currentQuiz.activityType}</ActivityTypeBadge>
          )}
          {currentQuiz ? (
            <div
              key={`${currentQuiz.quizzes[0].QuizId}-${retryCount}`}
              style={{ width: '100%' }}
            >
              {renderCurrentQuiz()}
            </div>
          ) : (
            renderCurrentQuiz()
          )}
        </ReviewContent>
      )}
    </ReviewWrapper>
  )
}

const ReviewWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 16px;
  box-sizing: border-box;

  ${media.mobile} {
    padding: 0 8px;
  }
`

const ReviewContent = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 900px;
  min-height: 300px;
  background-color: rgba(0, 0, 0, 0.25);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  box-sizing: border-box;

  ${media.tablet} {
    min-width: 0;
    border-width: 2px;
    border-radius: 28px;
  }

  ${media.mobile} {
    border-radius: 24px;
  }
`

const ActivityTypeBadge = styled.div`
  display: inline-block;
  padding: 8px 16px;
  background-color: #007bff;
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  width: fit-content;
  position: fixed;
  bottom: 0;
  right: 0;
`

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 200px;
  font-size: 18px;
  color: #666;
`
