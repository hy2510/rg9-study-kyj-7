import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

type StoryPageEntry = { Page: number; SoundPath?: string }

type UseStorySpreadHalfSyncArgs = {
  isSpeakMode: boolean
  singlePagePortrait: boolean
  pageNumber: number
  leftPage: { Page: number } | undefined
  rightPage: { Page: number } | undefined
  pageSeqPlayPage: number
  changeDuration: (page: number, time: number) => void
  storyData: StoryPageEntry[]
  initialSpreadHalf?: 0 | 1
}

export default function useStorySpreadHalfSync({
  isSpeakMode,
  singlePagePortrait,
  pageNumber,
  leftPage,
  rightPage,
  pageSeqPlayPage,
  changeDuration,
  storyData,
  initialSpreadHalf = 0,
}: UseStorySpreadHalfSyncArgs) {
  const [spreadHalf, setSpreadHalf] = useState<0 | 1>(0)
  const pendingInitialRightHalfRef = useRef(initialSpreadHalf === 1)
  const initialPageNumberRef = useRef(pageNumber)

  const portraitAfterPrevRef = useRef(false)
  const portraitPrevSpreadNeedRightPlayRef = useRef(false)
  const prevSinglePagePortraitRef = useRef(singlePagePortrait)

  const prevSpreadSyncPortraitRef = useRef(false)
  const prevSpreadSyncPageRef = useRef(pageNumber)
  const prevLayoutPlayPageRef = useRef(pageSeqPlayPage)

  const markPortraitAfterPrev = useCallback(() => {
    portraitAfterPrevRef.current = true
  }, [])

  const markRightPlayNeededAfterPrev = useCallback(() => {
    portraitPrevSpreadNeedRightPlayRef.current = true
  }, [])

  useEffect(() => {
    if (isSpeakMode) return
    const wasPortrait = prevSinglePagePortraitRef.current
    prevSinglePagePortraitRef.current = singlePagePortrait

    if (singlePagePortrait) {
      return
    }

    if (wasPortrait && !singlePagePortrait) {
      const leftP = leftPage?.Page
      const rightP = rightPage?.Page
      const pp = pageSeqPlayPage
      if (pp === leftP || (rightP != null && pp === rightP)) {
        return
      }
      const anchor = pageNumber
      const hasSoundLeft = storyData.some(
        (data) => data.Page === anchor && data.SoundPath,
      )
      changeDuration(hasSoundLeft ? anchor : anchor + 1, 0)
    }
  }, [
    changeDuration,
    isSpeakMode,
    leftPage?.Page,
    pageNumber,
    pageSeqPlayPage,
    rightPage?.Page,
    singlePagePortrait,
    storyData,
  ])

  useLayoutEffect(() => {
    if (isSpeakMode) return

    const playPageChanged = pageSeqPlayPage !== prevLayoutPlayPageRef.current

    let halfForAudio: 0 | 1 = spreadHalf

    if (
      pendingInitialRightHalfRef.current &&
      pageNumber !== initialPageNumberRef.current
    ) {
      pendingInitialRightHalfRef.current = false
    }

    try {
      if (portraitAfterPrevRef.current) {
        portraitAfterPrevRef.current = false
        halfForAudio = 1
        setSpreadHalf(1)
        prevSpreadSyncPortraitRef.current = singlePagePortrait
        prevSpreadSyncPageRef.current = pageNumber
      } else {
        const portraitEntered =
          singlePagePortrait && !prevSpreadSyncPortraitRef.current
        const spreadChangedWhilePortrait =
          singlePagePortrait && pageNumber !== prevSpreadSyncPageRef.current

        prevSpreadSyncPortraitRef.current = singlePagePortrait
        prevSpreadSyncPageRef.current = pageNumber

        if (!singlePagePortrait) {
          setSpreadHalf(0)
          return
        }
        if (!leftPage) {
          setSpreadHalf(0)
          return
        }

        if (portraitEntered || spreadChangedWhilePortrait) {
          const rightP = rightPage?.Page
          const pp = pageSeqPlayPage
          const want: 0 | 1 =
            rightP != null &&
            (pendingInitialRightHalfRef.current || pp === rightP)
              ? 1
              : 0
          pendingInitialRightHalfRef.current = false
          halfForAudio = want
          setSpreadHalf(want)
        } else if (
          singlePagePortrait &&
          leftPage &&
          rightPage &&
          playPageChanged
        ) {
          const lp = leftPage.Page
          const rp = rightPage.Page
          if (pageSeqPlayPage === rp && spreadHalf === 0) {
            halfForAudio = 1
            setSpreadHalf(1)
          } else if (
            pageSeqPlayPage === lp &&
            spreadHalf === 1 &&
            !portraitPrevSpreadNeedRightPlayRef.current
          ) {
            halfForAudio = 0
            setSpreadHalf(0)
          }
        }
      }

      if (singlePagePortrait && leftPage) {
        const visibleP =
          halfForAudio === 0 ? leftPage.Page : (rightPage ?? leftPage).Page
        if (pageSeqPlayPage !== visibleP) {
          changeDuration(visibleP, 0)
        }
      }
    } finally {
      prevLayoutPlayPageRef.current = pageSeqPlayPage
    }
  }, [
    changeDuration,
    isSpeakMode,
    leftPage,
    pageNumber,
    pageSeqPlayPage,
    rightPage,
    singlePagePortrait,
    spreadHalf,
  ])

  useEffect(() => {
    if (!portraitPrevSpreadNeedRightPlayRef.current) return
    if (!singlePagePortrait || !rightPage) {
      portraitPrevSpreadNeedRightPlayRef.current = false
      return
    }
    const rp = rightPage.Page
    if (pageSeqPlayPage !== rp) {
      changeDuration(rp, 0)
    }
    portraitPrevSpreadNeedRightPlayRef.current = false
  }, [
    changeDuration,
    pageNumber,
    pageSeqPlayPage,
    rightPage,
    singlePagePortrait,
  ])

  return {
    spreadHalf,
    setSpreadHalf,
    markPortraitAfterPrev,
    markRightPlayNeededAfterPrev,
  }
}
