import { useContext, useRef } from 'react'

import { useTranslation } from 'react-i18next'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import TextBox from '@components/atoms/common/TextBox'
import { KeyboardWrap } from '@components/atoms/study/activities/cloze-test-02/KeyboardWrap'
import { SentenceBlank } from '@components/atoms/study/activities/cloze-test-02/SentenceBlank'
import { SentenceBlankFilled } from '@components/atoms/study/activities/cloze-test-02/SentenceBlankFilled'
import { SentenceBlankRevealed } from '@components/atoms/study/activities/cloze-test-02/SentenceBlankRevealed'
import { SentenceBlankSaved } from '@components/atoms/study/activities/cloze-test-02/SentenceBlankSaved'
import { SentencePanel } from '@components/atoms/study/activities/cloze-test-02/SentencePanel'
import { QuestionSoundWrapper } from '@components/atoms/study/audio/QuestionSoundWrapper'
import { SoundPlayToggleIcon } from '@components/atoms/study/audio/SoundPlayToggleIcon'
import { ReviewBadge } from '@components/atoms/study/badges/ReviewBadge'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import {
  ClozeTest2InlineCharSlot,
  ClozeTest2InlineSpellingSlots,
} from '@components/molecules/study/activities/cloze-test-02/ClozeTest2InlineSlots'
import { ClozeTest2SentenceText } from '@components/molecules/study/activities/cloze-test-02/ClozeTest2SentenceText'
import MobileVocabularyInput from '@components/organisms/study/common/MobileVocabularyInput'
import SpellingKeyboard from '@components/organisms/study/common/SpellingKeyboard'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { useClozeTest2Quiz } from '@hooks/study/legacy/useClozeTest2Quiz'
import { useClozeTest2View } from '@hooks/study/legacy/useClozeTest2View'
import { useMobileViewport } from '@hooks/useMobileViewport'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import { IClozeTest2 } from '@src/interfaces/study/IClozeTest'
import {
  CLOZE_TYPE_SPACE,
  getClozeInputChars,
} from '@src/utils/study/legacy/clozeTestUtils'
import { isObserverMode, isReviewPassMode } from '@src/utils/study/reviewMode'
import {
  getDisplayChar,
  isFixedChar,
  isSpellingInputCharIncorrect,
} from '@utils/spellingUtils'

export default function ClozeTest2(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const isMobileViewport = useMobileViewport()
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const isReviewPass =
    isObserverMode(studyInfo) || isReviewPassMode(studyInfo, bookInfo)
  const quizFeedback = useQuizFeedbackOptional()
  const heart = useHeartContext()

  const quizData = props.quizData as IClozeTest2 | undefined
  const recordedData = props.recordedData ?? []

  const {
    isReady,
    totalQuiz,
    quizAnswerCount,
    isEnabledPenalty,
    initial,
    getQuizMeta,
    makeEmptyInputs,
  } = useClozeTest2View({
    quizData,
    recordedData,
    studyMode: studyInfo.mode,
  })

  const {
    currentMeta,
    sentenceTokens,
    playState,
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
    onClickBlank,
  } = useClozeTest2Quiz({
    props,
    isReady,
    totalQuiz,
    quizAnswerCount,
    isEnabledPenalty,
    initial,
    getQuizMeta,
    makeEmptyInputs,
    recordedData,
    studyMode: studyInfo.mode,
    isReviewPass,
    heart,
    quizFeedback,
  })

  const selectBlank = (index: number) => {
    onClickBlank(index)
    if (isMobileViewport) mobileInputRef.current?.focus({ preventScroll: true })
  }

  if (!isReady || !currentMeta) return <CenteredLoading />

  const renderBlankSlot = (blankIndex: number) => {
    const val = inputValues[blankIndex]
    if (!val) return null

    if (val.isCorrected) {
      if (val.isRevealed) {
        return (
          <SentenceBlankRevealed key={`revealed-${blankIndex}`}>
            {val.text}
          </SentenceBlankRevealed>
        )
      }
      return (
        <SentenceBlankFilled key={`filled-${blankIndex}`}>
          {val.text}
        </SentenceBlankFilled>
      )
    }

    const isActive = currentBlankIndex === blankIndex

    if (isActive) {
      const correctText = currentMeta.correctAnswers[blankIndex] ?? ''
      const isPenaltyAllPlaceholder =
        penaltyState === 'penalty' && inputLetters === ''

      const charSlots = Array.from({ length: correctText.length }).map(
        (_, i) => {
          const answerChar = correctText[i]
          const letterIndex = getClozeInputChars(correctText.slice(0, i)).length
          const inputChar = inputLetters[letterIndex] ?? ''
          const isFixed = isFixedChar(answerChar, CLOZE_TYPE_SPACE)
          const isPenaltyPlaceholder =
            penaltyState === 'penalty' && !isFixed && inputChar === ''
          const isCharIncorrect =
            penaltyState === 'penalty' &&
            !isPenaltyPlaceholder &&
            isSpellingInputCharIncorrect(
              answerChar,
              inputChar,
              CLOZE_TYPE_SPACE,
            )
          const displayChar = isPenaltyPlaceholder
            ? answerChar
            : getDisplayChar(answerChar, inputChar, CLOZE_TYPE_SPACE)
          return {
            i,
            isFixed,
            isPenaltyPlaceholder,
            isCharIncorrect,
            displayChar,
          }
        },
      )

      const isSlotIncorrect =
        penaltyState === 'penalty'
          ? charSlots.some((slot) => slot.isCharIncorrect)
          : isCurrentIncorrect

      return (
        <ClozeTest2InlineSpellingSlots
          key={`active-${blankIndex}`}
          $isIncorrect={isSlotIncorrect}
          $isPlaceholder={isPenaltyAllPlaceholder}
          onClick={
            isMobileViewport
              ? () => mobileInputRef.current?.focus({ preventScroll: true })
              : undefined
          }
        >
          {charSlots.map(
            ({
              i,
              isFixed,
              isPenaltyPlaceholder,
              isCharIncorrect,
              displayChar,
            }) => (
              <ClozeTest2InlineCharSlot
                key={i}
                $isFixed={isFixed}
                $isIncorrect={
                  penaltyState === 'penalty'
                    ? isCharIncorrect
                    : isCurrentIncorrect
                }
                $isPlaceholder={isPenaltyPlaceholder}
              >
                {displayChar}
              </ClozeTest2InlineCharSlot>
            ),
          )}
        </ClozeTest2InlineSpellingSlots>
      )
    }

    if (val.text) {
      return (
        <SentenceBlankSaved
          key={`saved-${blankIndex}`}
          onClick={() => selectBlank(blankIndex)}
        >
          {val.text}
        </SentenceBlankSaved>
      )
    }

    const blankLen = Math.max(
      (currentMeta.correctAnswers[blankIndex] ?? '').length,
      3,
    )
    return (
      <SentenceBlank
        key={`blank-${blankIndex}`}
        onClick={() => selectBlank(blankIndex)}
      >
        {'_'.repeat(blankLen)}
      </SentenceBlank>
    )
  }

  return (
    <>
      <QuestionSoundWrapper>
        <SoundPlayToggleIcon
          isPlaying={playState === 'playing'}
          disabled={penaltyState !== 'none' || isRevealing}
          onClick={onPlaySoundToggle}
        />
      </QuestionSoundWrapper>

      <QuizBody $fillToMaxHeightOnTablet>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.CLOZE_TEST2)}</QuizComment>

        {penaltyState !== 'none' && <ReviewBadge>· Test Review</ReviewBadge>}

        <SentencePanel
          style={isMobileViewport ? { position: 'relative' } : undefined}
        >
          {isMobileViewport && (
            <span
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                width: 1,
                height: 1,
              }}
            >
              <MobileVocabularyInput
                inputRef={mobileInputRef}
                word={currentCorrectText}
                value={inputLetters}
                typeSpace={CLOZE_TYPE_SPACE}
                onValueChange={handleNativeValueChange}
                onEnter={() => handleKeyPress('enter')}
              />
            </span>
          )}
          <TextBox fontSize={1.2} fontWeight={600} color='primary'>
            <ClozeTest2SentenceText>
              {sentenceTokens.map((tok) => {
                if (!tok.word.includes('┒')) {
                  return (
                    <span
                      key={`w-${tok.key}`}
                      dangerouslySetInnerHTML={{ __html: tok.word + ' ' }}
                    />
                  )
                }
                const parts = tok.word.split('┒')
                return (
                  <span key={`bw-${tok.key}`}>
                    {parts[0]}
                    {renderBlankSlot(tok.index)}
                    {parts[1]}{' '}
                  </span>
                )
              })}
            </ClozeTest2SentenceText>
          </TextBox>
        </SentencePanel>

        {!isMobileViewport && (
          <KeyboardWrap>
            <SpellingKeyboard
              correctWord={currentCorrectText}
              wrongKeyCount={0}
              fullKeyboardOnly
              showEnterButton
              showSpaceKey
              isEnterEnabled={isRevealing || inputLetters.length > 0}
              onKeyPress={handleKeyPress}
            />
          </KeyboardWrap>
        )}
      </QuizBody>
    </>
  )
}
