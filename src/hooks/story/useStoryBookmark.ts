import { useEffect, useRef } from 'react'

import { saveBookMark } from '@services/storyApi'

const BOOKMARK_SAVE_DELAY_MS = 700

type UseStoryBookmarkProps = {
  enabled: boolean
  studyId: string
  studentHistoryId: string
  pageNumber: number
}

export default function useStoryBookmark({
  enabled,
  studyId,
  studentHistoryId,
  pageNumber,
}: UseStoryBookmarkProps) {
  const savedPageRef = useRef(pageNumber)
  const pendingPageRef = useRef<number | null>(null)
  const idsRef = useRef({ studyId, studentHistoryId })

  useEffect(() => {
    idsRef.current = { studyId, studentHistoryId }
  }, [studyId, studentHistoryId])

  useEffect(() => {
    if (!enabled) return
    if (pageNumber === savedPageRef.current) {
      pendingPageRef.current = null
      return
    }

    pendingPageRef.current = pageNumber
    const timer = window.setTimeout(() => {
      pendingPageRef.current = null
      savedPageRef.current = pageNumber
      void saveBookMark(
        idsRef.current.studyId,
        idsRef.current.studentHistoryId,
        pageNumber,
      )
    }, BOOKMARK_SAVE_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [enabled, pageNumber])

  useEffect(
    () => () => {
      const pendingPage = pendingPageRef.current
      if (pendingPage === null) return
      void saveBookMark(
        idsRef.current.studyId,
        idsRef.current.studentHistoryId,
        pendingPage,
      )
    },
    [],
  )
}
