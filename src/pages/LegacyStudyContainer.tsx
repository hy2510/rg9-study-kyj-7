import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useTranslation } from 'react-i18next'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import VocaPreviewPopup from '@components/organisms/story/VocaPreviewPopup'
import ActivityResultPopup from '@components/organisms/study/common/ActivityResultPopup'
import ActivityStage from '@components/organisms/study/common/ActivityStage'
import { renderLegacyActivity } from '@components/templates/study/legacy/renderLegacyActivity'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { HeartContextProvider, useHeartState } from '@contexts/HeartContext'
import { QuestionSoundSlotProvider } from '@contexts/QuestionSoundSlotContext'
import useCharacter from '@hooks/study/legacy/useCharacter'
import { useLegacyQuizManager } from '@hooks/study/legacy/useLegacyQuizManager'
import { useVocabularyPracticeByActivity } from '@hooks/study/legacy/useVocabularyPracticeByActivity'
import { useTimer } from '@hooks/study/remix/useTimer'
import { ViewType } from '@interfaces/common/ViewType'
import StudyShell from '@src/components/templates/study/common/StudyShell'
import { ACTIVITY } from '@src/constants/study/studyConstants'
import { IQuizStudyRef, IRecordAnswerType } from '@src/interfaces/common/Common'
import { StudyTypeCode } from '@src/interfaces/common/Types'
import { IReadingComprehension4 } from '@src/interfaces/study/IReadingComprehension'
import { IWritingActivity2 } from '@src/interfaces/study/IWritingActivity'
import { ILegacyStudyData } from '@src/interfaces/study/legacy/LegacyStudy'
import { buildStepProgressMap } from '@src/utils/study/legacy/buildStepProgressMap'
import { computeStepScore } from '@src/utils/study/legacy/computeStepScore'
import {
  isConfirmOnTimeoutActivity,
  readAdminQuizTimeSec,
  resolveQuizTimeSec,
  shouldLogoutOnTimeoutContinue,
} from '@src/utils/study/legacy/quizTimeLimit'
import {
  resolveWritingRevisionMode,
  writingRevisionModeLabelKey,
} from '@src/utils/study/legacy/writingRevisionMode'
import { getGuideParentOrigin } from '@utils/study/guideMode'
import { isReviewFailMode, isReviewPassMode } from '@utils/study/reviewMode'

const RC4_RETEST_MIN_SCORE_FALLBACK = 70

const VOCABULARY_ACTIVITIES = new Set<string>([
  ACTIVITY.VOCABULARY_1,
  ACTIVITY.VOCABULARY_2,
  ACTIVITY.VOCABULARY_3,
  ACTIVITY.VOCABULARY_4,
])

export type LegacyStudyContainerChildProps = {
  currentStep: number
  onFinishActivity: () => void
}

type LegacyStudyContainerProps = {
  changeCurrentView: (view: ViewType) => void
  isVisible?: boolean
  guideInitialStep?: number
}

export default function LegacyStudyContainer({
  changeCurrentView,
  isVisible = true,
  guideInitialStep,
}: LegacyStudyContainerProps) {
  const { t } = useTranslation()
  const CHARACTER = useCharacter()
  const { studyInfo, bookInfo, handler } = useContext(
    AppContext,
  ) as AppContextProps

  let startStep = studyInfo.startStep

  if (bookInfo.RevisionStatusCode === '028010') {
    const isOpenStep5 = studyInfo.openSteps.find((step) => step === 5)
    if (isOpenStep5) {
      startStep = 5
    }
  }

  const [currentStepId, setCurrentStepId] = useState<number>(
    guideInitialStep ?? startStep,
  )

  const [pendingFinishStepId, setPendingFinishStepId] = useState<number | null>(
    null,
  )

  const [stepRunNonce, setStepRunNonce] = useState(0)

  const [isCurrentStepRetest, setIsCurrentStepRetest] = useState(false)

  const heart = useHeartState(0, currentStepId)

  const {
    time,
    setup,
    startTimer,
    pauseTimer,
    resumeTimer,
    isFinished,
    initialTime,
  } = useTimer()

  const activityPauseRef = useRef(false)
  const answerPauseRef = useRef(false)
  const retryResetPendingRef = useRef(false)
  const [quizTimeoutSignal, setQuizTimeoutSignal] = useState(0)
  const [timerResetSeq, setTimerResetSeq] = useState(0)

  const [isQuizDataReady, setIsQuizDataReady] = useState(false)

  const [activeQuizIndex, setActiveQuizIndex] = useState<number | null>(null)
  useEffect(() => {
    setActiveQuizIndex(null)
  }, [currentStepId, stepRunNonce])

  const onPauseTimer = useCallback(() => {
    activityPauseRef.current = true
    pauseTimer()
  }, [pauseTimer])

  const onResumeTimer = useCallback(() => {
    activityPauseRef.current = false
    if (answerPauseRef.current) return
    resumeTimer()
  }, [resumeTimer])

  const currentActivity = studyInfo.mappedStepActivity[currentStepId - 1] ?? ''
  const isBookTypePB = studyInfo.bookType === 'PB'
  const isReviewPass = isReviewPassMode(studyInfo, bookInfo)
  const isReviewFail = isReviewFailMode(studyInfo, bookInfo)
  const isVocabularyActivity = VOCABULARY_ACTIVITIES.has(currentActivity)
  const fitMobileKeyboardViewport =
    isVocabularyActivity ||
    currentActivity === ACTIVITY.CLOZE_2 ||
    currentActivity === ACTIVITY.CLOZE_3 ||
    currentActivity === ACTIVITY.WRITING_2
  const bookLevelNum = Number.parseInt(
    bookInfo.BookLevel?.trim().substring(0, 1) ?? '',
    10,
  )
  const isLevel2OrAbove = Number.isFinite(bookLevelNum) && bookLevelNum >= 2

  const needsVocaPreview = isVocabularyActivity
  const shouldAutoOpenVocaCards = isVocabularyActivity && !isLevel2OrAbove

  const { vocaData1, vocaData2, vocaData3, vocaData4, loadedActivity } =
    useVocabularyPracticeByActivity(
      needsVocaPreview ? currentActivity : undefined,
    )

  const hasVocaData = Boolean(vocaData1 || vocaData2 || vocaData3 || vocaData4)

  const [isVocaCardsOpen, setIsVocaCardsOpen] = useState(false)
  const [autoOpenedVocaStepId, setAutoOpenedVocaStepId] = useState<
    number | null
  >(null)

  const handleCloseVocaCards = useCallback(() => {
    setIsVocaCardsOpen(false)
    onResumeTimer()
  }, [onResumeTimer])

  const handleOpenVocaCardsFromMenu = useCallback(() => {
    if (!hasVocaData) return
    setIsVocaCardsOpen(true)
    onPauseTimer()
  }, [hasVocaData, onPauseTimer])

  useEffect(() => {
    setIsVocaCardsOpen(false)
  }, [currentStepId, needsVocaPreview])

  useEffect(() => {
    if (!shouldAutoOpenVocaCards) return
    if (loadedActivity !== currentActivity || !hasVocaData) return
    if (autoOpenedVocaStepId === currentStepId) return

    setAutoOpenedVocaStepId(currentStepId)
    setIsVocaCardsOpen(true)
    onPauseTimer()
  }, [
    currentActivity,
    currentStepId,
    autoOpenedVocaStepId,
    hasVocaData,
    loadedActivity,
    onPauseTimer,
    shouldAutoOpenVocaCards,
  ])

  const isWaitingForAutomaticVocaCards =
    shouldAutoOpenVocaCards &&
    autoOpenedVocaStepId !== currentStepId &&
    loadedActivity !== currentActivity

  useEffect(() => {
    setIsQuizDataReady(false)
  }, [currentStepId])

  useEffect(() => {
    if (isVisible) {
      if (
        !activityPauseRef.current &&
        !answerPauseRef.current &&
        isQuizDataReady &&
        (time.timeMin > 0 || time.timeSec > 0)
      ) {
        startTimer()
      }
    } else {
      pauseTimer()
    }
  }, [isVisible, time, startTimer, pauseTimer, isQuizDataReady, timerResetSeq])

  const formatTime = (timeMin: number, timeSec: number): string => {
    const min = String(timeMin).padStart(2, '0')
    const sec = String(timeSec).padStart(2, '0')
    return `${min}:${sec}`
  }

  const quizStudyRef = useMemo<IQuizStudyRef>(
    () => ({
      mode: studyInfo.mode,
      studyId: studyInfo.studyId,
      studentHistoryId: studyInfo.studentHistoryId,
      bookType: studyInfo.bookType,
      studyTypeCode: (studyInfo.bookType === 'EB'
        ? '001006'
        : '001001') as StudyTypeCode,
    }),
    [
      studyInfo.mode,
      studyInfo.studyId,
      studyInfo.studentHistoryId,
      studyInfo.bookType,
    ],
  )
  const openStepsMemo = useMemo(
    () => studyInfo.openSteps,
    [studyInfo.openSteps],
  )
  const mappedStepActivityMemo = useMemo(
    () => studyInfo.mappedStepActivity,
    [studyInfo.mappedStepActivity],
  )
  const legacyQuizManager = useLegacyQuizManager({
    studyRef: quizStudyRef,
    openSteps: openStepsMemo,
    mappedStepActivity: mappedStepActivityMemo,
    isReTestYn: studyInfo.isReTestYn ?? false,
  })

  const stepProgressMap = useMemo(
    () => buildStepProgressMap(legacyQuizManager.stepDataMap),
    [legacyQuizManager.stepDataMap],
  )

  const resolveRc4PassMark = useCallback(
    (stepId: number): number => {
      const quizData = legacyQuizManager.stepDataMap[stepId]?.quizData as
        IReadingComprehension4 | undefined
      const raw = quizData?.PassMark
      return typeof raw === 'number' && Number.isFinite(raw) && raw >= 0
        ? raw
        : RC4_RETEST_MIN_SCORE_FALLBACK
    },
    [legacyQuizManager.stepDataMap],
  )

  const getNextStepId = (): number | undefined => {
    const idx = studyInfo.openSteps.findIndex(
      (value) => value === currentStepId,
    )
    return idx >= 0 && studyInfo.openSteps.length > idx + 1
      ? studyInfo.openSteps[idx + 1]
      : undefined
  }

  const proceedToNextStep = () => {
    setPendingFinishStepId(null)
    setIsCurrentStepRetest(false)
    const nextStepId = getNextStepId()

    if (nextStepId) {
      setCurrentStepId(nextStepId)
      return
    }

    if (studyInfo.mode === 'student' || studyInfo.mode === 'trial') {
      const tempFinishStudyInfo =
        window.sessionStorage.getItem('finishStudyInfo')

      if (tempFinishStudyInfo) {
        window.sessionStorage.removeItem('finishStudyInfo')
        handler.actionFinishStudy(JSON.parse(tempFinishStudyInfo), CHARACTER)
      } else {
        handler.actionFinishStudy({ id: 0, cause: undefined }, CHARACTER)
      }
      return
    }

    try {
      window.onExitStudy()
    } catch {
      location.replace('/')
    }
  }

  const retryCurrentStep = () => {
    const stepId = pendingFinishStepId
    setPendingFinishStepId(null)
    if (stepId === null) return
    legacyQuizManager.resetStepRecord(stepId)
    activityPauseRef.current = false
    setIsCurrentStepRetest(true)
    setStepRunNonce((n) => n + 1)
  }

  const isGuideMode = studyInfo.mode === 'guide'

  const postToParent = useCallback(
    (data: object) => {
      if (!isGuideMode) return
      const origin = getGuideParentOrigin()
      window.parent.postMessage(data, origin ?? '*')
    },
    [isGuideMode],
  )

  const onCurrentActivityFinish = () => {
    const activeElement = document.activeElement
    if (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      (activeElement instanceof HTMLElement && activeElement.isContentEditable)
    ) {
      activeElement.blur()
    }
    postToParent({ type: 'ACTIVITY_FINISHED', step: currentStepId })
    if (currentActivity === ACTIVITY.WRITING_2) {
      proceedToNextStep()
      return
    }
    setPendingFinishStepId(currentStepId)
  }

  const changeStep = (step: number) => {
    setIsCurrentStepRetest(false)
    setCurrentStepId(step)
  }

  const handleNavigateStep = useCallback((stepId: number) => {
    setPendingFinishStepId(null)
    setIsCurrentStepRetest(false)
    setCurrentStepId(stepId)
  }, [])
  const canNavigateStep =
    studyInfo.mode !== 'student' && studyInfo.mode !== 'trial'

  const datas: ILegacyStudyData = {
    mode: studyInfo.mode,
    currentStep: currentStepId,
    studyId: studyInfo.studyId,
    studentHistoryId: studyInfo.studentHistoryId,
    bookType: studyInfo.bookType,
    studyTypeCode: (studyInfo.bookType === 'EB'
      ? '001006'
      : '001001') as StudyTypeCode,
    lastStep: studyInfo.openSteps[studyInfo.openSteps.length - 1],
    onFinishActivity: onCurrentActivityFinish,
    changeStep,
  }

  const currentStepData = legacyQuizManager.stepDataMap[currentStepId]

  useEffect(() => {
    if (currentStepData?.quizData) {
      setIsQuizDataReady(true)
    }
  }, [currentStepData?.quizData])

  const quizTimeSec = resolveQuizTimeSec(currentStepData?.quizData)
  const quizAnswerCount = currentStepData?.quizAnswerCount ?? 0

  const resetQuizTimer = useCallback(() => {
    if (isReviewPass) return
    answerPauseRef.current = false
    retryResetPendingRef.current = false
    setup(quizTimeSec)
    setTimerResetSeq((n) => n + 1)
  }, [isReviewPass, quizTimeSec, setup])

  const onQuizFeedbackDismiss = useCallback(() => {
    if (!retryResetPendingRef.current) return
    resetQuizTimer()
  }, [resetQuizTimer])

  useEffect(() => {
    resetQuizTimer()
  }, [currentStepId, stepRunNonce, activeQuizIndex, resetQuizTimer])

  const onResetQuizTimer = useCallback(() => {
    activityPauseRef.current = false
    resetQuizTimer()
  }, [resetQuizTimer])

  useEffect(() => {
    if (initialTime === 0 || !isFinished) return
    const logout = () => {
      try {
        ;(window as Window & { onLogoutStudy?: () => void }).onLogoutStudy?.()
      } catch {}
    }
    if (!isConfirmOnTimeoutActivity(currentActivity)) {
      logout()
      return
    }
    if (!window.confirm(t('study.timeoutContinueConfirm'))) {
      logout()
      return
    }
    if (
      shouldLogoutOnTimeoutContinue({
        activity: currentActivity,
        bookCode: bookInfo.BookCode,
        bookLevel: bookInfo.BookLevel,
        adminQuizTimeSec: readAdminQuizTimeSec(currentStepData?.quizData),
      })
    ) {
      logout()
      return
    }
    setQuizTimeoutSignal((n) => n + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished, initialTime])

  const onUpdateRecord = useCallback(
    (record: IRecordAnswerType) => {
      legacyQuizManager.patchStepRecord(currentStepId, record)
      answerPauseRef.current = true
      pauseTimer()
      const isRetrySameQuiz =
        record.OX !== '1' && record.AnswerCount < quizAnswerCount
      if (isRetrySameQuiz) retryResetPendingRef.current = true
    },
    [currentStepId, legacyQuizManager, pauseTimer, quizAnswerCount],
  )
  const datasWithPrefetch: ILegacyStudyData = {
    ...datas,
    quizData: currentStepData?.quizData,
    recordedData: currentStepData?.recordedData,
    onUpdateRecord,
    onActiveQuizChange: setActiveQuizIndex,
    onPauseTimer,
    onResumeTimer,
    onResetQuizTimer,
    quizTimeoutSignal,
    isRetest: isCurrentStepRetest || (studyInfo.isReTestYn ?? false),
  }

  const component = renderLegacyActivity({
    activity: currentActivity,
    datas,
    datasWithPrefetch,
    isWriting2Review: Boolean(studyInfo.isReview),
    isWriting2Rewriting:
      bookInfo.RevisionStatusCode === '028010' ||
      bookInfo.RevisionStatusCode === '028009',
  })

  const currentStepProgress = stepProgressMap[currentStepId]
  const currentStepSolvedCount = currentStepProgress
    ? currentStepProgress.attempts.filter(
        (row) => row.includes('O') || row.every((mark) => mark === 'X'),
      ).length
    : 0

  const isRc4Finish =
    pendingFinishStepId !== null &&
    (studyInfo.mappedStepActivity[pendingFinishStepId - 1] ?? '') ===
      ACTIVITY.READING_COMP_4

  const rc4Score =
    pendingFinishStepId !== null
      ? computeStepScore(stepProgressMap[pendingFinishStepId]?.attempts ?? [])
      : 0

  const rc4PassMark =
    isRc4Finish && pendingFinishStepId !== null
      ? resolveRc4PassMark(pendingFinishStepId)
      : RC4_RETEST_MIN_SCORE_FALLBACK

  const isRc4Retest =
    isRc4Finish && !studyInfo.isReview && rc4Score < rc4PassMark
  const isRc4Pass =
    isRc4Finish && (studyInfo.isReview || rc4Score >= rc4PassMark)

  const rc4QuizList =
    isRc4Pass && pendingFinishStepId !== null
      ? ((
          legacyQuizManager.stepDataMap[pendingFinishStepId]?.quizData as
            IReadingComprehension4 | undefined
        )?.Quiz ?? [])
      : []

  const rc4ReviewItems =
    isRc4Pass && pendingFinishStepId !== null
      ? (legacyQuizManager.stepDataMap[pendingFinishStepId]?.recordedData ?? [])
          .filter((record) => record.OX !== '1')
          .map((record) => ({
            questionNo: record.CurrentQuizNo,
            questionText:
              rc4QuizList.find((quiz) => quiz.QuizNo === record.QuizNo)
                ?.Question.Text ?? '',
            studentAnswer: record.StudentAnswer,
            correctAnswer: record.Correct,
          }))
      : undefined

  return (
    <HeartContextProvider value={heart}>
      <StudyShell
        fitMobileViewport={fitMobileKeyboardViewport}
        character={CHARACTER}
        onQuizFeedbackDismiss={onQuizFeedbackDismiss}
        isVisible={isVisible}
        headerProps={{
          variant: 'study',
          engine: 'legacy',
          bookCode: bookInfo.BookCode,
          bookTitle: bookInfo.Title,
          keywords: bookInfo.Keywords,
          isBookTypePB: studyInfo.bookType === 'PB',
          changeCurrentView,
          shouldShowCenterInfo: true,
          currentHeart: heart.current,
          maxHeart: heart.max,
          time,
          formatTime,
          progress: currentStepSolvedCount,
          total: currentStepProgress?.quizCount ?? 1,
          questionNumber: Math.min(
            activeQuizIndex ?? currentStepSolvedCount + 1,
            currentStepProgress?.quizCount ?? 1,
          ),
          openSteps: studyInfo.openSteps,
          currentStepId,
          stepProgressMap,
          mappedStepActivity: studyInfo.mappedStepActivity,
          showVocaCardsMenu: isBookTypePB && needsVocaPreview && hasVocaData,
          onOpenVocaCards: handleOpenVocaCardsFromMenu,
          onNavigateStep: canNavigateStep ? handleNavigateStep : undefined,
          statusLabel: isReviewPass
            ? t('study.reviewBadge')
            : currentActivity === ACTIVITY.WRITING_2
              ? (currentStepData?.quizData as IWritingActivity2 | undefined)
                  ?.Writing?.Type === 'No Revision'
                ? 'Writing Activity'
                : t(
                    writingRevisionModeLabelKey(
                      resolveWritingRevisionMode(
                        (
                          currentStepData?.quizData as
                            IWritingActivity2 | undefined
                        )?.Writing?.Mode,
                      ),
                    ),
                  )
              : undefined,
          reviewBadge: isReviewFail ? t('study.reviewBadge') : undefined,
        }}
      >
        {!isVocaCardsOpen && component && !isWaitingForAutomaticVocaCards ? (
          <ActivityStage
            key={`${currentStepId}:${stepRunNonce}`}
            fillMobileViewport={fitMobileKeyboardViewport}
          >
            <QuestionSoundSlotProvider>{component}</QuestionSoundSlotProvider>
          </ActivityStage>
        ) : null}
        {isWaitingForAutomaticVocaCards ? <CenteredLoading /> : null}
        {pendingFinishStepId !== null && (
          <ActivityResultPopup
            stepId={pendingFinishStepId}
            activity={
              studyInfo.mappedStepActivity[pendingFinishStepId - 1] ?? ''
            }
            stepProgress={stepProgressMap[pendingFinishStepId]}
            isLastStep={getNextStepId() === undefined}
            onProceed={isRc4Retest ? retryCurrentStep : proceedToNextStep}
            proceedLabel={isRc4Retest ? 'Try Again' : undefined}
            notice={
              isRc4Retest
                ? t('study.rc4RetestNotice', { score: rc4PassMark })
                : undefined
            }
            character={CHARACTER}
            reviewItems={rc4ReviewItems}
          />
        )}
        {isVocaCardsOpen ? (
          <VocaPreviewPopup
            bookLevel={bookInfo.BookLevel}
            bookType={studyInfo.bookType}
            onClose={handleCloseVocaCards}
            pauseBookAudio={() => {}}
            vocaData1={vocaData1}
            vocaData2={vocaData2}
            vocaData3={vocaData3}
            vocaData4={vocaData4}
          />
        ) : null}
      </StudyShell>
    </HeartContextProvider>
  )
}
