import { useEffect, useState } from 'react'

export const DESKTOP_STORY_CHROME_MEDIA =
  '(hover: hover) and (pointer: fine) and (min-width: 1024px)'

export function useDesktopStoryChrome(): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(DESKTOP_STORY_CHROME_MEDIA).matches
      : true,
  )

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_STORY_CHROME_MEDIA)
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return isDesktop
}
