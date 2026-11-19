import { useEffect, useState } from 'react'

function isImageAlreadyCached(url: string): boolean {
  if (!url) return true
  const img = new Image()
  img.src = url
  return img.complete && img.naturalWidth > 0
}

export function useStoryPageBackgroundReady(imageSrc: string): boolean {
  const [ready, setReady] = useState(() => isImageAlreadyCached(imageSrc.trim()))

  useEffect(() => {
    const trimmed = imageSrc.trim()
    if (!trimmed) {
      setReady(true)
      return undefined
    }

    const img = new Image()
    img.src = trimmed
    if (img.complete && img.naturalWidth > 0) {
      setReady(true)
      return undefined
    }

    setReady(false)
    let cancelled = false
    const done = () => {
      if (!cancelled) setReady(true)
    }
    img.onload = done
    img.onerror = done

    return () => {
      cancelled = true
      img.onload = null
      img.onerror = null
    }
  }, [imageSrc])

  return ready
}
