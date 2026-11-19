import { css, keyframes, styled } from 'styled-components'

const slideFromLeft = keyframes`
  from {
    transform: translateX(-72px) scale(0.94);
  }
  to {
    transform: translateX(0) scale(1);
  }
`

const slideFromRight = keyframes`
  from {
    transform: translateX(72px) scale(0.94);
  }
  to {
    transform: translateX(0) scale(1);
  }
`

const BookPagesMotion = styled.div<{
  $direction: 'next' | 'prev'
  $animate: boolean
}>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
  ${({ $animate, $direction }) =>
    $animate
      ? css`
          animation: ${$direction === 'next' ? slideFromRight : slideFromLeft}
            0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        `
      : ''}
`

export default BookPagesMotion
