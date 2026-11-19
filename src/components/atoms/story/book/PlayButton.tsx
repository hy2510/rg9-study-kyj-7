import { styled } from 'styled-components'

const BottomButton = styled.button`
  position: absolute;
  bottom: 10px;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;

  &:active {
    transform: scale(0.93);
    opacity: 0.85;
  }
`

const PlayButton = styled(BottomButton)`
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  right: 10px;
`

export default PlayButton
