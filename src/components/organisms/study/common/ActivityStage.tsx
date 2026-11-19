import { type ReactNode } from 'react'

import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import QuizContainerStatusHeader from '@components/molecules/study/layout/QuizContainerStatusHeader'

type ActivityStageProps = {
  children: ReactNode
  extras?: ReactNode
  fillMobileViewport?: boolean
}

export default function ActivityStage({
  children,
  extras,
  fillMobileViewport = false,
}: ActivityStageProps) {
  return (
    <StageWrapper $fillMobileViewport={fillMobileViewport}>
      <StageContent $fillMobileViewport={fillMobileViewport}>
        <QuizContainerStatusHeader />
        <StageBodySlot>
          <StageBody $fillMobileViewport={fillMobileViewport}>
            {children}
          </StageBody>
        </StageBodySlot>
      </StageContent>
      {extras}
    </StageWrapper>
  )
}

const StageWrapper = styled.div<{ $fillMobileViewport: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 0 16px;
  box-sizing: border-box;

  ${media.mobile} {
    padding: 0 8px;
    ${({ $fillMobileViewport }) =>
      $fillMobileViewport &&
      `
      min-height: 0;
      /* Match the original stage's viewport minus 40px spacing. */
      padding-top: 20px;
      padding-bottom: 20px;
    `}
  }
`

const StageContent = styled.div<{ $fillMobileViewport: boolean }>`
  width: 100%;
  max-width: 900px;
  max-height: calc(100vh - 40px);
  max-height: calc(100dvh - 40px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-width: 900px;
  min-height: 100px;
  background-color: rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 40px;
  box-sizing: border-box;

  ${media.tablet} {
    min-width: 0;
    border-width: 2px;
    border-radius: 28px;
  }

  ${media.mobile} {
    border-radius: 24px;
    ${({ $fillMobileViewport }) =>
      $fillMobileViewport &&
      `
      height: 100%;
      min-height: 0;
      max-height: 100%;
    `}
  }
`

const StageBodySlot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  min-height: 0;
`

const StageBody = styled.div<{ $fillMobileViewport: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;

  ${media.mobile} {
    gap: 16px;
    ${({ $fillMobileViewport }) =>
      $fillMobileViewport &&
      `
      flex: 1 1 auto;
      min-height: 0;
      height: 100%;
      overflow-y: auto;
    `}
  }
`
