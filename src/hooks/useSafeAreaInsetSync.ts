import { useEffect } from 'react'

import {
  SAFE_AREA_SIDES,
  type SafeAreaSide,
  safeAreaVarName,
} from '@styles/tokens/safeArea'

const RESYNC_DELAYS_MS = [100, 350, 700] as const

type Orientation = 'portrait' | 'landscape'
type Insets = Record<SafeAreaSide, number>

const createZeroInsets = (): Insets => ({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
})

function createProbe() {
  const probe = document.createElement('div')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 0',
    'height: 0',
    'visibility: hidden',
    'pointer-events: none',
    'padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
  ].join(';')
  document.body.appendChild(probe)
  return probe
}

function readInsets(probe: HTMLElement): Insets {
  const computed = window.getComputedStyle(probe)
  const read = (side: SafeAreaSide) =>
    Number.parseFloat(computed.getPropertyValue(`padding-${side}`)) || 0
  return {
    top: read('top'),
    right: read('right'),
    bottom: read('bottom'),
    left: read('left'),
  }
}

export function useSafeAreaInsetSync() {
  useEffect(() => {
    const root = document.documentElement
    const probe = createProbe()
    const orientationQuery = window.matchMedia('(orientation: portrait)')
    const timers = new Set<number>()
    const settled: Record<Orientation, Insets> = {
      portrait: createZeroInsets(),
      landscape: createZeroInsets(),
    }

    const sync = (commit: boolean) => {
      const orientation: Orientation = orientationQuery.matches
        ? 'portrait'
        : 'landscape'
      const measured = readInsets(probe)
      const cached = settled[orientation]
      SAFE_AREA_SIDES.forEach((side) => {
        if (commit) cached[side] = Math.max(cached[side], measured[side])
        const value = Math.max(measured[side], cached[side])
        root.style.setProperty(safeAreaVarName(side), `${value}px`)
      })
    }

    const clearTimers = () => {
      timers.forEach((id) => window.clearTimeout(id))
      timers.clear()
    }

    const scheduleResync = (resetScroll: boolean) => {
      clearTimers()
      sync(false)
      RESYNC_DELAYS_MS.forEach((delay, index) => {
        const id = window.setTimeout(() => {
          timers.delete(id)
          sync(index === RESYNC_DELAYS_MS.length - 1)
          if (resetScroll) window.scrollTo(0, 0)
        }, delay)
        timers.add(id)
      })
    }

    const onResize = () => scheduleResync(false)
    const onOrientationChange = () => scheduleResync(true)

    sync(true)
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    orientationQuery.addEventListener('change', onOrientationChange)

    return () => {
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
      orientationQuery.removeEventListener('change', onOrientationChange)
      clearTimers()
      probe.remove()
      SAFE_AREA_SIDES.forEach((side) =>
        root.style.removeProperty(safeAreaVarName(side)),
      )
    }
  }, [])
}
