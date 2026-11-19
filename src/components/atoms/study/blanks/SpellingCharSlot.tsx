import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

export const SpellingCharSlot = styled.span<{
  $isFixed?: boolean
  $isActive?: boolean
  $isCorrect?: boolean
  $isIncorrect?: boolean
  $isPlaceholder?: boolean
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  flex-shrink: 0;
  box-sizing: content-box;
  margin: 0;
  height: 44px;
  color: ${(p) =>
    p.$isPlaceholder
      ? '#a2b1c4'
      : p.$isCorrect
        ? '#1baa70'
        : p.$isIncorrect
          ? '#ef3d2e'
          : '#3c4b62'};
  border-bottom: ${(p) =>
    p.$isFixed
      ? 'none'
      : `2px solid ${
          p.$isActive && !p.$isCorrect && !p.$isIncorrect
            ? '#3c4b62'
            : p.$isPlaceholder
              ? '#d7dee8'
              : p.$isCorrect
                ? '#1baa70'
                : p.$isIncorrect
                  ? '#ef3d2e'
                  : '#d7dee8'
        }`};
`
