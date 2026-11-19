export const SAFE_AREA_SIDES = ['top', 'right', 'bottom', 'left'] as const

export type SafeAreaSide = (typeof SAFE_AREA_SIDES)[number]

export const safeAreaVarName = (side: SafeAreaSide) =>
  `--safe-area-inset-${side}` as const

const safeAreaInset = (side: SafeAreaSide) =>
  `var(${safeAreaVarName(side)}, env(safe-area-inset-${side}, 0px))` as const

export const SAFE_AREA_TOP = safeAreaInset('top')
export const SAFE_AREA_RIGHT = safeAreaInset('right')
export const SAFE_AREA_BOTTOM = safeAreaInset('bottom')
export const SAFE_AREA_LEFT = safeAreaInset('left')
