import { styled } from 'styled-components'

const AugmentCardContent = styled.div<{
  $gap?: number
  $padding?: number
  $fullWidth?: boolean
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ $gap = 12 }) => $gap}px;
  padding: ${({ $padding = 20 }) => $padding}px;
  ${({ $fullWidth }) => ($fullWidth ? 'width: 100%;' : '')}
`

export default AugmentCardContent
