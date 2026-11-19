import { useEffect, useState } from 'react'

type PreloadStatus = 'idle' | 'loading' | 'done'

type ImageSize = { width: number; height: number }

export default function useImagePreload(urls: string[]) {
  const [status, setStatus] = useState<PreloadStatus>('idle')
  const [sizeMap, setSizeMap] = useState<Map<string, ImageSize>>(new Map())

  useEffect(() => {
    if (!urls.length) return

    setStatus('loading')

    const promises = urls.map(
      (url) =>
        new Promise<{ url: string; size: ImageSize }>((resolve) => {
          const img = new Image()
          img.src = url
          img
            .decode()
            .then(() =>
              resolve({
                url,
                size: { width: img.naturalWidth, height: img.naturalHeight },
              }),
            )
            .catch(() => resolve({ url, size: { width: 0, height: 0 } }))
        }),
    )

    Promise.all(promises).then((results) => {
      const map = new Map<string, ImageSize>()
      results.forEach(({ url, size }) => map.set(url, size))
      setSizeMap(map)
      setStatus('done')
    })
  }, [urls.join(',')])

  return {
    isLoading: status === 'loading',
    isDone: status === 'done',
    sizeMap,
  }
}
