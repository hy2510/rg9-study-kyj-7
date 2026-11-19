import { styled } from 'styled-components'

const SideClickArea = styled.button<{
  $side: 'left' | 'right'
  $visible: boolean
}>`
  position: relative;
  flex: 1;
  height: 100%;
  background: none;
  border: none;
  padding: 0;
  cursor: ${({ $visible }) => ($visible ? 'pointer' : 'default')};
  display: flex;
  align-items: center;
  justify-content: ${({ $side }) =>
    $side === 'left' ? 'flex-start' : 'flex-end'};
  pointer-events: auto;
  z-index: 10;
`

export default SideClickArea
