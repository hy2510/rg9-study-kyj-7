import { AugmentContext } from '@hooks/study/remix/useAugmentManager'

export const commonCheckAugmentByCategory = (
  context: AugmentContext,
  category: string,
) => {
  return context.selectedAugments.some((a) => a.category === category)
}

export const commonCheckAugmentByCategoryExcept = (
  context: AugmentContext,
  category: string,
  exceptIds: string[],
) => {
  const exceptSet = new Set(exceptIds)
  return context.selectedAugments.some(
    (a) => a.category === category && !exceptSet.has(a.id),
  )
}

export const commonCheckAugmentByCategoryAndTier = (
  context: AugmentContext,
  category: string,
  tier: string,
) => {
  return context.selectedAugments.some(
    (a) => a.category === category && a.tier === tier,
  )
}

export const commonCheckIsFirstStage = (context: AugmentContext) => {
  return context.studyMode === 'Act1' && context.stage === 0
}

export const commonCheckIsLastStage = (context: AugmentContext) => {
  return (
    context.studyMode === 'Act2' && context.totalStage === context.stage + 1
  )
}

export const commonCheckIsBeforeLastStage = (context: AugmentContext) => {
  return (
    context.studyMode === 'Act2' && context.totalStage === context.stage + 2
  )
}

export const commonCheckIsTimeExceeded = (
  context: AugmentContext,
  time: number,
) => {
  return context.initialTime - context.currentTime >= time
}

export const commonCheckIsCurrentTimeLow = (
  context: AugmentContext,
  time: number,
) => {
  return context.currentTime <= time
}
