import { type RefObject, useLayoutEffect, useState } from 'react'

import { styled } from 'styled-components'

import StoryPage from '@components/organisms/story/StoryPage'
import { STORY_PAGE_REF_HEIGHT_PX } from '@src/constants/story/storyLayout'
import { PageProps, PageSequenceProps } from '@src/interfaces/story/IStory'

export type StoryBodyProps = {
  measureRef: RefObject<HTMLDivElement | null>
  bookLevel: string
  leftPage: PageProps
  rightPage: PageProps
  singlePage?: PageProps | null
  storyData: PageProps[]
  pageSeq: PageSequenceProps
  currentTime: number
  isTextShow: boolean
  isHighlight: boolean
  clickSentence: (page: number, sequence: number) => void
}

function getPageDesignWidthPx(bookLevel: string) {
  return bookLevel.toUpperCase() === 'K' ? 480 : 525
}

export default function StoryBody({
  measureRef,
  bookLevel,
  leftPage,
  rightPage,
  singlePage = null,
  storyData,
  pageSeq,
  currentTime,
  isTextShow,
  isHighlight,
  clickSentence,
}: StoryBodyProps) {
  const [scale, setScale] = useState(1)

  const pageDesignWidth = getPageDesignWidthPx(bookLevel)
  const spreadWidthPx = singlePage ? pageDesignWidth : pageDesignWidth * 2
  const refHeight = STORY_PAGE_REF_HEIGHT_PX

  useLayoutEffect(() => {
    const calcScale = () => {
      const el = measureRef.current
      if (!el) return
      const w = el.clientWidth
      const h = el.clientHeight
      if (w <= 0 || h <= 0 || spreadWidthPx <= 0) return
      const scaleH = h / refHeight
      const scaleW = w / spreadWidthPx
      setScale(Math.min(scaleH, scaleW))
    }

    calcScale()
    const raf = requestAnimationFrame(calcScale)
    const observer = new ResizeObserver(calcScale)
    if (measureRef.current) observer.observe(measureRef.current)
    window.addEventListener('resize', calcScale)
    window.addEventListener('orientationchange', calcScale)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', calcScale)
      window.removeEventListener('orientationchange', calcScale)
    }
  }, [measureRef, spreadWidthPx, refHeight])

  const scaledWidth = spreadWidthPx * scale
  const scaledHeight = refHeight * scale

  if (singlePage) {
    return (
      <EbookBodyPc $scaledWidth={scaledWidth} $scaledHeight={scaledHeight}>
        <EbookPagesScaled
          $scale={scale}
          $naturalWidth={spreadWidthPx}
          $naturalHeight={refHeight}
        >
          <StoryPage
            pageNumber={singlePage.Page}
            imageSrc={singlePage.ImagePath}
            pageDesignWidth={pageDesignWidth}
            storyData={storyData}
            isTextShow={isTextShow}
            pageSeq={pageSeq}
            currentTime={currentTime}
            isHighlight={isHighlight}
            clickSentence={clickSentence}
          />
        </EbookPagesScaled>
      </EbookBodyPc>
    )
  }

  return (
    <EbookBodyPc $scaledWidth={scaledWidth} $scaledHeight={scaledHeight}>
      <EbookPagesScaled
        $scale={scale}
        $naturalWidth={spreadWidthPx}
        $naturalHeight={refHeight}
      >
        <StoryPage
          pageNumber={leftPage.Page}
          imageSrc={leftPage.ImagePath}
          pageDesignWidth={pageDesignWidth}
          storyData={storyData}
          isTextShow={isTextShow}
          pageSeq={pageSeq}
          currentTime={currentTime}
          isHighlight={isHighlight}
          clickSentence={clickSentence}
        />
        <StoryPage
          pageNumber={rightPage.Page}
          imageSrc={rightPage.ImagePath}
          pageDesignWidth={pageDesignWidth}
          storyData={storyData}
          isTextShow={isTextShow}
          pageSeq={pageSeq}
          currentTime={currentTime}
          isHighlight={isHighlight}
          clickSentence={clickSentence}
        />
      </EbookPagesScaled>
    </EbookBodyPc>
  )
}

const EbookBodyPc = styled.div<{
  $scaledWidth: number
  $scaledHeight: number
}>`
  margin: auto;
  flex-shrink: 0;
  width: ${({ $scaledWidth }) => $scaledWidth}px;
  height: ${({ $scaledHeight }) => $scaledHeight}px;
  overflow: hidden;
  z-index: 3;
`

const EbookPagesScaled = styled.div<{
  $scale: number
  $naturalWidth: number
  $naturalHeight: number
}>`
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  align-items: flex-start;
  justify-content: flex-start;
  width: ${({ $naturalWidth }) => $naturalWidth}px;
  height: ${({ $naturalHeight }) => $naturalHeight}px;
  transform: scale(${({ $scale }) => $scale});
  transform-origin: top left;
`
