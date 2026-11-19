import { useEffect, useRef } from 'react'

import { PageSequenceProps, PlayState } from '@src/interfaces/story/IStory'
import { getProgressPageForParent } from '@utils/story/storyPCHelpers'

type UseStoryParentCallbacksArgs = {
  onRegisterPause?: (pause: () => void) => void
  pause: () => void

  onRegisterStop?: (stop: () => void) => void
  stop: () => void

  isVisible: boolean
  isMovieShow: boolean

  playState: PlayState
  pageSeq: PageSequenceProps
  changeDuration: (page: number, seq: number) => void

  onPageNumberChange?: (page: number) => void
  uniquePages: { Page: number }[]
  pageNumber: number
  singlePagePortrait: boolean
  spreadHalf: 0 | 1

  onAutoNextChange?: (autoNext: boolean) => void
  isAutoNext: boolean
  onRegisterChangeAutoNextPage?: (toggle: (next: boolean) => void) => void
  changeAutoNextPage: (next: boolean) => void

  onPlaybackRateChange?: (rate: number) => void
  playbackRate: number
  onRegisterChangePlaybackRate?: (changeSpeed: (rate: number) => void) => void
  changePlaySpeed: (rate: number) => void
}

export default function useStoryParentCallbacks({
  onRegisterPause,
  pause,
  onRegisterStop,
  stop,
  isVisible,
  isMovieShow,
  playState,
  pageSeq,
  changeDuration,
  onPageNumberChange,
  uniquePages,
  pageNumber,
  singlePagePortrait,
  spreadHalf,
  onAutoNextChange,
  isAutoNext,
  onRegisterChangeAutoNextPage,
  changeAutoNextPage,
  onPlaybackRateChange,
  playbackRate,
  onRegisterChangePlaybackRate,
  changePlaySpeed,
}: UseStoryParentCallbacksArgs) {
  const playStateRef = useRef(playState)
  useEffect(() => {
    playStateRef.current = playState
  }, [playState])
  const pageSeqRef = useRef(pageSeq)
  useEffect(() => {
    pageSeqRef.current = pageSeq
  }, [pageSeq])

  const wasPlayingBeforeHideRef = useRef(false)
  const prevVisibleRef = useRef(isVisible)

  useEffect(() => {
    const wasVisible = prevVisibleRef.current
    prevVisibleRef.current = isVisible

    if (wasVisible && !isVisible) {
      wasPlayingBeforeHideRef.current = playStateRef.current === 'play'
      stop()
      return
    }

    if (!wasVisible && isVisible && wasPlayingBeforeHideRef.current) {
      wasPlayingBeforeHideRef.current = false
      const { playPage, sequence } = pageSeqRef.current
      changeDuration(playPage, sequence)
    }
  }, [isVisible])

  useEffect(() => {
    if (isVisible && isMovieShow) pause()
  }, [isVisible, isMovieShow])

  useEffect(() => {
    onRegisterPause?.(pause)
  }, [onRegisterPause])

  useEffect(() => {
    onRegisterStop?.(stop)
  }, [onRegisterStop])

  const onPageNumberChangeRef = useRef(onPageNumberChange)
  useEffect(() => {
    onPageNumberChangeRef.current = onPageNumberChange
  }, [onPageNumberChange])

  useEffect(() => {
    onPageNumberChangeRef.current?.(
      getProgressPageForParent(
        uniquePages,
        pageNumber,
        singlePagePortrait,
        spreadHalf,
      ),
    )
  }, [pageNumber, spreadHalf, singlePagePortrait, uniquePages])

  const onAutoNextChangeRef = useRef(onAutoNextChange)
  useEffect(() => {
    onAutoNextChangeRef.current = onAutoNextChange
  }, [onAutoNextChange])

  useEffect(() => {
    onAutoNextChangeRef.current?.(isAutoNext)
  }, [isAutoNext])

  useEffect(() => {
    onRegisterChangeAutoNextPage?.(changeAutoNextPage)
  }, [onRegisterChangeAutoNextPage, changeAutoNextPage])

  const onPlaybackRateChangeRef = useRef(onPlaybackRateChange)
  useEffect(() => {
    onPlaybackRateChangeRef.current = onPlaybackRateChange
  }, [onPlaybackRateChange])

  useEffect(() => {
    onPlaybackRateChangeRef.current?.(playbackRate)
  }, [playbackRate])

  useEffect(() => {
    onRegisterChangePlaybackRate?.(changePlaySpeed)
  }, [onRegisterChangePlaybackRate, changePlaySpeed])
}
