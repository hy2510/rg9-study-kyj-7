import { type RefObject, useLayoutEffect } from 'react'

import { useStudyVisibility } from '@contexts/StudyVisibilityContext'

export function useFocusedInputScroll(
  ref: RefObject<HTMLDivElement>,
  active: boolean,
) {
  const isVisible = useStudyVisibility()

  useLayoutEffect(() => {
    const container = ref.current
    if (!active || !isVisible || !container) return
    const root = document.documentElement
    const body = document.body
    const previousRootOverflow = root.style.overflow
    const previousBodyOverflow = body.style.overflow
    const previousOverscroll = body.style.overscrollBehaviorY
    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.overscrollBehaviorY = 'none'
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const input = document.activeElement
        if (
          !(
            input instanceof HTMLTextAreaElement ||
            input instanceof HTMLInputElement
          ) ||
          !container.contains(input)
        )
          return
        const bounds = container.getBoundingClientRect()
        const field = input.getBoundingClientRect()
        const top = bounds.top + 12
        const bottom = bounds.bottom - 12
        const minimumVisibleHeight = Math.min(48, Math.max(0, bottom - top))
        if (field.height > bottom - top) {
          if (field.bottom < top + minimumVisibleHeight) {
            container.scrollTop += field.bottom - top - minimumVisibleHeight
          } else if (field.top > bottom - minimumVisibleHeight) {
            container.scrollTop += field.top - bottom + minimumVisibleHeight
          }
        } else if (field.top < top) {
          container.scrollTop += field.top - top
        } else if (field.bottom > bottom) {
          container.scrollTop += field.bottom - bottom
        }
      })
    }
    const onPointerDown = (event: PointerEvent) => {
      const input = event.target
      if (
        !event.isPrimary ||
        event.button !== 0 ||
        !(
          input instanceof HTMLTextAreaElement ||
          input instanceof HTMLInputElement
        ) ||
        input.disabled ||
        document.activeElement === input
      )
        return
      event.preventDefault()
      input.focus({ preventScroll: true })
      update()
    }
    const observer = new ResizeObserver(update)
    observer.observe(container)
    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('focusin', update)
    window.visualViewport?.addEventListener('resize', update)
    update()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('focusin', update)
      window.visualViewport?.removeEventListener('resize', update)
      root.style.overflow = previousRootOverflow
      body.style.overflow = previousBodyOverflow
      body.style.overscrollBehaviorY = previousOverscroll
    }
  }, [ref, active, isVisible])
}
