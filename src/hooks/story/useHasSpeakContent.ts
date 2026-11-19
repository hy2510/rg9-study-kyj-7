import { useEffect, useState } from 'react'

import { getSpeakData } from '@services/speakApi'
import type { IStudyInfo } from '@src/interfaces/study/IStudyInfo'

export default function useHasSpeakContent(
  studyInfo: IStudyInfo | undefined,
): boolean {
  const [hasSpeakContent, setHasSpeakContent] = useState(false)

  useEffect(() => {
    if (!studyInfo?.studyId || !studyInfo?.studentHistoryId) {
      setHasSpeakContent(false)
      return undefined
    }
    if (!studyInfo.isAvailableSpeaking) {
      setHasSpeakContent(false)
      return undefined
    }

    let cancelled = false

    const checkSpeakContent = async () => {
      try {
        const data = await getSpeakData({
          mode: studyInfo.mode,
          studyId: studyInfo.studyId,
          studentHistoryId: studyInfo.studentHistoryId,
        })

        if (!cancelled) setHasSpeakContent(data.length > 0)
      } catch {
        if (!cancelled) setHasSpeakContent(false)
      }
    }

    void checkSpeakContent()

    return () => {
      cancelled = true
    }
  }, [
    studyInfo?.mode,
    studyInfo?.studyId,
    studyInfo?.studentHistoryId,
    studyInfo?.isAvailableSpeaking,
  ])

  return hasSpeakContent
}
