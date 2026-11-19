import type { CSSProperties, ReactNode } from 'react'
import styled from 'styled-components'

const Shell = styled.div`
  position: relative;
  width: 100%;
`

export type QuizOptionImageFrameProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export default function QuizOptionImageFrame({
  children,
  className,
  style,
}: QuizOptionImageFrameProps) {
  return (
    <Shell className={className} style={style}>
      {children}
    </Shell>
  )
}
