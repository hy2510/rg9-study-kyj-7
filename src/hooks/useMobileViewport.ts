import { useEffect, useState } from 'react'

import { BREAKPOINT_MOBILE_MAX } from '@styles/tokens/breakpoints'

const MOBILE_VIEWPORT_QUERY = `(max-width: ${BREAKPOINT_MOBILE_MAX}px)`

export function useMobileViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    )
      return undefined

    const mediaQuery = window.matchMedia(MOBILE_VIEWPORT_QUERY)
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches)
    syncViewport()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncViewport)
      return () => mediaQuery.removeEventListener('change', syncViewport)
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(syncViewport)
      return () => mediaQuery.removeListener(syncViewport)
    }

    return undefined
  }, [])

  return isMobileViewport
}
