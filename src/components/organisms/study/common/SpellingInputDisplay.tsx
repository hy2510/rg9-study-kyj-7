import { type ReactNode } from 'react'

import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import { SpellingCharSlot } from '@components/atoms/study/blanks/SpellingCharSlot'
import { SpellingDisplayBox } from '@components/atoms/study/blanks/SpellingDisplayBox'
import SpellingKeyboard from '@components/organisms/study/common/SpellingKeyboard'
import {
  buildDisplayText,
  getDisplayChar,
  getInputChars,
  getLettersOnly,
  isFixedChar,
  isSpecialOrSpace,
  isSpellingInputCharIncorrect,
} from '@utils/spellingUtils'

type SpellingSlotDisplayProps = {
  correctWord: string
  inputLetters: string
  isCorrect: boolean
  isIncorrect: boolean
  onInputLetterClick?: (letterIndex: number) => void
}

export function SpellingSlotDisplay({
  correctWord,
  inputLetters,
  isCorrect,
  isIncorrect,
  onInputLetterClick,
}: SpellingSlotDisplayProps) {
  return (
    <SpellingDisplayBox $isCorrect={isCorrect} $isIncorrect={isIncorrect}>
      {isCorrect ? (
        <SlotText $tone='success'>
          {buildDisplayText(correctWord, inputLetters)}
        </SlotText>
      ) : (
        Array.from({ length: correctWord.length }).map((_, i) => {
          const answerChar = correctWord[i]
          const letterIndex = getLettersOnly(correctWord.slice(0, i)).length
          const inputChar = inputLetters[letterIndex] ?? ''
          const isFixed = isSpecialOrSpace(answerChar)
          const displayChar = getDisplayChar(answerChar, inputChar)
          const isRemovable =
            !!onInputLetterClick && !isFixed && inputChar !== ''

          return (
            <SpellingCharSlot
              key={i}
              as={isRemovable ? 'button' : undefined}
              $isFixed={isFixed}
              $isIncorrect={isIncorrect}
              aria-label={
                isRemovable
                  ? `Remove letter ${inputChar} at position ${letterIndex + 1}`
                  : undefined
              }
              onClick={
                isRemovable
                  ? (event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      onInputLetterClick(letterIndex)
                    }
                  : undefined
              }
              style={
                isRemovable
                  ? {
                      padding: 0,
                      borderTop: 0,
                      borderRight: 0,
                      borderLeft: 0,
                      background: 'transparent',
                      cursor: 'pointer',
                    }
                  : undefined
              }
            >
              <SlotText $tone={isIncorrect ? 'error' : 'primary'}>
                {displayChar}
              </SlotText>
            </SpellingCharSlot>
          )
        })
      )}
    </SpellingDisplayBox>
  )
}

type SpellingInputDisplayProps = {
  highlightNextSlot?: boolean
  correctWord: string
  inputLetters: string
  typeSpace?: boolean
  isCorrect: boolean
  isIncorrect: boolean
  isPenalty?: boolean
  showEnterButton?: boolean
  isEnterEnabled?: boolean
  wrongKeyCount?: number
  totalKeyCount?: number
  allowFullKeyboardToggle?: boolean
  fullKeyboardOnly?: boolean
  allowRecordingMode?: boolean
  recordingContent?: ReactNode
  onInputModeChange?: (mode: 'simple' | 'full' | 'recording') => void
  fillHeightOnTablet?: boolean
  plainDisplay?: boolean
  emphasizeFeedbackText?: boolean
  displayLeadingContent?: ReactNode
  displayTrailingContent?: ReactNode
  renderDisplay?: (display: ReactNode) => ReactNode
  keyboardReplacement?: ReactNode
  nativeInput?: ReactNode
  onDisplayClick?: () => void
  onInputLetterClick?: (letterIndex: number) => void
  onKeyPress: (key: string) => void
}

export default function SpellingInputDisplay({
  highlightNextSlot = false,
  correctWord,
  inputLetters,
  typeSpace = false,
  isCorrect,
  isIncorrect,
  isPenalty = false,
  showEnterButton = false,
  isEnterEnabled = false,
  wrongKeyCount = 5,
  totalKeyCount,
  allowFullKeyboardToggle = false,
  fullKeyboardOnly = false,
  allowRecordingMode = false,
  recordingContent,
  onInputModeChange,
  fillHeightOnTablet = false,
  plainDisplay = false,
  emphasizeFeedbackText = false,
  displayLeadingContent,
  displayTrailingContent,
  renderDisplay,
  keyboardReplacement,
  nativeInput,
  onDisplayClick,
  onInputLetterClick,
  onKeyPress,
}: SpellingInputDisplayProps) {
  const spellingDisplay = (
    <SpellingDisplayBox
      $isCorrect={isCorrect}
      $isIncorrect={isIncorrect}
      $plain={plainDisplay}
      $clickable={!!onDisplayClick}
      role={onDisplayClick ? 'button' : undefined}
      tabIndex={onDisplayClick ? 0 : undefined}
      onClick={onDisplayClick}
      style={nativeInput ? { position: 'relative' } : undefined}
    >
      {nativeInput}
      {displayLeadingContent}
      {isCorrect ? (
        <SlotText $tone='success' $emphasized={emphasizeFeedbackText}>
          {buildDisplayText(correctWord, inputLetters, typeSpace)}
        </SlotText>
      ) : (
        Array.from({ length: correctWord.length }).map((_, i) => {
          const answerChar = correctWord[i]
          const letterIndex = getInputChars(
            correctWord.slice(0, i),
            typeSpace,
          ).length
          const inputChar = inputLetters[letterIndex] ?? ''
          const isFixed = isFixedChar(answerChar, typeSpace)
          const isActive =
            highlightNextSlot && !isFixed && letterIndex === inputLetters.length
          const isPenaltyPlaceholder = isPenalty && !isFixed && inputChar === ''
          const isCharIncorrect =
            isPenalty &&
            !isPenaltyPlaceholder &&
            isSpellingInputCharIncorrect(answerChar, inputChar, typeSpace)
          const isSlotIncorrect = isIncorrect || isCharIncorrect
          const displayChar = isPenaltyPlaceholder
            ? answerChar
            : getDisplayChar(answerChar, inputChar, typeSpace)

          const slotTone: SlotTone = isPenaltyPlaceholder
            ? 'placeholder'
            : isSlotIncorrect
              ? 'error'
              : 'primary'

          const isRemovable =
            !!onInputLetterClick && !isFixed && inputChar !== ''

          return (
            <SpellingCharSlot
              key={i}
              as={isRemovable ? 'button' : undefined}
              $isFixed={isFixed}
              $isActive={isActive}
              aria-current={isActive ? 'step' : undefined}
              $isCorrect={!isPenaltyPlaceholder && isCorrect}
              $isIncorrect={isSlotIncorrect}
              $isPlaceholder={isPenaltyPlaceholder}
              aria-label={
                isRemovable
                  ? `Remove letter ${inputChar} at position ${letterIndex + 1}`
                  : undefined
              }
              onClick={
                isRemovable
                  ? (event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      onInputLetterClick(letterIndex)
                    }
                  : undefined
              }
              style={
                isRemovable
                  ? {
                      padding: 0,
                      borderTop: 0,
                      borderRight: 0,
                      borderLeft: 0,
                      background: 'transparent',
                      cursor: 'pointer',
                    }
                  : undefined
              }
            >
              <SlotText
                $tone={slotTone}
                $emphasized={emphasizeFeedbackText && isIncorrect}
              >
                {displayChar}
              </SlotText>
            </SpellingCharSlot>
          )
        })
      )}
      {displayTrailingContent}
    </SpellingDisplayBox>
  )

  return (
    <SpellingInputRoot $fillHeightOnTablet={fillHeightOnTablet}>
      {renderDisplay ? renderDisplay(spellingDisplay) : spellingDisplay}

      {keyboardReplacement ?? (
        <SpellingKeyboard
          correctWord={correctWord}
          wrongKeyCount={wrongKeyCount}
          totalKeyCount={totalKeyCount}
          allowFullKeyboardToggle={allowFullKeyboardToggle}
          fullKeyboardOnly={fullKeyboardOnly}
          allowRecordingMode={allowRecordingMode}
          recordingContent={recordingContent}
          onInputModeChange={onInputModeChange}
          showEnterButton={showEnterButton}
          isEnterEnabled={isEnterEnabled}
          onKeyPress={onKeyPress}
        />
      )}
    </SpellingInputRoot>
  )
}

type SlotTone = 'primary' | 'success' | 'error' | 'placeholder'

const SpellingInputRoot = styled.div<{ $fillHeightOnTablet: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  ${({ $fillHeightOnTablet }) =>
    $fillHeightOnTablet &&
    `
      ${media.tablet} {
        flex: 1 1 auto;
        min-height: 0;
        justify-content: space-between;
      }

      ${media.touchTablet} {
        flex: 1 1 auto;
        min-height: 0;
        justify-content: space-between;
      }
    `}
`

const SlotText = styled.span<{ $tone: SlotTone; $emphasized?: boolean }>`
  font-family: 'Rg-B', sans-serif;
  font-size: ${({ $emphasized }) => ($emphasized ? '32px' : '28px')};
  font-weight: 600;
  line-height: 1;
  color: ${({ $tone }) =>
    $tone === 'success'
      ? '#1baa70'
      : $tone === 'error'
        ? '#ef3d2e'
        : $tone === 'placeholder'
          ? '#a2b1c4'
          : '#3c4b62'};

  ${media.mobile} {
    font-size: ${({ $emphasized }) => ($emphasized ? '24px' : '20px')};
  }
`
