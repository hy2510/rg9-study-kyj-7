import { memo, useMemo, useRef } from 'react'

const STORY_SWIPE_MIN_PX = 44
const STORY_SWIPE_DOMINANCE = 1.05

type SentenceProps = {
  pageNumber: number
  sentence: string
  sequence: number
  marginTop: number
  marginLeft: number
  clickSentence: (page: number, sequence: number) => void
  highlightColor?: string
}

function SentenceComponent({
  pageNumber,
  sentence,
  sequence,
  marginTop,
  marginLeft,
  clickSentence,
  highlightColor,
}: SentenceProps) {
  const touchStartRef = useRef<{
    x: number
    y: number
    id: number
  } | null>(null)

  const convertedHtml = useMemo(() => {
    const clickable = sequence !== 999
    const styleStr = `margin-top: ${marginTop}px; margin-left: ${marginLeft}px;${
      clickable ? ' cursor:pointer;' : ''
    }`
    return sentence.replace(
      /id="t/g,
      `style='${styleStr}' id="t_${pageNumber}_`,
    )
  }, [sentence, marginTop, marginLeft, pageNumber, sequence])

  const onClickHandler = () => {
    if (sequence !== 999) clickSentence(pageNumber, sequence)
  }

  const onTouchStartHandler = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY, id: t.identifier }
  }

  const onTouchCancelHandler = () => {
    touchStartRef.current = null
  }

  const onTouchEndHandler = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start || e.changedTouches.length === 0) return

    const t = Array.from(e.changedTouches).find(
      (c) => c.identifier === start.id,
    )
    if (!t) return

    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    const isBookSwipe =
      absDx >= STORY_SWIPE_MIN_PX && absDx > absDy * STORY_SWIPE_DOMINANCE

    if (isBookSwipe) {
      return
    }

    if (sequence !== 999) {
      e.preventDefault()
      onClickHandler()
    }
  }

  return (
    <div
      style={
        {
          '--sentence-highlight': highlightColor ?? 'transparent',
        } as React.CSSProperties
      }
      dangerouslySetInnerHTML={{ __html: convertedHtml }}
      onClick={onClickHandler}
      onTouchStart={onTouchStartHandler}
      onTouchCancel={onTouchCancelHandler}
      onTouchEnd={onTouchEndHandler}
    />
  )
}

const Sentence = memo(SentenceComponent)
export default Sentence
