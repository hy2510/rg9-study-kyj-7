import { styled } from 'styled-components'

import BlankCharSlot from '@components/atoms/study/blanks/BlankCharSlot'
import {
  getDisplayChar,
  getLettersOnly,
  isSpecialOrSpace,
} from '@utils/spellingUtils'

type MaskCharSlotProps = {
  answer: string
  input: string
  isCurrent: boolean
  slotIncorrect: boolean
  showFirst?: boolean
  showLast?: boolean
}

export default function MaskCharSlot({
  answer,
  input,
  isCurrent,
  slotIncorrect,
  showFirst = false,
  showLast = false,
}: MaskCharSlotProps) {
  const lettersOnly = getLettersOnly(answer)
  return (
    <>
      {Array.from({ length: answer.length }).map((_, j) => {
        const char = answer[j]
        const fixed = isSpecialOrSpace(char)
        const letterIndex = getLettersOnly(answer.slice(0, j)).length
        const inputChar = input[letterIndex] ?? ''
        const displayChar = getDisplayChar(char, inputChar)
        const isFirstLetterSlot = !fixed && letterIndex === 0
        const isLastLetterSlot =
          !fixed && letterIndex === lettersOnly.length - 1
        const showAsHint =
          (showFirst && isFirstLetterSlot) || (showLast && isLastLetterSlot)
        const displayValue = fixed
          ? char
          : showAsHint
            ? displayChar || '\u00A0'
            : displayChar || '\u00A0'
        return (
          <BlankCharSlot
            key={j}
            $isCorrect={false}
            $isIncorrect={slotIncorrect}
            $isCurrent={isCurrent}
            $isFixed={fixed}
          >
            {showAsHint ? (
              <MaskSlotWithPlaceholder>
                <HintPlaceholder>{char}</HintPlaceholder>
                <InputOverlay>
                  <MaskCharTypography>{displayValue}</MaskCharTypography>
                </InputOverlay>
              </MaskSlotWithPlaceholder>
            ) : (
              <MaskCharTypography>{displayValue}</MaskCharTypography>
            )}
          </BlankCharSlot>
        )
      })}
    </>
  )
}

const MaskSlotWithPlaceholder = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`

const HintPlaceholder = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: #a2b1c4;
  pointer-events: none;
`

const MaskCharTypography = styled.span`
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
`

const InputOverlay = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`
