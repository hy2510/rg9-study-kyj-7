import { styled } from 'styled-components'

const BookEdgeTapRail = styled.button<{
  $side: 'left' | 'right'
  $widthPx: number
}>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: ${({ $widthPx }) => $widthPx}px;
  ${({ $side }) => ($side === 'left' ? 'left: 0;' : 'right: 0;')}
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  cursor: pointer;
  z-index: 5;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
`

export default BookEdgeTapRail
