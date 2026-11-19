import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import Header from '@components/organisms/common/Header'
import SpeakPracticePopup from '@components/organisms/speak/SpeakPracticePopup'
import SpeakScoreModal from '@components/organisms/speak/SpeakScoreModal'
import SpeakBook from '@components/templates/speak/SpeakBook'
import {
  StoryBodyWrapper,
  StoryViewWrapper,
} from '@components/templates/story/StoryLayout'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useStoryPageBackgroundReady } from '@hooks/story/useStoryPageBackgroundReady'
import { ViewType } from '@interfaces/common/ViewType'
import {
  getSpeakData,
  loadSpeakRecordData,
  saveSpeakResult,
  uploadSpeakFile,
} from '@services/speakApi'
import useSpeakAudio from '@src/hooks/speak/useSpeakAudio'
import {
  LocalSpeakRecord,
  SpeakPageProps,
} from '@src/interfaces/study/speak/ISpeak'
import { buildSpeakRecord } from '@src/utils/speak/buildSpeakRecord'
import { computeNextSpeakQuizIndex } from '@src/utils/speak/computeNextSpeakQuizIndex'
import { isLastSpeakQuiz } from '@src/utils/speak/isLastSpeakQuiz'
import { resolveInitialSpeakQuizIndex } from '@src/utils/speak/resolveInitialSpeakQuizIndex'
import { toLocalSpeakRecord } from '@src/utils/speak/speakRecord'

type SpeakContainerProps = {
  changeCurrentView: (view: ViewType) => void
  onExitSpeak: () => void
}

export default function SpeakContainer({
  changeCurrentView,
  onExitSpeak,
}: SpeakContainerProps) {
  const { t } = useTranslation()
  const { bookInfo, studyInfo } = useContext(AppContext) as AppContextProps
  const [speakData, setSpeakData] = useState<SpeakPageProps[]>()
  const [quizIndex, setQuizIndex] = useState(0)
  const [speakPracticeOpen, setSpeakPracticeOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [recordedData, setRecordedData] = useState<LocalSpeakRecord[]>([])
  const [scoreModalOpen, setScoreModalOpen] = useState(false)
  const isSavingInFlightRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    const fetchAll = async () => {
      const params = {
        mode: studyInfo.mode,
        studyId: studyInfo.studyId,
        studentHistoryId: studyInfo.studentHistoryId,
      }

      const [speakResult, recordResult] = await Promise.allSettled([
        getSpeakData(params),
        loadSpeakRecordData(params),
      ])

      if (cancelled) return

      const data = speakResult.status === 'fulfilled' ? speakResult.value : []
      const recorded =
        recordResult.status === 'fulfilled' && Array.isArray(recordResult.value)
          ? recordResult.value
          : []

      setSpeakData(data)
      setRecordedData(recorded.map(toLocalSpeakRecord))
      if (data.length > 0) {
        setQuizIndex(resolveInitialSpeakQuizIndex(data, recorded))
      }
    }

    void fetchAll()

    return () => {
      cancelled = true
    }
  }, [])

  const speakPageTotal = useMemo(() => {
    if (!speakData?.length) return 1
    const uniquePages = [...new Set(speakData.map((p) => p.Page))]
    return Math.max(1, Math.max(...uniquePages))
  }, [speakData])

  const soundPath = speakData?.[quizIndex]?.SoundPath ?? ''
  const currentImageSrc = speakData?.[quizIndex]?.ImagePath ?? ''
  const isImageReady = useStoryPageBackgroundReady(currentImageSrc)

  const {
    isPlaying,
    isAudioReady,
    audioDuration,
    playbackProgress,
    play: onPlaySentence,
    reset: resetAudio,
    suspend: suspendAudio,
  } = useSpeakAudio({
    soundPath,
    onEnded: () => setSpeakPracticeOpen(true),
  })

  const autoPlayedRef = useRef(false)
  const onPlaySentenceRef = useRef(onPlaySentence)
  useEffect(() => {
    onPlaySentenceRef.current = onPlaySentence
  })

  useEffect(() => {
    autoPlayedRef.current = false
  }, [quizIndex])

  useEffect(() => {
    if (isAudioReady && isImageReady && !autoPlayedRef.current) {
      autoPlayedRef.current = true
      onPlaySentenceRef.current()
    }
  }, [isAudioReady, isImageReady])

  useEffect(() => {
    setSpeakPracticeOpen(false)
  }, [quizIndex])

  if (!speakData) return <>Loading...</>

  const advanceQuizIndex = (index: number) => {
    setQuizIndex(computeNextSpeakQuizIndex(speakData, index))
  }

  const upsertRecord = (record: LocalSpeakRecord) => {
    setRecordedData((prev) => {
      const idx = prev.findIndex(
        (r) => r.Page === record.Page && r.Sequence === record.Sequence,
      )
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = record
        return next
      }
      return [...prev, record]
    })
  }

  const buildRecord = (
    item: SpeakPageProps,
    scoreOverall: number,
    matchedWordIndexes?: number[],
    isSkipped: boolean = false,
  ): LocalSpeakRecord =>
    buildSpeakRecord(item, scoreOverall, matchedWordIndexes, isSkipped)

  const handleSkip = async () => {
    if (isSavingInFlightRef.current) return
    isSavingInFlightRef.current = true
    setIsSaving(true)
    try {
      const totalWordCount =
        speakData[quizIndex]?.Sentence?.trim().split(/\s+/).filter(Boolean)
          .length ?? 0
      const isLastQuiz = isLastSpeakQuiz(speakData, quizIndex)

      const res = await saveSpeakResult(studyInfo.mode, {
        studyId: studyInfo.studyId,
        studentHistoryId: studyInfo.studentHistoryId,
        challengeNumber: speakData[quizIndex].ChallengeNumber,
        page: speakData[quizIndex].Page,
        sequence: speakData[quizIndex].Sequence,
        quizNo: speakData[quizIndex].QuizNo,
        sentence: speakData[quizIndex].Sentence,
        scoreOverall: 0,
        wordsJson: JSON.stringify({
          transcript: '',
          matchedWordIndexes: [],
          matchedCount: 0,
          totalCount: totalWordCount,
          isSkipped: true,
        }),
        isLastQuiz,
      })

      if (Number(res.result) !== 0) {
        alert('API Load Failed 2')
        return
      }

      upsertRecord(buildRecord(speakData[quizIndex], 0, [], true))
      if (isLastQuiz) {
        setSpeakPracticeOpen(false)
        setScoreModalOpen(true)
      } else {
        advanceQuizIndex(quizIndex + 1)
      }
    } catch (e) {
      alert('API Load Failed 2')
    } finally {
      setIsSaving(false)
      isSavingInFlightRef.current = false
    }
  }

  const handleNext = async (data: {
    matchedWordCount: number
    totalWordCount: number
    recognizedText: string
    matchedWordIndexes: number[]
    userRecordingBlob?: Blob
  }) => {
    if (isSavingInFlightRef.current) return
    isSavingInFlightRef.current = true
    setIsSaving(true)
    try {
      const scoreOverall =
        data.totalWordCount > 0
          ? (data.matchedWordCount / data.totalWordCount) * 100
          : 0

      const isLastQuiz = isLastSpeakQuiz(speakData, quizIndex)

      const res = await saveSpeakResult(studyInfo.mode, {
        studyId: studyInfo.studyId,
        studentHistoryId: studyInfo.studentHistoryId,
        challengeNumber: speakData[quizIndex].ChallengeNumber,
        page: speakData[quizIndex].Page,
        sequence: speakData[quizIndex].Sequence,
        quizNo: speakData[quizIndex].QuizNo,
        sentence: speakData[quizIndex].Sentence,
        scoreOverall,
        wordsJson: JSON.stringify({
          transcript: data.recognizedText,
          matchedWordIndexes: data.matchedWordIndexes,
          matchedCount: data.matchedWordCount,
          totalCount: data.totalWordCount,
        }),
        isLastQuiz,
      })

      if (Number(res.result) !== 0) {
        alert('API Load Failed 2')
        return
      }

      if (data.userRecordingBlob) {
        uploadSpeakFile(
          studyInfo.mode,
          data.userRecordingBlob,
          studyInfo.studyId,
          studyInfo.studentHistoryId,
          speakData[quizIndex].QuizNo,
        )
      }

      upsertRecord(
        buildRecord(
          speakData[quizIndex],
          scoreOverall,
          data.matchedWordIndexes,
        ),
      )
      if (isLastQuiz) {
        setSpeakPracticeOpen(false)
        setScoreModalOpen(true)
      } else {
        advanceQuizIndex(quizIndex + 1)
      }
    } catch (e) {
      alert('API Load Failed 2')
    } finally {
      setIsSaving(false)
      isSavingInFlightRef.current = false
    }
  }

  const currentPage = speakData[quizIndex]?.Page ?? 1

  const replaySentenceFromBook = () => {
    setSpeakPracticeOpen(false)
    resetAudio()
    onPlaySentence()
  }

  const confirmExitSpeak = () => {
    if (!window.confirm(t('study.speakExitConfirm'))) return
    resetAudio()
    onExitSpeak()
  }

  return (
    <StoryViewWrapper>
      <Header
        variant='speak'
        bookCode={bookInfo?.BookCode ?? ''}
        bookTitle={bookInfo?.Title}
        keywords={bookInfo?.Keywords}
        changeCurrentView={changeCurrentView}
        progress={currentPage}
        total={speakPageTotal}
        onBackToStory={onExitSpeak}
        onOpenSpeakPractice={() => setSpeakPracticeOpen(true)}
      />
      <StoryBodyWrapper>
        <SpeakBook
          speakData={speakData}
          quizIndex={quizIndex}
          bookLevel={bookInfo?.BookLevel?.substring(0, 1) ?? 'K'}
          isEbAnotherSizeYn={studyInfo.isEbAnotherSizeYn}
          onSentenceClick={onPlaySentence}
        />
        {speakPracticeOpen && (
          <SpeakPracticePopup
            speakData={speakData}
            quizIndex={quizIndex}
            onClose={confirmExitSpeak}
            isPlaying={isPlaying}
            audioDuration={audioDuration}
            originalPlaybackProgress={playbackProgress}
            onPlaySentence={onPlaySentence}
            onReplaySentenceFromBook={replaySentenceFromBook}
            onBeforeRecord={suspendAudio}
            isSaving={isSaving}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        )}
        {scoreModalOpen && (
          <SpeakScoreModal
            records={recordedData}
            onClose={() => {
              resetAudio()
              setScoreModalOpen(false)
              onExitSpeak()
            }}
          />
        )}
      </StoryBodyWrapper>
    </StoryViewWrapper>
  )
}
