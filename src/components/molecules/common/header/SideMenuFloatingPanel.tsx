import { slideInFromRight } from '@styles/tokens/animations'
import {
  SAFE_AREA_BOTTOM,
  SAFE_AREA_RIGHT,
  SAFE_AREA_TOP,
} from '@styles/tokens/safeArea'
import styled from 'styled-components'

const SideMenuFloatingPanel = styled.aside`
  position: fixed;
  top: calc(23px + ${SAFE_AREA_TOP});
  right: calc(15px + ${SAFE_AREA_RIGHT});
  bottom: calc(12px + ${SAFE_AREA_BOTTOM});
  width: min(300px, calc(100vw - 90px));
  z-index: 160;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #fff;
  border-radius: 30px;
  border: 1px solid #e5e7eb;
  animation: ${slideInFromRight} 0.22s ease both;
  padding: 30px;
`

export default SideMenuFloatingPanel
