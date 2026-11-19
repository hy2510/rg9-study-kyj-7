import { useEffect, useState } from 'react'

import ProgressBar from '@components/molecules/common/ProgressBar'
import { HeaderProps } from '@interfaces/common/header/HeaderProps'
import type { HeaderSpeakProps } from '@interfaces/common/header/HeaderSpeakProps'
import type { HeaderStoryProps } from '@interfaces/common/header/HeaderStoryProps'
import { HeaderStudyProps } from '@interfaces/common/header/HeaderStudyProps'

import HeaderSideMenu from './header/HeaderSideMenu'
import HeaderTopBar from './header/HeaderTopBar'

function exitStudyApp() {
  try {
    ;(window as Window & { onExitStudy?: () => void }).onExitStudy?.()
  } catch {
    window.location.href = '/'
  }
}

export type { HeaderProps } from '@interfaces/common/header/HeaderProps'
export type { HeaderVariant } from '@interfaces/common/header/HeaderVariant'

export default function Header(props: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const showStoryStudyToggle = false

  const progress =
    props.variant === 'story' || props.variant === 'speak'
      ? (props.progress ?? 1)
      : props.progress
  const total =
    props.variant === 'story' || props.variant === 'speak'
      ? (props.total ?? 1)
      : props.total

  const storyProps =
    props.variant === 'story' ? (props as HeaderStoryProps) : null
  const studyProps =
    props.variant === 'study' ? (props as HeaderStudyProps) : null
  const speakProps =
    props.variant === 'speak' ? (props as HeaderSpeakProps) : null

  const remixStudyProps = studyProps?.engine === 'remix' ? studyProps : null

  const bookTitle = props.bookTitle?.trim() || props.bookCode
  const keywordList = (props.keywords ?? '')
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean)

  const navigateBetweenStoryAndStudy = () => {
    setMenuOpen(false)
    props.changeCurrentView(
      props.variant === 'story' || props.variant === 'speak'
        ? 'Study'
        : 'Story',
    )
  }

  useEffect(() => {
    if (props.variant === 'speak') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.repeat || e.defaultPrevented) return
      setMenuOpen((open) => !open)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [props.variant])

  useEffect(() => {
    if (props.closeMenuSignal) setMenuOpen(false)
  }, [props.closeMenuSignal])

  return (
    <>
      <HeaderTopBar
        variant={props.variant}
        onToggleMenu={props.hideMenu ? undefined : () => setMenuOpen((o) => !o)}
        quizStatus={{
          showStudyStatus:
            props.variant === 'study' && !!studyProps?.shouldShowCenterInfo,
          isReviewMode:
            !!remixStudyProps && remixStudyProps.quizInfo.mode === 'Review',
          reviewCurrent: remixStudyProps?.reviewCurrent,
          reviewTotal: remixStudyProps?.reviewTotal,
          timeText: studyProps
            ? studyProps.formatTime(
                studyProps.time.timeMin,
                studyProps.time.timeSec,
              )
            : '',
          currentHeart: studyProps?.currentHeart ?? 0,
          showProgressText: props.variant === 'speak',
          progress,
          total,
          statusLabel: studyProps?.statusLabel,
        }}
        segmentToggle={{
          show: showStoryStudyToggle,
          onSelect: (target) => {
            const reading =
              props.variant === 'story' || props.variant === 'speak'
            if (target === 'quiz' && reading) navigateBetweenStoryAndStudy()
            if (target === 'story' && props.variant === 'study') {
              navigateBetweenStoryAndStudy()
            }
          },
        }}
      />

      {props.variant !== 'speak' && !props.hideMenu && (
        <HeaderSideMenu
          menuOpen={menuOpen}
          closeMenu={() => setMenuOpen(false)}
          bookTitle={bookTitle}
          bookCode={props.bookCode}
          variant={props.variant}
          showStoryStudyToggle={showStoryStudyToggle}
          keywordList={keywordList}
          storyProps={storyProps}
          studyProps={studyProps}
          speakProps={speakProps}
          onNavigateStoryStudy={navigateBetweenStoryAndStudy}
          onExitStudy={exitStudyApp}
        />
      )}

      <ProgressBar progress={progress} total={total} />
    </>
  )
}
