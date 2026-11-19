import {
  lazy,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { styled } from 'styled-components'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import IntroScreen from '@components/organisms/common/IntroScreen'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import useCharacter from '@hooks/study/legacy/useCharacter'
import { ViewType } from '@interfaces/common/ViewType'
import RemixStudyContainer from '@pages/RemixStudyContainer'
const LegacyStudyContainer = lazy(() => import('@pages/LegacyStudyContainer'))
const MovieBookContainer = lazy(() => import('@pages/MovieBookContainer'))
const SpeakContainer = lazy(() => import('@pages/SpeakContainer'))
const StoryContainer = lazy(() => import('@pages/StoryContainer'))
const WordPracticeContainer = lazy(() => import('@pages/WordPracticeContainer'))
import { warmupTranscriptionWorker } from '@services/localSpeakTranscription'
import { CHAR_BACKGROUNDS } from '@src/constants/study/characterBackgrounds'
import { StudyEntryType } from '@src/interfaces/common/Types'
import ASSETS from '@utils/Assets'
import { exitStudyApp } from '@utils/exitStudy'
import { computeQuizReward } from '@utils/study/computeQuizReward'
import { getGuideParentOrigin } from '@utils/study/guideMode'
import { resolveInitialEntry } from '@utils/study/resolveInitialEntry'

type InfoContainerProps = {
  studyUi: StudyEntryType
}

export default function InfoContainer() {
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const studyCharacter = useCharacter()
  const [currentView, setCurrentView] = useState<ViewType>('Loading')

  useEffect(() => {
    warmupTranscriptionWorker()
  }, [])

  const [studyBackgroundImage] = useState(() => {
    const bgs = CHAR_BACKGROUNDS[studyCharacter] ?? CHAR_BACKGROUNDS.gino
    return bgs[Math.floor(Math.random() * bgs.length)]
  })

  const [introConsumed, setIntroConsumed] = useState({
    story: false,
    study: false,
    speak: false,
    wordPractice: false,
    studyReview: false,
  })

  const dismissStoryIntro = useCallback(() => {
    setIntroConsumed((s) => ({ ...s, story: true }))
  }, [])

  const dismissStudyIntro = useCallback(() => {
    setIntroConsumed((s) => ({ ...s, study: true }))
  }, [])

  const dismissSpeakIntro = useCallback(() => {
    setIntroConsumed((s) => ({ ...s, speak: true }))
  }, [])

  const dismissWordPracticeIntro = useCallback(() => {
    setIntroConsumed((s) => ({ ...s, wordPractice: true }))
  }, [])

  const dismissStudyReviewIntro = useCallback(() => {
    setIntroConsumed((s) => ({ ...s, studyReview: true, study: true }))
  }, [])

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.sessionStorage.removeItem('finishStudyInfo')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const [guideInitialStep, setGuideInitialStep] = useState(1)
  const [retryNonce, setRetryNonce] = useState(0)

  const isInitialDecidedRef = useRef<boolean>(false)

  useEffect(() => {
    if (isInitialDecidedRef.current) return
    if (!studyInfo || !bookInfo) return

    isInitialDecidedRef.current = true

    const entry = resolveInitialEntry(studyInfo)
    if (entry.kind === 'guideReady') {
      const origin = getGuideParentOrigin()
      window.parent.postMessage({ type: 'READY' }, origin ?? '*')
      return
    }
    setCurrentView(entry.view)
  }, [studyInfo, bookInfo])

  const changeCurrentView = (view: ViewType) => {
    if (
      view === 'Story' &&
      studyInfo?.isSubmitPreference &&
      !introConsumed.story
    ) {
      setIntroConsumed((s) => ({ ...s, story: true }))
    }
    setCurrentView(view)
  }

  useEffect(() => {
    if (!studyInfo || studyInfo.mode !== 'guide') return
    const origin = getGuideParentOrigin()

    const handler = (event: MessageEvent) => {
      if (origin && event.origin !== origin) return
      const { type, step } = (event.data ?? {}) as {
        type?: string
        step?: number
      }
      if (type === 'GO_STEP') {
        const stepNum = Number(step)
        if (!studyInfo.openSteps.includes(stepNum)) return
        setGuideInitialStep(stepNum)
        setRetryNonce(0)
        setCurrentView('Study')
        window.parent.postMessage(
          { type: 'STEP_CHANGED', step: stepNum },
          origin ?? '*',
        )
      } else if (type === 'GO_STORY') {
        setCurrentView('Story')
        window.parent.postMessage(
          { type: 'VIEW_CHANGED', view: 'story' },
          origin ?? '*',
        )
      } else if (type === 'RETRY_STEP') {
        setRetryNonce((n) => n + 1)
        window.parent.postMessage(
          { type: 'STEP_RESTARTED', step: guideInitialStep },
          origin ?? '*',
        )
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [studyInfo, guideInitialStep])

  const isStudyReviewMode = Boolean(studyInfo?.isReview)
  const isGuideMode = studyInfo?.mode === 'guide'
  const showStudyReviewIntro =
    isStudyReviewMode && !introConsumed.studyReview && Boolean(studyInfo)
  const showStoryIntro =
    currentView === 'Story' && studyInfo && !introConsumed.story && !isGuideMode
  const showStudyIntro =
    currentView === 'Study' &&
    studyInfo &&
    !introConsumed.study &&
    !isStudyReviewMode &&
    !isGuideMode
  const showSpeakIntro =
    currentView === 'Speak' && studyInfo && !introConsumed.speak && !isGuideMode

  const showWordPracticeIntro =
    currentView === 'WordPractice' &&
    studyInfo &&
    !introConsumed.wordPractice &&
    !isGuideMode

  const storyContentVisible =
    currentView === 'Story' && (introConsumed.story || isGuideMode)
  const studyContentVisible =
    currentView === 'Study' && (introConsumed.study || isGuideMode)

  const renderView = (): ReactElement => {
    if (currentView === 'Loading') {
      return <CenteredLoading fillViewport />
    }

    if (currentView === 'Speak') {
      return (
        <>
          {introConsumed.speak && (
            <SpeakContainer
              changeCurrentView={changeCurrentView}
              onExitSpeak={() => changeCurrentView('Story')}
            />
          )}
        </>
      )
    }

    if (currentView === 'WordPractice') {
      return <>{introConsumed.wordPractice && <WordPracticeContainer />}</>
    }

    return (
      <>
        <ViewWrapper
          $visible={currentView === 'Story'}
          aria-hidden={currentView !== 'Story'}
        >
          {(isGuideMode ? currentView === 'Story' : introConsumed.story) &&
            (bookInfo?.IsMovieBookYn ? (
              <MovieBookContainer
                changeCurrentView={changeCurrentView}
                isVisible={storyContentVisible}
              />
            ) : (
              <StoryContainer
                changeCurrentView={changeCurrentView}
                isVisible={storyContentVisible}
              />
            ))}
        </ViewWrapper>

        <ViewWrapper
          $visible={currentView === 'Study'}
          aria-hidden={currentView !== 'Study'}
        >
          {(isGuideMode ? currentView === 'Study' : introConsumed.study) &&
            studyInfo &&
            (studyInfo.studyEntryType === 'remix' ? (
              <RemixStudyContainer
                changeCurrentView={changeCurrentView}
                isVisible={studyContentVisible}
                studyCharacter={studyCharacter}
              />
            ) : (
              <LegacyStudyContainer
                key={isGuideMode ? `${guideInitialStep}-${retryNonce}` : undefined}
                changeCurrentView={changeCurrentView}
                isVisible={studyContentVisible}
                guideInitialStep={isGuideMode ? guideInitialStep : undefined}
              />
            ))}
        </ViewWrapper>
      </>
    )
  }

  const coverSrc =
    typeof bookInfo?.SurfaceImage === 'string'
      ? bookInfo.SurfaceImage.trim()
      : ''

  const quizReward = bookInfo ? computeQuizReward(bookInfo) : undefined

  return (
    <SharedAppBackgroundBox $backgroundImage={studyBackgroundImage}>
      <ViewBox>{renderView()}</ViewBox>
      {showStoryIntro && (
        <IntroScreen
          variant={bookInfo?.IsMovieBookYn ? 'moviebook' : 'story'}
          coverSrc={coverSrc}
          onStart={dismissStoryIntro}
        />
      )}
      {showStudyIntro && (
        <IntroScreen
          variant='study'
          coverSrc={coverSrc}
          onStart={dismissStudyIntro}
          onClose={
            studyInfo?.bookType === 'PB'
              ? exitStudyApp
              : () => changeCurrentView('Story')
          }
          soundSrc={
            studyInfo?.bookType === 'PB'
              ? studyInfo?.pbookStorySoundPath
              : undefined
          }
          quizReward={quizReward}
        />
      )}
      {showSpeakIntro && (
        <IntroScreen
          variant='speak'
          coverSrc={coverSrc}
          onStart={dismissSpeakIntro}
          onClose={() => changeCurrentView('Story')}
        />
      )}
      {showWordPracticeIntro && (
        <IntroScreen
          variant='wordPractice'
          coverSrc={coverSrc}
          onStart={dismissWordPracticeIntro}
        />
      )}
      {showStudyReviewIntro && (
        <IntroScreen
          variant='studyReview'
          coverSrc={coverSrc}
          onStart={dismissStudyReviewIntro}
        />
      )}
    </SharedAppBackgroundBox>
  )
}

const SharedAppBackgroundBox = styled.div<{ $backgroundImage: string }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* 이미지 로드 전 한 프레임이라도 흰 화면이 비치지 않도록 */
  background-color: #1a1f28;
  background-image:
    url(${ASSETS.Common.glassWindow}), url(${(props) => props.$backgroundImage});
  background-size:
    auto 100%,
    auto 100%;
  background-position: right, center;
  background-repeat: no-repeat, repeat-x;
  transform: translateZ(0);
  isolation: isolate;
`

const ViewBox = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`

const ViewWrapper = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /*
   * Safari: display none/block 전환 시 합성 레이어가 끊기며 번쩍이는 경우가 많음.
   * 스택만 바꿔 두 뷰의 레이어를 유지합니다.
   */
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  visibility: ${(p) => (p.$visible ? 'visible' : 'hidden')};
  pointer-events: ${(p) => (p.$visible ? 'auto' : 'none')};
  z-index: ${(p) => (p.$visible ? 1 : 0)};
  transform: translateZ(0);
`
