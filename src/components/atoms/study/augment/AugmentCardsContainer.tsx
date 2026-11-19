import { styled } from 'styled-components'

const AugmentCardsContainer = styled.div<{ $gap?: number }>`
  display: flex;
  justify-content: center;
  gap: ${({ $gap = 24 }) => $gap}px;
  flex-wrap: wrap;
`

export default AugmentCardsContainer
