import { type ComponentPropsWithoutRef, forwardRef } from 'react'

import styled from 'styled-components'

type SideMenuRowProps = ComponentPropsWithoutRef<'button'>

const SideMenuRow = forwardRef<HTMLButtonElement, SideMenuRowProps>(
  function SideMenuRow({ type = 'button', ...rest }, ref) {
    return <SideMenuRowStyled type={type} ref={ref} {...rest} />
  },
)

export default SideMenuRow

const SideMenuRowStyled = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: none;
  border-radius: 12px;
  background: transparent;
  font-family: 'Chiron GoRound TC', sans-serif;
  font-size: 1.08rem;
  font-weight: 600;
  color: #1f2937;
  -webkit-text-fill-color: #1f2937;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  text-align: left;

  img {
    filter: brightness(0) saturate(100%) invert(73%) sepia(8%) saturate(431%)
      hue-rotate(176deg) brightness(94%) contrast(85%);
  }

  &:disabled,
  &[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.4;
  }
`
