import { styled } from 'styled-components'

export const Summary1SlotContentBox = styled.div<{
  $filled?: boolean
  $isReading?: boolean
}>`
  padding: 14px 16px;
  border-radius: 20px;
  border: 1.5px solid #e9edf3;
  background: ${(props) => {
    if (props.$isReading) return '#fff9c4'
    return props.$filled ? '#f5f7fa' : '#fff'
  }};
  transition: background 0.2s ease;
`
