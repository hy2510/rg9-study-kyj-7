import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import {
  getStoredStoryPlaybackRate,
  getStoryAutoNextFromStorage,
  saveStoryReadModePartial,
  setStoryAutoNextInStorage,
} from '@src/constants/story/storyReadModeStorage'
import {
  PageProps,
  PageSequenceProps,
  PlayState,
} from '@src/interfaces/story/IStory'

type UseStoryAudioPCProps = {
  studyId: string
  studentHistoryId: string
  pageData: PageProps[]
  changeReadingComplete: () => Promise<void>
  audioMuted: boolean
  disableSpreadAutoAdvance?: boolean
  autoplayOnFirstLoad?: boolean
  onLastPageEnded?: () => void
  initialPageNumber?: number
}

export default function useStoryAudioPC({
  pageData,
  changeReadingComplete,
  audioMuted,
  disableSpreadAutoAdvance = false,
  autoplayOnFirstLoad = true,
  onLastPageEnded,
  initialPageNumber = 1,
}: UseStoryAudioPCProps) {
  const playerRef = useRef<HTMLAudioElement>(new Audio())
  const player = playerRef.current

  const [playState, setPlayState] = useState<PlayState>('')
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(() =>
    getStoredStoryPlaybackRate(),
  )
  const [pageNumber, setPageNumber] = useState(initialPageNumber)
  const [pageSeq, setPageSeq] = useState<PageSequenceProps>({
    playPage: initialPageNumber,
    sequence: 0,
  })

  const pageSeqRef = useRef(pageSeq)
  const pageNumberRef = useRef(pageNumber)
  const playbackRateRef = useRef(playbackRate)
  const playStateRef = useRef<PlayState>(playState)
  const isFirstRef = useRef(true)
  const shouldAutoPlayOnNextLoadRef = useRef(false)
  const suppressAutoPlayOnceRef = useRef(false)
  const isStoppedRef = useRef(false)
  const initialAutoNext = disableSpreadAutoAdvance
    ? false
    : getStoryAutoNextFromStorage()
  const [isAutoNext, setIsAutoNext] = useState(initialAutoNext)
  const isAutoNextRef = useRef(initialAutoNext)
  const audioMutedRef = useRef(audioMuted)
  const disableSpreadAutoAdvanceRef = useRef(disableSpreadAutoAdvance)
  const autoplayOnFirstLoadRef = useRef(autoplayOnFirstLoad)
  const onLastPageEndedRef = useRef(onLastPageEnded)

  useEffect(() => {
    onLastPageEndedRef.current = onLastPageEnded
  }, [onLastPageEnded])

  useEffect(() => {
    disableSpreadAutoAdvanceRef.current = disableSpreadAutoAdvance
  }, [disableSpreadAutoAdvance])

  useEffect(() => {
    autoplayOnFirstLoadRef.current = autoplayOnFirstLoad
  }, [autoplayOnFirstLoad])

  useEffect(() => {
    audioMutedRef.current = audioMuted
    player.volume = audioMuted ? 0 : 1
  }, [audioMuted])

  useEffect(() => {
    pageSeqRef.current = pageSeq
  }, [pageSeq])
  useEffect(() => {
    pageNumberRef.current = pageNumber
  }, [pageNumber])
  useEffect(() => {
    playStateRef.current = playState
  }, [playState])
  useEffect(() => {
    playbackRateRef.current = playbackRate
    player.playbackRate = playbackRate
  }, [playbackRate])

  const loadAudio = (page: number, seq: number) => {
    const sentences = pageData.filter(
      (data) => data.Page === page && data.SoundPath !== '',
    )

    if (sentences.length === 0) {
      player.src = ''
      return
    }

    player.src = sentences[0].SoundPath
    player.playbackRate = playbackRateRef.current
    player.volume = audioMutedRef.current ? 0 : 1

    if (seq > 0 && sentences[seq - 1]) {
      player.currentTime = sentences[seq - 1].StartTime / 1000
    }
  }

  useEffect(() => {
    const hasSound = pageData.some(
      (data) => data.Page === pageNumber && data.SoundPath,
    )
    const nextPlayPage = hasSound ? pageNumber : pageNumber + 1
    setPageSeq((prev) => {
      if (prev.playPage === nextPlayPage && prev.sequence === 0) return prev
      return { playPage: nextPlayPage, sequence: 0 }
    })
  }, [pageNumber])

  useLayoutEffect(() => {
    setCurrentTime(0)
    if (isStoppedRef.current) return
    loadAudio(pageSeq.playPage, pageSeq.sequence)
  }, [pageSeq])

  useEffect(() => {
    const handleCanPlayThrough = () => {
      if (isFirstRef.current) {
        isFirstRef.current = false
        if (autoplayOnFirstLoadRef.current) {
          void player.play().then(
            () => setPlayState('play'),
            () => setPlayState('pause'),
          )
        } else {
          player.pause()
          setPlayState('pause')
        }
      } else {
        if (shouldAutoPlayOnNextLoadRef.current) {
          shouldAutoPlayOnNextLoadRef.current = false
          suppressAutoPlayOnceRef.current = false
          player.play()
          setPlayState('play')
          return
        }
        if (suppressAutoPlayOnceRef.current) {
          suppressAutoPlayOnceRef.current = false
          player.pause()
          return
        }
        if (playStateRef.current === 'pause') {
          player.pause()
          return
        }
        player.play()
        setPlayState('play')
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(player.currentTime)
    }

    const handleEnded = () => {
      const { playPage } = pageSeqRef.current
      const currentPageNumber = pageNumberRef.current

      if (playPage % 2 === 1) {
        setPageSeq({ playPage: playPage + 1, sequence: 0 })
      } else {
        if (disableSpreadAutoAdvanceRef.current) {
          setPlayState('')
          return
        }

        const nextPageNumber = currentPageNumber + 2
        const hasNextPage = pageData.some(
          (data) => data.Page === nextPageNumber,
        )

        if (!hasNextPage) {
          setPlayState('')
          if (onLastPageEndedRef.current) {
            onLastPageEndedRef.current()
          } else {
            changeReadingComplete()
          }
          return
        }

        if (!isAutoNextRef.current) {
          setPlayState('')
          return
        }

        setPageNumber(nextPageNumber)
      }
    }

    player.addEventListener('canplaythrough', handleCanPlayThrough)
    player.addEventListener('timeupdate', handleTimeUpdate)
    player.addEventListener('ended', handleEnded)

    return () => {
      player.removeEventListener('canplaythrough', handleCanPlayThrough)
      player.removeEventListener('timeupdate', handleTimeUpdate)
      player.removeEventListener('ended', handleEnded)
      player.pause()
      player.src = ''
    }
  }, [])

  const play = () => {
    if (isStoppedRef.current) {
      changeDuration(pageSeq.playPage, pageSeq.sequence)
      return
    }
    player.play()
    setPlayState('play')
  }

  const pause = () => {
    player.pause()
    setPlayState('pause')
  }

  const stop = () => {
    suppressAutoPlayOnceRef.current = true
    isStoppedRef.current = true
    player.pause()
    player.src = ''
    player.currentTime = 0
    setPlayState('')
  }

  const changePageNumber = useCallback((page: number) => {
    if (page === 1) setPlayState('')
    isStoppedRef.current = false
    shouldAutoPlayOnNextLoadRef.current = true
    setPageNumber(page)
  }, [])

  const changeDuration = useCallback((page: number, seq: number) => {
    isStoppedRef.current = false
    shouldAutoPlayOnNextLoadRef.current = true
    setPageSeq({ playPage: page, sequence: seq })
  }, [])

  const changePlaySpeed = (speed: number) => {
    setPlaybackRate(speed)
    saveStoryReadModePartial({ playbackRate: speed })
  }

  const changeVolume = (volume: number) => {
    player.muted = volume === 0
    player.volume = volume
  }

  const changeAutoNextPage = (next: boolean) => {
    if (disableSpreadAutoAdvanceRef.current) return
    isAutoNextRef.current = next
    setIsAutoNext(next)
    setStoryAutoNextInStorage(next)
  }

  return {
    pageNumber,
    playState,
    pageSeq,
    currentTime,
    isAutoNext,
    playbackRate,
    play,
    pause,
    stop,
    changePageNumber,
    changeDuration,
    changePlaySpeed,
    changeVolume,
    changeAutoNextPage,
  }
}
