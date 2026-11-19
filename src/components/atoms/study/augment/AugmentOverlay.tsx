import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

const AugmentOverlay = styled.div<{ $clickable?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  ${media.mobile} {
    padding: 0 16px;
    box-sizing: border-box;
  }
`

export default AugmentOverlay
