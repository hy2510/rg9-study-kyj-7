import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import IntroScreen from '@components/organisms/common/IntroScreen'
import AcquiredAugmentsModal from '@components/organisms/study/remix/AcquiredAugmentsModal'
import Augment from '@components/templates/study/remix/Augment'
import QuizAct1 from '@components/templates/study/remix/QuizAct1'
import QuizAct2 from '@components/templates/study/remix/QuizAct2'
import Review from '@components/templates/study/remix/Review'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useAugmentManager } from '@hooks/study/remix/useAugmentManager'
import { useHeart } from '@hooks/study/remix/useHeart'
import { useQuizManager } from '@hooks/study/remix/useQuizManager'
import { useTimer } from '@hooks/study/remix/useTimer'
import { ViewType } from '@interfaces/common/ViewType'
import { QuizInfo } from '@interfaces/study/remix/QuizInfo'
import StudyShell from '@src/components/templates/study/common/StudyShell'
import { AUGMENT_CONSTANTS } from '@src/constants/study/remix/augment'
import { IQuizStudyRef } from '@src/interfaces/common/Common'
import { StudyMode } from '@src/interfaces/common/Types'

type RemixStudyContainerProps = {
  changeCurrentView: (view: ViewType) => void
  isVisible?: boolean
  studyCharacter: string
}

export default function RemixStudyContainer({
  changeCurrentView,
  isVisible = true,
  studyCharacter,
}: RemixStudyContainerProps) {
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const [quizInfo, setQuizInfo] = useState<QuizInfo>({
    mode: 'Act1',
    stage: 0,
    round: 0,
    isAct1: false,
    incorrectQuizzes: [],
  })
  const [isAgumentOpen, setIsAgumentOpen] = useState<boolean>(false)
  const [isAcquiredAugmentsOpen, setIsAcquiredAugmentsOpen] =
    useState<boolean>(false)
  const [reviewTotalIncorrect, setReviewTotalIncorrect] = useState(0)
  const [reviewIntroConsumed, setReviewIntroConsumed] = useState(true)

  const studyData = useMemo<IQuizStudyRef>(() => {
    if (!studyInfo || !bookInfo) {
      return {
        mode: 'student',
        studyId: '',
        studentHistoryId: '',
        bookType: 'EB',
        studyTypeCode: '001006',
      }
    }

    return {
      mode: studyInfo.mode,
      studyId: studyInfo.studyId,
      studentHistoryId: studyInfo.studentHistoryId,
      bookType: studyInfo.bookType,
      studyTypeCode: studyInfo.bookType === 'EB' ? '001006' : '001001',
    }
  }, [studyInfo, bookInfo])

  useLayoutEffect(() => {
    if (quizInfo.mode === 'Review') {
      setReviewIntroConsumed(false)
    } else {
      setReviewIntroConsumed(true)
    }
  }, [quizInfo.mode])

  const {
    act1Data,
    shuffledQuizStages,
    activityTypes,
    isLoading: isLoadingQuizData,
  } = useQuizManager(studyData)

  const {
    time,
    currentTime,
    initialTime,
    setup,
    increaseTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    isFinished,
    setTimeInterval,
  } = useTimer()

  const [contextHeart, setContextHeart] = useState<number>(
    AUGMENT_CONSTANTS.HEART.DEFAULT_MAX,
  )
  const [contextShield, setContextShield] = useState<boolean>(false)

  const augmentManager = useAugmentManager({
    studyMode: quizInfo.mode,
    activityTypes,
    currentHeart: contextHeart,
    baseMaxHeart: AUGMENT_CONSTANTS.HEART.DEFAULT_MAX,
    hasShield: contextShield,
    currentTime,
    initialTime,
    stage: quizInfo.stage,
    totalStage: shuffledQuizStages.length,
  })

  const effectiveMaxHeart =
    AUGMENT_CONSTANTS.HEART.DEFAULT_MAX +
    (augmentManager.getAugmentOptions().heart?.maxHeartBonus ?? 0)

  const {
    currentHeart,
    maxHeart,
    decreaseHeart,
    increaseHeart,
    resetHeart,
    isHeartEmpty,
    currentShield,
    maxShield,
    decreaseShield,
    increaseShield,
    resetShield,
    hasShield,
  } = useHeart(AUGMENT_CONSTANTS.HEART.DEFAULT_MAX, effectiveMaxHeart)

  useEffect(() => {
    setContextHeart(currentHeart)
    setContextShield(hasShield)
  }, [currentHeart, hasShield])

  const handleWrongAnswer = useCallback(() => {
    if (hasShield) {
      decreaseShield(1)
    } else {
      decreaseHeart()
    }
  }, [hasShield, decreaseShield, decreaseHeart])

  useEffect(() => {
    const options = augmentManager.getAugmentOptions()
    setTimeInterval(options.time.timeInterval)
  }, [augmentManager.selectedAugments, augmentManager, setTimeInterval])

  const handleModeChange = (newMode: StudyMode) => {
    setQuizInfo({
      ...quizInfo,
      mode: newMode,
      stage: 0,
      round: 0,
      incorrectQuizzes: newMode === 'Act2' ? [] : quizInfo.incorrectQuizzes,
    })
  }

  const handleSkipAct1 = useCallback(() => {
    setIsAgumentOpen(true)
  }, [])

  const handleNextStage = () => {
    const totalStages = shuffledQuizStages.length
    if (quizInfo.stage < totalStages - 1) {
      setQuizInfo({
        ...quizInfo,
        mode: 'Act2',
        stage: quizInfo.stage + 1,
        round: 0,
        incorrectQuizzes: [],
      })
    }
  }

  const renderView = (): ReactElement => {
    switch (quizInfo.mode) {
      case 'Act1':
        return (
          <QuizAct1
            quizInfo={quizInfo}
            act1Data={act1Data}
            setQuizInfo={setQuizInfo}
            setIsAugmentOpen={setIsAgumentOpen}
          />
        )
      case 'Act2':
        return (
          <QuizAct2
            quizInfo={quizInfo}
            act2Data={shuffledQuizStages}
            setQuizInfo={setQuizInfo}
            setIsAugmentOpen={setIsAgumentOpen}
            selectedAugments={augmentManager.selectedAugments}
            onWrongAnswer={handleWrongAnswer}
          />
        )
      case 'Review':
        if (!reviewIntroConsumed) {
          return <></>
        }
        return (
          <Review
            incorrectQuizzes={quizInfo.incorrectQuizzes}
            quizInfo={quizInfo}
            totalStages={shuffledQuizStages.length}
            selectedAugments={augmentManager.selectedAugments}
            setQuizInfo={setQuizInfo}
            setIsAugmentOpen={setIsAgumentOpen}
          />
        )
      default:
        return <CenteredLoading />
    }
  }

  useEffect(() => {
    if (isVisible && quizInfo.mode === 'Act2' && !isAgumentOpen) {
      if (time.timeMin === 0 && time.timeSec === 0) {
        setup(1200)
      }
      startTimer()
    } else {
      pauseTimer()
    }
  }, [
    isVisible,
    quizInfo.mode,
    isAgumentOpen,
    setup,
    startTimer,
    pauseTimer,
    time,
  ])

  useEffect(() => {
    if (!isAgumentOpen && quizInfo.mode === 'Act2') {
      resumeTimer()
    }
  }, [isAgumentOpen, quizInfo.mode, resumeTimer])

  const prevModeRef = useRef<StudyMode>(quizInfo.mode)
  useEffect(() => {
    if (prevModeRef.current !== 'Review' && quizInfo.mode === 'Review') {
      setReviewTotalIncorrect(quizInfo.incorrectQuizzes.length)
    } else if (quizInfo.mode !== 'Review') {
      setReviewTotalIncorrect(0)
    }
    prevModeRef.current = quizInfo.mode
  }, [quizInfo.mode, quizInfo.incorrectQuizzes.length])

  const shouldShowCeterInfo =
    quizInfo.mode === 'Act2' || quizInfo.mode === 'Review'

  const formatTime = (timeMin: number, timeSec: number): string => {
    const min = String(timeMin).padStart(2, '0')
    const sec = String(timeSec).padStart(2, '0')
    return `${min}:${sec}`
  }

  const openAcquiredAugmentsModal = () => setIsAcquiredAugmentsOpen(true)

  const closeAcquiredAugmentsModal = () => setIsAcquiredAugmentsOpen(false)

  const closeAugmentModal = () => {
    setIsAgumentOpen(false)
  }

  const goToQuizFromAugment = () => {
    setIsAgumentOpen(false)
    if (quizInfo.mode === 'Act1') {
      setQuizInfo({
        ...quizInfo,
        mode: 'Act2',
        stage: 0,
        round: 0,
      })
    } else {
      handleNextStage()
    }
  }

  return (
    <StudyShell
      character={studyCharacter}
      headerProps={{
        variant: 'study',
        engine: 'remix',
        bookCode: bookInfo.BookCode,
        bookTitle: bookInfo.Title,
        keywords: bookInfo.Keywords,
        isBookTypePB: studyInfo.bookType === 'PB',
        changeCurrentView,
        quizInfo,
        onModeChange: handleModeChange,
        shouldShowCenterInfo: shouldShowCeterInfo,
        currentHeart,
        maxHeart,
        time,
        reviewCurrent:
          quizInfo.mode === 'Review' &&
          reviewTotalIncorrect > 0 &&
          quizInfo.incorrectQuizzes.length > 0
            ? reviewTotalIncorrect - quizInfo.incorrectQuizzes.length + 1
            : undefined,
        reviewTotal:
          quizInfo.mode === 'Review' &&
          reviewTotalIncorrect > 0 &&
          quizInfo.incorrectQuizzes.length > 0
            ? reviewTotalIncorrect
            : undefined,
        formatTime,
        progress: 1,
        total: 5,
        questionNumber:
          quizInfo.mode === 'Act2'
            ? quizInfo.round + 1
            : quizInfo.mode === 'Review' && reviewTotalIncorrect > 0
              ? reviewTotalIncorrect - quizInfo.incorrectQuizzes.length + 1
              : undefined,
        acquiredAugmentCount: augmentManager.selectedAugments.length,
        onOpenAcquiredAugments: openAcquiredAugmentsModal,
        onSkipAct1: handleSkipAct1,
      }}
      modals={
        <>
          {isAcquiredAugmentsOpen && (
            <AcquiredAugmentsModal
              selectedAugments={augmentManager.selectedAugments}
              onClose={closeAcquiredAugmentsModal}
            />
          )}
          {isAgumentOpen && (
            <Augment
              selectableAugments={augmentManager.selectableAugments}
              stage={quizInfo.stage}
              round={quizInfo.round}
              selectAugment={augmentManager.selectAugment}
              onClose={closeAugmentModal}
              onGoToQuiz={goToQuizFromAugment}
              increaseHeart={increaseHeart}
              resetHeart={resetHeart}
              increaseShield={increaseShield}
              increaseTime={increaseTime}
            />
          )}

          {quizInfo.mode === 'Review' && !reviewIntroConsumed && (
            <IntroScreen
              variant='review'
              onStart={() => setReviewIntroConsumed(true)}
            />
          )}
        </>
      }
    >
      {isVisible ? renderView() : null}
    </StudyShell>
  )
}
