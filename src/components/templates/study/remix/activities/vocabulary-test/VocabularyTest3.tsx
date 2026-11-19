import { useEffect, useMemo, useRef, useState } from 'react'

import shuffle from 'lodash/shuffle'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-components'

import { IconSoundStop } from '@components/atoms/common/icons/IconSoundStop'
import { IconSpeaker } from '@components/atoms/common/icons/IconSpeaker'
import TextBox from '@components/atoms/common/TextBox'
import { MatchingCardBox } from '@components/atoms/study/cards/MatchingCardBox'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { LANGUAGE_MAP } from '@src/constants/common/language'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'

const REF = (window as any).REF
const lang = REF?.language || 'ko'

type VocabularyMatchingProps = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz[]
  onComplete: (isCorrect: boolean) => void
}

type MatchPair = {
  koreanId: string
  englishId: string
}

function VocabularyMatchingLeftCardContent({
  displayType,
  text,
  isPlaying,
  textColor,
}: {
  displayType: keyof typeof LANGUAGE_MAP | 'Sound'
  text: string
  isPlaying: boolean
  textColor: string
}) {
  if (displayType === 'Sound') {
    return (
      <LeftCardSoundContent>
        <SoundIconWrapper aria-hidden>
          {isPlaying ? (
            <IconSoundStop width={32} height={32} />
          ) : (
            <IconSpeaker width={32} height={32} />
          )}
        </SoundIconWrapper>
      </LeftCardSoundContent>
    )
  }
  return (
    <TextBox fontSize={1.5} fontWeight={600} color={textColor}>
      {text}
    </TextBox>
  )
}

export default function VocabularyMatching({
  augmentOptions,
  quizData,
  onComplete,
}: VocabularyMatchingProps) {
  const { t } = useTranslation()
  const quizFeedback = useQuizFeedbackOptional()
  const [selectedKoreanId, setSelectedKoreanId] = useState<string | null>(null)
  const [matchedPairs, setMatchedPairs] = useState<MatchPair[]>([])
  const [incorrectEnglishId, setIncorrectEnglishId] = useState<string | null>(
    null,
  )
  const [incorrectKoreanId, setIncorrectKoreanId] = useState<string | null>(
    null,
  )
  const [isCheckingMatch, setIsCheckingMatch] = useState<boolean>(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingQuizId, setPlayingQuizId] = useState<string | null>(null)
  const [grayedMatchedIds, setGrayedMatchedIds] = useState<Set<string>>(
    () => new Set(),
  )
  const prevMatchedCountRef = useRef(0)

  const leftCardDisplayType = useMemo<
    keyof typeof LANGUAGE_MAP | 'Sound'
  >(() => {
    return Math.random() < 0.5 ? LANGUAGE_MAP[lang] : 'Sound'
  }, [])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  const handlePlaySound = (soundUrl: string, quizId: string) => {
    if (playingQuizId === quizId) {
      audioRef.current?.pause()
      audioRef.current = null
      setPlayingQuizId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    if (soundUrl) {
      const audio = new Audio(soundUrl)
      audioRef.current = audio
      audio.addEventListener('ended', () => {
        audioRef.current = null
        setPlayingQuizId(null)
      })
      audio.play().catch((err) => {
        console.error('Audio play failed:', err)
        setPlayingQuizId(null)
      })
      setPlayingQuizId(quizId)
    }
  }

  useEffect(() => {
    if (matchedPairs.length > prevMatchedCountRef.current) {
      const lastPair = matchedPairs[matchedPairs.length - 1]
      const timer = setTimeout(() => {
        setGrayedMatchedIds(
          (prev) => new Set([...prev, lastPair.koreanId, lastPair.englishId]),
        )
      }, 1000)
      prevMatchedCountRef.current = matchedPairs.length
      return () => clearTimeout(timer)
    }
    if (matchedPairs.length < prevMatchedCountRef.current) {
      prevMatchedCountRef.current = matchedPairs.length
      setGrayedMatchedIds(new Set())
    }
  }, [matchedPairs])

  const leftCards = useMemo(() => {
    return shuffle([...quizData])
  }, [quizData])

  const rightCards = useMemo(() => {
    return shuffle([...quizData])
  }, [quizData])

  const availableKoreanCards = useMemo(() => {
    const matchedKoreanIds = new Set(matchedPairs.map((p) => p.koreanId))
    return leftCards.filter((card) => !matchedKoreanIds.has(card.QuizId))
  }, [leftCards, matchedPairs])

  const availableEnglishCards = useMemo(() => {
    const matchedEnglishIds = new Set(matchedPairs.map((p) => p.englishId))
    return rightCards.filter((card) => !matchedEnglishIds.has(card.QuizId))
  }, [rightCards, matchedPairs])

  const handleKoreanClick = (quizId: string) => {
    if (isCheckingMatch) return

    if (matchedPairs.some((p) => p.koreanId === quizId)) return

    if (selectedKoreanId === quizId) {
      setSelectedKoreanId(null)
      return
    }

    setSelectedKoreanId(quizId)
    setIncorrectEnglishId(null)
    setIncorrectKoreanId(null)
  }

  const handleEnglishClick = (englishQuizId: string) => {
    if (isCheckingMatch) return

    if (matchedPairs.some((p) => p.englishId === englishQuizId)) return

    if (!selectedKoreanId) return

    setIsCheckingMatch(true)

    const selectedKoreanCard = leftCards.find(
      (card) => card.QuizId === selectedKoreanId,
    )
    const clickedEnglishCard = rightCards.find(
      (card) => card.QuizId === englishQuizId,
    )

    if (
      selectedKoreanCard &&
      clickedEnglishCard &&
      selectedKoreanCard.QuizNo === clickedEnglishCard.QuizNo
    ) {
      setMatchedPairs([
        ...matchedPairs,
        {
          koreanId: selectedKoreanId,
          englishId: englishQuizId,
        },
      ])
      setSelectedKoreanId(null)
      setIncorrectEnglishId(null)
      setIncorrectKoreanId(null)

      if (matchedPairs.length + 1 === quizData.length) {
        setIsCheckingMatch(false)
        onComplete(true)
      } else if (quizFeedback) {
        quizFeedback.presentResult(true, () => setIsCheckingMatch(false))
      } else {
        setIsCheckingMatch(false)
      }
    } else {
      setIncorrectEnglishId(englishQuizId)
      setIncorrectKoreanId(selectedKoreanId)
      setSelectedKoreanId(null)
      const clearWrong = () => {
        setIncorrectEnglishId(null)
        setIncorrectKoreanId(null)
        setIsCheckingMatch(false)
      }
      if (quizFeedback) {
        quizFeedback.presentResult(false, clearWrong)
      } else {
        clearWrong()
      }
    }
  }

  const getQuestion = (
    quizId: string,
    type: keyof typeof LANGUAGE_MAP | 'Sound' | 'Text',
  ): string => {
    const quiz = quizData.find((q) => q.QuizId === quizId)
    return (quiz?.Question as Record<string, string>)?.[type as string] ?? ''
  }

  const isMatched = (quizId: string, type: 'korean' | 'english'): boolean => {
    if (type === 'korean') {
      return matchedPairs.some((p) => p.koreanId === quizId)
    } else {
      return matchedPairs.some((p) => p.englishId === quizId)
    }
  }

  const handleLeftMatchingCardClick = (quizId: string) => {
    handleKoreanClick(quizId)
    if (leftCardDisplayType === 'Sound') {
      handlePlaySound(getQuestion(quizId, 'Sound'), quizId)
    }
  }

  return (
    <QuizBody>
      <QuizComment>{t(ACTIVITY_INSTRUCTIONS.MATCHING_CARDS)}</QuizComment>
      <VocabularyMatchingContainer>
        {leftCards.map((leftCard, index) => {
          const rightCard = rightCards[index]
          if (!rightCard) return null

          const isSelected = selectedKoreanId === leftCard.QuizId
          const leftMatched = isMatched(leftCard.QuizId, 'korean')
          const leftIncorrect = incorrectKoreanId === leftCard.QuizId
          const leftAvailable = availableKoreanCards.some(
            (c) => c.QuizId === leftCard.QuizId,
          )
          const leftGrayed =
            leftMatched && grayedMatchedIds.has(leftCard.QuizId)
          const leftTextColor = leftMatched
            ? leftGrayed
              ? '#A2B1C4'
              : '#199261'
            : 'primary'

          const rightMatched = isMatched(rightCard.QuizId, 'english')
          const rightIncorrect = incorrectEnglishId === rightCard.QuizId
          const rightAvailable = availableEnglishCards.some(
            (c) => c.QuizId === rightCard.QuizId,
          )
          const rightGrayed =
            rightMatched && grayedMatchedIds.has(rightCard.QuizId)
          const rightTextColor = rightMatched
            ? rightGrayed
              ? '#A2B1C4'
              : '#199261'
            : 'primary'

          return (
            <MatchingCardPairRow
              key={`${leftCard.QuizId}-${rightCard.QuizId}-${index}`}
            >
              <MatchingCardBox
                onClick={() => handleLeftMatchingCardClick(leftCard.QuizId)}
                isSelected={isSelected}
                isMatched={leftMatched}
                isGrayed={leftGrayed}
                isIncorrect={leftIncorrect}
                isDisabled={!leftAvailable}
              >
                <VocabularyMatchingLeftCardContent
                  displayType={leftCardDisplayType}
                  text={getQuestion(leftCard.QuizId, leftCardDisplayType)}
                  isPlaying={playingQuizId === leftCard.QuizId}
                  textColor={leftTextColor}
                />
              </MatchingCardBox>
              <MatchingCardBox
                onClick={() => handleEnglishClick(rightCard.QuizId)}
                isMatched={rightMatched}
                isGrayed={rightGrayed}
                isIncorrect={rightIncorrect}
                isDisabled={!rightAvailable}
              >
                <TextBox fontSize={1.5} fontWeight={600} color={rightTextColor}>
                  {leftCardDisplayType === 'Sound' ? (
                    <>{getQuestion(rightCard.QuizId, LANGUAGE_MAP[lang])}</>
                  ) : (
                    <>{getQuestion(rightCard.QuizId, 'Text')}</>
                  )}
                </TextBox>
              </MatchingCardBox>
            </MatchingCardPairRow>
          )
        })}
      </VocabularyMatchingContainer>
    </QuizBody>
  )
}

const LeftCardSoundContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const SoundIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
`

const VocabularyMatchingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
`

const MatchingCardPairRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: stretch;
  min-width: 0;
`
