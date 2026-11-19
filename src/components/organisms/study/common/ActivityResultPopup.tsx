import { useEffect, useMemo } from 'react'

import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import { resolveQuizSelectableFeedback } from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'
import { IntroStartButton } from '@components/molecules/common/intro/IntroLayout'
import PopupLayout from '@components/molecules/common/PopupLayout'
import type { LegacyStepProgress } from '@interfaces/common/header/LegacyStepProgress'
import {
  computeStepScore,
  countCorrectRows,
} from '@src/utils/study/legacy/computeStepScore'
import { getQuizCorrectionCharacterMarks } from '@utils/Assets'
import { formatActivityLabel } from '@utils/study/formatActivityLabel'

import {
  ActivityResultAttemptsTable,
  ATTEMPT_COLUMNS_HARD_CAP,
} from './ActivityResultAttemptsTable'
import {
  type ActivityResultReviewItem,
  ActivityResultReviewList,
} from './ActivityResultReviewList'

const AVERAGE_PASS_SCORE = 70

type ActivityResultPopupProps = {
  stepId: number
  activity: string
  stepProgress: LegacyStepProgress | undefined
  isLastStep: boolean
  onProceed: () => void
  proceedLabel?: string
  notice?: string
  character?: string
  reviewItems?: ActivityResultReviewItem[]
}

export type { ActivityResultReviewItem }

export default function ActivityResultPopup({
  activity,
  stepProgress,
  isLastStep,
  onProceed,
  proceedLabel: proceedLabelOverride,
  notice,
  character,
  reviewItems,
}: ActivityResultPopupProps) {
  const attempts = stepProgress?.attempts ?? []
  const score = useMemo(() => computeStepScore(attempts), [attempts])
  const correctRows = useMemo(() => countCorrectRows(attempts), [attempts])
  const totalRows = attempts.length

  const attemptColumns = Math.min(
    Math.max(stepProgress?.quizAnswerCount ?? 0, 1),
    ATTEMPT_COLUMNS_HARD_CAP,
  )

  const proceedLabel = proceedLabelOverride ?? (isLastStep ? 'Finish' : 'Next')

  const hasReviewItems = Boolean(reviewItems && reviewItems.length > 0)

  const isAverageBelowPass = score < AVERAGE_PASS_SCORE
  const characterMarks = character
    ? getQuizCorrectionCharacterMarks(character)
    : null
  const characterImage = characterMarks
    ? isAverageBelowPass
      ? characterMarks.incorrect
      : characterMarks.correct
    : ''

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return
      e.preventDefault()
      onProceed()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onProceed])

  return (
    <PopupLayout onClose={onProceed} hideCloseButton fitContent>
      <Container>
        <Header>
          <TextBox fontSize={0.9} fontWeight={5} color='secondary'>
            {formatActivityLabel(activity)}
          </TextBox>
          <TextBox fontSize={1.6} fontWeight={7} color='primary'>
            Your Score
          </TextBox>

          {characterImage ? (
            <CharacterFigure>
              <img src={characterImage} alt='' draggable={false} />
            </CharacterFigure>
          ) : null}

          {notice ? <NoticeText>{notice}</NoticeText> : null}

          <SummaryRow $isBelowPass={isAverageBelowPass}>
            <SummaryItem>
              <SummaryLabel $isBelowPass={isAverageBelowPass}>
                Average
              </SummaryLabel>
              <SummaryValue $isBelowPass={isAverageBelowPass}>
                {`${score}`}
              </SummaryValue>
            </SummaryItem>
            <SummaryDivider $isBelowPass={isAverageBelowPass} aria-hidden />
            <SummaryItem>
              <SummaryLabel $isBelowPass={isAverageBelowPass}>
                Correct
              </SummaryLabel>
              <SummaryValue $isBelowPass={isAverageBelowPass}>
                {`${correctRows} / ${totalRows}`}
              </SummaryValue>
            </SummaryItem>
          </SummaryRow>
        </Header>

        <Body>
          {hasReviewItems ? (
            <ActivityResultReviewList items={reviewItems!} />
          ) : totalRows === 0 ? (
            <EmptyState>
              <TextBox fontSize={1} color='secondary'>
                No records.
              </TextBox>
            </EmptyState>
          ) : (
            <ActivityResultAttemptsTable
              attempts={attempts}
              attemptColumns={attemptColumns}
            />
          )}
        </Body>

        <Footer>
          <ProceedButton type='button' onClick={onProceed}>
            {proceedLabel}
          </ProceedButton>
        </Footer>
      </Container>
    </PopupLayout>
  )
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 16px;
  padding: 4px 8px 0;

  ${media.mobile} {
    flex: 0 1 auto;
  }
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const CharacterFigure = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 4px;
  position: absolute;
  top: -82px;
  right: -12px;

  img {
    display: block;
    width: auto;
    height: 180px;
    object-fit: contain;
  }

  ${media.mobile} {
    top: -8px;
    right: 8px;

    img {
      height: 90px;
    }
  }
`

const NoticeText = styled.p`
  margin: 0;
  font-family: 'Rg-B', sans-serif;
  font-size: 0.85em;
  font-weight: 600;
  color: #3c4b62;
`

const SummaryRow = styled.div<{ $isBelowPass: boolean }>`
  margin-top: 6px;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 20px;
  border: ${({ $isBelowPass }) =>
    resolveQuizSelectableFeedback({
      $isCorrect: !$isBelowPass,
      $isIncorrect: $isBelowPass,
    }).border};
  background-color: ${({ $isBelowPass }) =>
    resolveQuizSelectableFeedback({
      $isCorrect: !$isBelowPass,
      $isIncorrect: $isBelowPass,
    }).bg};
`

const SummaryItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

const SummaryLabel = styled.div<{ $isBelowPass: boolean }>`
  font-family: 'Rg-B', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ $isBelowPass }) => ($isBelowPass ? '#ef3d2e' : '#158b5c')};
  opacity: 0.55;
`

const SummaryValue = styled.div<{ $isBelowPass: boolean }>`
  font-family: 'Rg-B', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ $isBelowPass }) => ($isBelowPass ? '#ef3d2e' : '#158b5c')};
`

const SummaryDivider = styled.div<{ $isBelowPass: boolean }>`
  width: 1.5px;
  background-color: ${({ $isBelowPass }) =>
    $isBelowPass ? 'rgba(239, 61, 46, 0.25)' : 'rgba(27, 170, 112, 0.25)'};
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  ${media.mobile} {
    flex: 0 1 auto;
  }
`

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;

  ${media.mobile} {
    padding-top: 0;
    padding-bottom: 4px;
  }
`

const ProceedButton = styled(IntroStartButton)`
  max-width: none;
  margin-top: 0;
  margin-bottom: 8px;
  height: 50px;
  font-size: 1.1em;
  font-weight: 700;
  border-color: #ff374b;
  background-color: #ff374b;
  box-shadow: 0 3px 0 0 #ce0000;

  ${media.mobile} {
    margin-bottom: 6px;
  }
`
