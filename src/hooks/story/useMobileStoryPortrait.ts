import { useEffect, useState } from 'react'

import { DESKTOP_STORY_CHROME_MEDIA } from '@hooks/story/useDesktopStoryChrome'

export function useMobileStoryPortrait(): boolean {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const mqDesk = window.matchMedia(DESKTOP_STORY_CHROME_MEDIA)
    const sync = () => {
      const portrait = window.innerHeight > window.innerWidth
      setActive(portrait && !mqDesk.matches)
    }
    sync()
    mqDesk.addEventListener('change', sync)
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    return () => {
      mqDesk.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
    }
  }, [])

  return active
}
