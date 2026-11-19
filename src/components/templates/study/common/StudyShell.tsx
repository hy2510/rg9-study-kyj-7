import { type ReactNode } from 'react'

import styled from 'styled-components'

import HeaderBody from '@components/molecules/common/HeaderBody'
import Header, { type HeaderProps } from '@components/organisms/common/Header'
import { QuizFeedbackProvider } from '@contexts/QuizFeedbackContext'
import { StudyStatusProvider } from '@contexts/StudyStatusContext'
import { StudyVisibilityContext } from '@contexts/StudyVisibilityContext'
import { useMobileViewport } from '@hooks/useMobileViewport'
import { useVisualViewportRect } from '@hooks/useVisualViewportRect'

type StudyShellProps = {
  headerProps: HeaderProps
  character: string
  children: ReactNode
  modals?: ReactNode
  isVisible?: boolean
  fitMobileViewport?: boolean
  onQuizFeedbackDismiss?: () => void
}

export default function StudyShell({
  headerProps,
  character,
  children,
  modals,
  isVisible = true,
  fitMobileViewport = false,
  onQuizFeedbackDismiss,
}: StudyShellProps) {
  const mobile = useMobileViewport()
  const fitViewport = fitMobileViewport && mobile
  const viewport = useVisualViewportRect(fitViewport)
  return (
    <StudyVisibilityContext.Provider value={isVisible}>
      <StudyWrapper
        style={
          fitViewport
            ? {
                top: viewport.top,
                left: viewport.left,
                width: viewport.width,
                height: viewport.height,
              }
            : undefined
        }
      >
        <StudyStatusProvider headerProps={headerProps}>
          <Header {...headerProps} />

          <HeaderBody
            $headerExpanded
            style={fitViewport ? { flex: '1 1 0', minHeight: 0 } : undefined}
          >
            <QuizFeedbackProvider
              character={character}
              onDismiss={onQuizFeedbackDismiss}
            >
              {children}
            </QuizFeedbackProvider>
          </HeaderBody>

          {modals}
        </StudyStatusProvider>
      </StudyWrapper>
    </StudyVisibilityContext.Provider>
  )
}

const StudyWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`
