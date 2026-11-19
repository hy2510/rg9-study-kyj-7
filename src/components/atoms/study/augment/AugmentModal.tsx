import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

const AugmentModal = styled.div<{ $gap?: number; $scrollable?: boolean }>`
  background-color: #fff;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 32 }) => $gap}px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  ${({ $scrollable }) => ($scrollable ? 'overflow-y: auto;' : '')}
  cursor: default;

  ${media.mobile} {
    width: 100%;
    padding: 24px 16px;
    border-radius: 16px;
  }
`

export default AugmentModal
