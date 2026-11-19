import { media } from '@styles/tokens/breakpoints'
import styled, { css } from 'styled-components'

import {
  QuizSelectableFeedbackBox,
  quizSelectablePressedStyle,
} from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'

export const QUIZ_OPTION_CARD_WIDTH_FULL = 'calc(100% - 32px)'

export const QUIZ_OPTION_CARD_WIDTH_GRID = 'calc(100% - 34px)'

export const GridQuizOptionCardBox = styled(QuizSelectableFeedbackBox)<{
  $isInGrid?: boolean
  $inRow?: boolean
}>`
  cursor: pointer;
  box-sizing: border-box;
  max-width: 100%;
  width: ${({ $isInGrid, $inRow }) => {
    if ($isInGrid) return QUIZ_OPTION_CARD_WIDTH_GRID
    if ($inRow) return '100%'
    return QUIZ_OPTION_CARD_WIDTH_FULL
  }};
  min-height: 36px;
  height: fit-content;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  transition: all 0.05s ease;

  ${({ $inRow }) =>
    $inRow &&
    css`
      flex: 1;
      min-width: 0;
    `}

  ${media.mobile} {
    width: 100%;
    padding: 12px;
    min-height: 44px;
  }

  ${({ $isCorrect }) => $isCorrect && quizSelectablePressedStyle}
`
