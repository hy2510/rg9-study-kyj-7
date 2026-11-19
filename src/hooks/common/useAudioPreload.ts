import { useEffect, useRef } from 'react'

export default function useAudioPreload(urls: string[]) {
  const cacheRef = useRef<Map<string, HTMLAudioElement>>(new Map())

  useEffect(() => {
    if (!urls.length) return

    const cache = cacheRef.current
    urls.forEach((url) => {
      if (!url || cache.has(url)) return
      const audio = new Audio()
      audio.preload = 'auto'
      audio.src = url
      try {
        audio.load()
      } catch {
      }
      cache.set(url, audio)
    })
  }, [urls.join(',')])
}
