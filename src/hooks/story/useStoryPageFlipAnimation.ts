import { useLayoutEffect, useRef, useState } from 'react'

type UseStoryPageFlipAnimationArgs = {
  pageNumber: number
  spreadHalf: 0 | 1
  singlePagePortrait: boolean
}

type FlipState = {
  seq: number
  dir: 'next' | 'prev'
}

export default function useStoryPageFlipAnimation({
  pageNumber,
  spreadHalf,
  singlePagePortrait,
}: UseStoryPageFlipAnimationArgs) {
  const [flip, setFlip] = useState<FlipState>({ seq: 0, dir: 'next' })
  const [hasFlipAnimation, setHasFlipAnimation] = useState(false)

  const prevFlipAnchorRef = useRef<{
    pageNumber: number
    spreadHalf: 0 | 1
  } | null>(null)
  const suppressNextPortraitHalfFlipRef = useRef(false)
  const suppressPortraitHalfFlipGenRef = useRef(0)

  useLayoutEffect(() => {
    if (prevFlipAnchorRef.current === null) {
      prevFlipAnchorRef.current = { pageNumber, spreadHalf }
      return
    }

    const prev = prevFlipAnchorRef.current
    let dir: 'next' | 'prev' | null = null

    if (pageNumber !== prev.pageNumber) {
      dir = pageNumber > prev.pageNumber ? 'next' : 'prev'
      if (singlePagePortrait) {
        suppressNextPortraitHalfFlipRef.current = true
        const gen = ++suppressPortraitHalfFlipGenRef.current
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (suppressPortraitHalfFlipGenRef.current === gen) {
              suppressNextPortraitHalfFlipRef.current = false
            }
          })
        })
      }
      prevFlipAnchorRef.current = { pageNumber, spreadHalf }
    } else if (singlePagePortrait && spreadHalf !== prev.spreadHalf) {
      if (suppressNextPortraitHalfFlipRef.current) {
        suppressNextPortraitHalfFlipRef.current = false
        prevFlipAnchorRef.current = { pageNumber, spreadHalf }
        return
      }
      dir = spreadHalf > prev.spreadHalf ? 'next' : 'prev'
      prevFlipAnchorRef.current = { pageNumber, spreadHalf }
    } else {
      prevFlipAnchorRef.current = { pageNumber, spreadHalf }
    }

    if (dir === null) return
    const animDir = dir

    setHasFlipAnimation(true)
    setFlip((f) => ({ seq: f.seq + 1, dir: animDir }))
  }, [pageNumber, singlePagePortrait, spreadHalf])

  return { flip, hasFlipAnimation }
}
