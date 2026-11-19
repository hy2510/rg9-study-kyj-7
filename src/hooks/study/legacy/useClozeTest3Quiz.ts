import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  useQuizTimeoutSignal,
  useQuizTimerHold,
} from '@hooks/study/legacy/useQuizTimeoutSignal'
import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import useStudyAudio from '@hooks/study/legacy/useStudyAudio'
import { useSpellingPhysicalKeyboard } from '@hooks/study/remix/useSpellingPhysicalKeyboard'
import { useMobileViewport } from '@hooks/useMobileViewport'
import { deletePenalty, saveUserAnswerPartial } from '@services/studyApi'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'
import { ILegacyStudyData } from '@src/interfaces/study/legacy/LegacyStudy'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import {
  buildClozeDisplayText,
  buildSentenceTokens,
  findNextUncorrectedIndex,
  getClozeInputChars,
  isClozeSpellingCorrect,
} from '@src/utils/study/legacy/clozeTestUtils'

import {
  ClozeTest3InitialState,
  ClozeTest3InputValue,
  ClozeTest3PenaltyState,
  ClozeTest3QuizMeta,
} from './useClozeTest3View'

type UseClozeTest3QuizArgs = {
  props: ILegacyStudyData
  isReady: boolean
  totalQuiz: number
  quizAnswerCount: number
  isEnabledPenalty: boolean
  initial: ClozeTest3InitialState
  getQuizMeta: (quizNo: number) => ClozeTest3QuizMeta | null
  makeEmptyInputs: (quizNo: number) => ClozeTest3InputValue[]
  recordedData: IRecordAnswerType[]
  studyMode: Mode
  isReviewPass?: boolean
  heart: {
    setMax: (n: number) => void
    setCurrent: (n: number) => void
    decrease: () => void
  }
  quizFeedback: {
    presentResult: (isCorrect: boolean, callback: () => void) => void
  } | null
}

export function useClozeTest3Quiz({
  props,
  isReady,
  totalQuiz,
  quizAnswerCount,
  isEnabledPenalty,
  initial,
  getQuizMeta,
  makeEmptyInputs,
  recordedData,
  studyMode,
  isReviewPass = false,
  heart,
  quizFeedback,
}: UseClozeTest3QuizArgs) {
  const isMobileViewport = useMobileViewport()
  const studentAnswer = useStudentAnswer(studyMode)
  const { playState, playAudio, stopAudio, pauseAudio, resumeAudio, seekBy } =
    useStudyAudio()

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(1)
  const [tryCount, setTryCount] = useState<number>(0)
  const [inputValues, setInputValues] = useState<ClozeTest3InputValue[]>([])
  const [currentBlankIndex, setCurrentBlankIndex] = useState<number>(0)
  const [inputLetters, setInputLetters] = useState<string>('')
  const [penaltyState, setPenaltyState] =
    useState<ClozeTest3PenaltyState>('none')
  const isWorking = useRef<boolean>(true)
  const onEnterOrTabRef = useRef<() => void>(() => {})
  const perBlankHistoryRef = useRef<string[]>([])
  const REVEAL_FALLBACK_MS = 2000
  const [isRevealing, setIsRevealing] = useState<boolean>(false)
  const isRevealingRef = useRef<boolean>(false)
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current !== null) {
      clearTimeout(revealTimerRef.current)
      revealTimerRef.current = null
    }
    isRevealingRef.current = false
    setIsRevealing(false)
  }, [])

  useEffect(
    () => () => {
      if (revealTimerRef.current !== null) clearTimeout(revealTimerRef.current)
    },
    [],
  )

  useEffect(() => {
    if (!isReady) return
    setCurrentQuizIndex(initial.startQuizNo)
    setTryCount(initial.startTryCount)
    const initialInputs = (() => {
      if (!isReviewPass) return initial.startInputValues
      const meta = getQuizMeta(initial.startQuizNo)
      if (!meta) return initial.startInputValues
      return meta.correctAnswers.map((ans) => ({
        text: ans,
        isCorrected: true,
      }))
    })()
    setInputValues(initialInputs)
    setCurrentBlankIndex(initial.startCurrentIndex)
    setPenaltyState(initial.startPenaltyState)
    setInputLetters('')
    perBlankHistoryRef.current = [...initial.startPerBlankHistory]
    studentAnswer.setStudentAnswers(recordedData, quizAnswerCount)
    heart.setMax(quizAnswerCount)
    heart.setCurrent(quizAnswerCount - initial.startTryCount)
    isWorking.current = false
    const meta = getQuizMeta(initial.startQuizNo)
    if (initial.startPenaltyState === 'none' && meta?.sound)
      playAudio(meta.sound)
  }, [isReady])

  useEffect(() => {
    if (!isReady || !isReviewPass) return
    const meta = getQuizMeta(currentQuizIndex)
    if (!meta) return
    setInputValues(
      meta.correctAnswers.map((ans) => ({ text: ans, isCorrected: true })),
    )
    setCurrentBlankIndex(0)
    setInputLetters('')
  }, [isReady, isReviewPass, currentQuizIndex])

  useEffect(() => {
    if (!isReady) return
    isWorking.current = false
  }, [currentQuizIndex])

  useEffect(() => {
    props.onActiveQuizChange?.(currentQuizIndex)
  }, [currentQuizIndex, props])

  useEffect(() => {
    if (penaltyState === 'success') {
      // eslint-disable-next-line react-hooks/immutability -- finalizePenalty 는 컴포넌트 함수 내 정의
      finalizePenalty()
    }
  }, [penaltyState])

  const currentMeta = isReady ? getQuizMeta(currentQuizIndex) : null

  const sentenceTokens = useMemo(
    () => (currentMeta ? buildSentenceTokens(currentMeta.sentence) : []),
    [currentMeta],
  )

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!currentMeta) return
      if (isRevealingRef.current) {
        if (key === 'enter' || key === 'tab') onEnterOrTabRef.current()
        return
      }
      if (isWorking.current) return
      if (isReviewPass) {
        if (key === 'enter' || key === 'tab') onEnterOrTabRef.current()
        return
      }
      const maxLen = getClozeInputChars(
        currentMeta.correctAnswers[currentBlankIndex] ?? '',
      ).length
      if (key === 'backspace') {
        setInputLetters((prev) => prev.slice(0, -1))
      } else if (key === 'enter' || key === 'tab') {
        onEnterOrTabRef.current()
      } else if (key === 'space') {
        setInputLetters((prev) => (prev + ' ').slice(0, maxLen))
      } else if (/^[a-zA-Z]$/.test(key)) {
        setInputLetters((prev) => (prev + key.toLowerCase()).slice(0, maxLen))
      }
    },
    [currentBlankIndex, currentMeta, isReviewPass],
  )

  const handleNativeValueChange = useCallback(
    (value: string) => {
      if (
        !currentMeta ||
        isWorking.current ||
        isRevealingRef.current ||
        isReviewPass
      )
        return
      const maxLen = getClozeInputChars(
        currentMeta.correctAnswers[currentBlankIndex] ?? '',
      ).length
      setInputLetters(getClozeInputChars(value).toLowerCase().slice(0, maxLen))
    },
    [currentMeta, currentBlankIndex, isReviewPass],
  )

  useSpellingPhysicalKeyboard({
    enabled: !isMobileViewport,
    allowSpace: true,
    onKeyPress: handleKeyPress,
  })

  // eslint-disable-next-line react-hooks/immutability -- checkAnswer 는 컴포넌트 함수 내 정의
  useEffect(() => {
    if (!isReady || !currentMeta) return
    if (isWorking.current) return
    if (inputLetters === '') return
    if (isReviewPass) return

    const correctText = currentMeta.correctAnswers[currentBlankIndex] ?? ''
    const maxLen = getClozeInputChars(correctText).length
    if (inputLetters.length < maxLen) return

    const filledText = buildClozeDisplayText(correctText, inputLetters)

    if (penaltyState === 'penalty') {
      if (isClozeSpellingCorrect(filledText, correctText)) {
        const updatedValues = inputValues.map((v, i) =>
          i === currentBlankIndex ? { text: filledText, isCorrected: true } : v,
        )
        setInputValues(updatedValues)
        const nextIndex = updatedValues.findIndex((v) => !v.isCorrected)
        if (nextIndex === -1) {
          setPenaltyState('success')
        } else {
          setCurrentBlankIndex(nextIndex)
          setInputLetters('')
        }
      }
      return
    }

    if (penaltyState !== 'none') return
    if (!isClozeSpellingCorrect(filledText, correctText)) return

    const updatedValues = inputValues.map((v, i) =>
      i === currentBlankIndex ? { text: filledText, isCorrected: true } : v,
    )

    const nextIndex = findNextUncorrectedIndex(updatedValues, currentBlankIndex)
    if (nextIndex !== -1) {
      setInputValues(updatedValues)
      setCurrentBlankIndex(nextIndex)
      setInputLetters(getClozeInputChars(updatedValues[nextIndex]?.text ?? ''))
    } else {
      setInputValues(updatedValues)
      // eslint-disable-next-line react-hooks/immutability -- checkAnswer 는 컴포넌트 함수 내 정의
      checkAnswer(updatedValues)
    }
  }, [inputLetters, currentBlankIndex, penaltyState, isReady, isReviewPass])

  const currentCorrectText =
    currentMeta?.correctAnswers[currentBlankIndex] ?? ''
  const correctLetterLen = getClozeInputChars(currentCorrectText).length
  const isCurrentAllFilled = inputLetters.length === correctLetterLen
  const isCurrentIncorrect =
    isCurrentAllFilled &&
    !isClozeSpellingCorrect(inputLetters, currentCorrectText)

  const onClickBlank = (blankIndex: number) => {
    if (blankIndex === currentBlankIndex) return
    if (penaltyState !== 'none') return
    const val = inputValues[blankIndex]
    if (!val || val.isCorrected) return

    const currentVal = inputValues[currentBlankIndex]
    let nextValues = inputValues
    if (currentVal && !currentVal.isCorrected && inputLetters !== '') {
      const displayText = buildClozeDisplayText(
        currentCorrectText,
        inputLetters,
      )
      nextValues = inputValues.map((v, i) =>
        i === currentBlankIndex ? { text: displayText, isCorrected: false } : v,
      )
      setInputValues(nextValues)
    }

    const savedLetters = getClozeInputChars(nextValues[blankIndex]?.text ?? '')
    setCurrentBlankIndex(blankIndex)
    setInputLetters(savedLetters)
  }

  const handleNextInput = () => {
    if (penaltyState !== 'none') return
    const next = findNextUncorrectedIndex(inputValues, currentBlankIndex)
    if (next === -1) return

    const currentVal = inputValues[currentBlankIndex]
    let nextValues = inputValues
    if (currentVal && !currentVal.isCorrected && inputLetters !== '') {
      const displayText = buildClozeDisplayText(
        currentCorrectText,
        inputLetters,
      )
      nextValues = inputValues.map((v, i) =>
        i === currentBlankIndex ? { text: displayText, isCorrected: false } : v,
      )
      setInputValues(nextValues)
    }

    const savedLetters = getClozeInputChars(nextValues[next]?.text ?? '')
    setCurrentBlankIndex(next)
    setInputLetters(savedLetters)
  }

  const buildValuesToSubmit = (
    meta: ClozeTest3QuizMeta,
  ): ClozeTest3InputValue[] => {
    const currentText = buildClozeDisplayText(
      meta.correctAnswers[currentBlankIndex] ?? '',
      inputLetters,
    )
    return inputValues.map((v, i) => {
      if (i !== currentBlankIndex) return v
      const isCorrect =
        meta.correctAnswers[i] === currentText.trimStart().trimEnd()
      return { text: currentText, isCorrected: isCorrect }
    })
  }

  const handleSubmit = () => {
    if (isWorking.current) return
    const meta = currentMeta
    if (!meta) return
    const valuesToSubmit = buildValuesToSubmit(meta)

    const emptyIndex = valuesToSubmit.findIndex(
      (v) => !v.isCorrected && v.text.trimStart().trimEnd() === '',
    )
    if (emptyIndex !== -1) {
      setInputValues(valuesToSubmit)
      setCurrentBlankIndex(emptyIndex)
      setInputLetters(
        getClozeInputChars(valuesToSubmit[emptyIndex]?.text ?? ''),
      )
      return
    }

    setInputValues(valuesToSubmit)
    checkAnswer(valuesToSubmit)
  }

  const advanceToNext = () => {
    const nextQuizNo = currentQuizIndex + 1
    if (nextQuizNo <= totalQuiz) {
      const nextMeta = getQuizMeta(nextQuizNo)
      setInputValues(makeEmptyInputs(nextQuizNo))
      setCurrentBlankIndex(0)
      setPenaltyState('none')
      setInputLetters('')
      setTryCount(0)
      perBlankHistoryRef.current = nextMeta
        ? nextMeta.correctAnswers.map(() => '')
        : []
      heart.setCurrent(quizAnswerCount)
      isWorking.current = false
      setCurrentQuizIndex(nextQuizNo)
      if (nextMeta?.sound) playAudio(nextMeta.sound)
    } else {
      props.onFinishActivity()
    }
  }

  useEffect(() => {
    onEnterOrTabRef.current = () => {
      if (isRevealingRef.current) {
        clearRevealTimer()
        stopAudio()
        advanceToNext()
        return
      }
      if (isReviewPass) {
        if (isWorking.current) return
        stopAudio()
        advanceToNext()
        return
      }
      if (penaltyState !== 'none') return
      const isLastBlank = currentBlankIndex === inputValues.length - 1
      const hasOtherUncorrected = inputValues.some(
        (v, i) => !v.isCorrected && i !== currentBlankIndex,
      )
      if (isLastBlank || !hasOtherUncorrected) {
        handleSubmit()
      } else {
        handleNextInput()
      }
    }
  })

  const evaluateInputs = (
    values: ClozeTest3InputValue[],
    meta: ClozeTest3QuizMeta,
  ) => {
    const nextInputs: ClozeTest3InputValue[] = []
    const userTokens: string[] = []
    const nextHistory: string[] = []
    let firstWrongIndex = -1

    for (let i = 0; i < meta.correctAnswers.length; i++) {
      const userText = (values[i]?.text ?? '').trimStart().trimEnd()
      const isEqual = meta.correctAnswers[i] === userText
      nextInputs.push({ text: userText, isCorrected: isEqual })
      userTokens.push(userText)

      const prev = perBlankHistoryRef.current[i] ?? ''
      let nextRecord: string
      if (prev.length > 0 && prev.slice(-1) === '1') {
        nextRecord = prev
      } else {
        nextRecord = prev + (isEqual ? '1' : '2')
      }
      nextHistory.push(nextRecord)

      if (!isEqual && firstWrongIndex === -1) firstWrongIndex = i
    }

    return {
      isAllCorrect: nextInputs.every((v) => v.isCorrected),
      nextInputs,
      firstWrongIndex,
      correctJoined: meta.correctAnswers.join('┒'),
      userJoined: userTokens.join('┒'),
      recordJoined: nextHistory.join('/'),
      nextHistory,
    }
  }

  const revealCorrectAnswerAndAdvance = (
    evaluated?: ClozeTest3InputValue[],
  ) => {
    const meta = currentMeta
    if (!meta) {
      advanceToNext()
      return
    }
    const source = evaluated ?? inputValues
    const revealedValues: ClozeTest3InputValue[] = meta.correctAnswers.map(
      (ans, i) => {
        const prev = source[i]
        if (prev?.isCorrected) return { ...prev, isRevealed: false }
        return { text: ans, isCorrected: true, isRevealed: true }
      },
    )
    setInputValues(revealedValues)
    setInputLetters('')
    isWorking.current = true
    isRevealingRef.current = true
    setIsRevealing(true)

    const onRevealFinished = () => {
      clearRevealTimer()
      advanceToNext()
    }
    if (meta.sound) {
      playAudio(meta.sound, onRevealFinished)
    } else {
      revealTimerRef.current = setTimeout(onRevealFinished, REVEAL_FALLBACK_MS)
    }
  }

  const enterPostAnswerFlow = (
    isCorrect: boolean,
    evaluated?: ClozeTest3InputValue[],
  ) => {
    stopAudio()
    if (isCorrect) {
      advanceToNext()
      return
    }
    if (isEnabledPenalty) {
      const meta = currentMeta
      setInputValues(makeEmptyInputs(currentQuizIndex))
      setPenaltyState('penalty')
      setCurrentBlankIndex(0)
      setInputLetters('')
      perBlankHistoryRef.current = meta ? meta.correctAnswers.map(() => '') : []
      isWorking.current = false
    } else {
      revealCorrectAnswerAndAdvance(evaluated)
    }
  }

  const enterRetryFlow = (
    nextInputs: ClozeTest3InputValue[],
    firstWrongIndex: number,
    newTryCount: number,
  ) => {
    const clearedInputs = nextInputs.map((v) =>
      v.isCorrected ? v : { text: '', isCorrected: false },
    )
    setInputValues(clearedInputs)
    setTryCount(newTryCount)
    setCurrentBlankIndex(firstWrongIndex)
    setInputLetters('')
    isWorking.current = false
  }

  const checkAnswer = async (localValues?: ClozeTest3InputValue[]) => {
    if (isWorking.current) return
    const meta = currentMeta
    if (!meta) return
    const {
      isAllCorrect,
      nextInputs,
      firstWrongIndex,
      correctJoined,
      userJoined,
      recordJoined,
      nextHistory,
    } = evaluateInputs(localValues ?? inputValues, meta)

    isWorking.current = true
    stopAudio()

    const newTryCount = tryCount + 1

    const answerData: IScoreBoardData = {
      quizNo: currentQuizIndex,
      maxCount: quizAnswerCount,
      answerCount: newTryCount,
      ox: isAllCorrect,
    }

    const userAnswer = studentAnswer.makeUserPartialAnswerData({
      mobile: '',
      studyId: props.studyId,
      studentHistoryId: props.studentHistoryId,
      bookType: props.bookType,
      step: props.currentStep,
      quizId: meta.quizId,
      quizNo: meta.quizNo,
      currentQuizNo: currentQuizIndex,
      correct: correctJoined,
      selectedAnswer: userJoined,
      partialRecord: recordJoined,
      tryCount: newTryCount,
      maxQuizCount: quizAnswerCount,
      quizLength: totalQuiz,
      isCorrect: isAllCorrect,
      answerData,
      isEnabledPenalty,
      isFinishStudy: props.lastStep === props.currentStep,
    })

    try {
      const res = await saveUserAnswerPartial(studyMode, userAnswer)
      captureFinishStudyInfoFromResult(res)
      if (Number(res.result) !== 0) {
        isWorking.current = false
        return
      }
    } catch {
      isWorking.current = false
      return
    }

    perBlankHistoryRef.current = nextHistory
    studentAnswer.addStudentAnswer(answerData)

    const tempRecord: IRecordAnswerType = {
      QuizId: `${meta.quizId}`,
      QuizNo: meta.quizNo,
      CurrentQuizNo: meta.quizNo,
      OX: isAllCorrect ? '1' : '2',
      TempText: '',
      PenaltyWord: '',
      Correct: correctJoined,
      StudentAnswer: recordJoined,
      AnswerCount: newTryCount,
    }
    props.onUpdateRecord?.(tempRecord)

    if (!isAllCorrect) {
      heart.decrease()
    }

    const proceed = () => {
      if (isAllCorrect || newTryCount >= quizAnswerCount) {
        enterPostAnswerFlow(isAllCorrect, nextInputs)
      } else {
        enterRetryFlow(nextInputs, firstWrongIndex, newTryCount)
      }
    }

    if (quizFeedback) {
      quizFeedback.presentResult(isAllCorrect, proceed)
    } else {
      proceed()
    }
  }

  const finalizePenalty = async () => {
    const meta = currentMeta
    if (!meta) return
    const isLastQuiz = currentQuizIndex + 1 > totalQuiz
    try {
      const res = await deletePenalty(props.mode, {
        mobile: '',
        bookType: props.bookType,
        studyId: props.studyId,
        studentHistoryId: props.studentHistoryId,
        step: String(props.currentStep),
        quizId: meta.quizId,
        isLastQuiz,
        isFinishStudy: isLastQuiz && props.lastStep === props.currentStep,
      })
      captureFinishStudyInfoFromResult(res)
      if (Number(res.result) !== 0) return
    } catch {
      return
    }
    stopAudio()
    advanceToNext()
  }

  useQuizTimerHold({
    enabled: isReady,
    isHeld: penaltyState !== 'none',
    onPauseTimer: props.onPauseTimer,
    onResumeTimer: props.onResumeTimer,
    onResetQuizTimer: props.onResetQuizTimer,
  })

  useQuizTimeoutSignal(props.quizTimeoutSignal, () => {
    if (isReviewPass || penaltyState !== 'none' || isRevealingRef.current)
      return
    if (isWorking.current || !currentMeta) return
    const valuesToSubmit = buildValuesToSubmit(currentMeta)
    setInputValues(valuesToSubmit)
    void checkAnswer(valuesToSubmit)
  })

  const onPlaySoundToggle = () => {
    const sound = currentMeta?.sound
    if (!sound) return
    if (playState === 'playing') {
      pauseAudio()
    } else if (playState === 'paused') {
      resumeAudio()
    } else {
      playAudio(sound)
    }
  }

  const onSeekSound = (deltaSec: number) => {
    if (!currentMeta?.sound) return
    seekBy(deltaSec)
    if (playState === '') {
      resumeAudio()
    }
  }

  const isSoundControlDisabled = penaltyState !== 'none' || !currentMeta?.sound
  const canSeekSound = !isSoundControlDisabled

  return {
    currentMeta,
    sentenceTokens,
    penaltyState,
    inputValues,
    currentBlankIndex,
    inputLetters,
    currentCorrectText,
    isCurrentIncorrect,
    isRevealing,
    handleKeyPress,
    handleNativeValueChange,
    onPlaySoundToggle,
    onSeekSound,
    isSoundControlDisabled,
    canSeekSound,
    playState,
    onClickBlank,
  }
}
