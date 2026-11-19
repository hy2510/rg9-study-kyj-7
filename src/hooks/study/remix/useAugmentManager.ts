import { useMemo, useState } from 'react'

import { AugmentData } from '@assets/data/augment'
import {
  baseTierWeights,
  tierWeightAdjustmentsStage2,
  tierWeightAdjustmentsStage3,
  tierWeightAdjustmentsStage4,
} from '@assets/data/augment/tierData'
import { ActivityType } from '@hooks/study/remix/useQuizManager'
import {
  AUDIO_OPTION_PLAYBACK_MAP,
  AUDIO_QUESTION_PLAYBACK_MAP,
  AUGMENT_CONSTANTS,
  AUGMENT_IDS,
  HEART_MAP,
} from '@src/constants/study/remix/augment'
import { StudyMode } from '@src/interfaces/common/Types'
import { AugmentTier } from '@src/interfaces/study/remix/AugmentTier'

export type AugmentCategory =
  | 'heart'
  | 'shield'
  | 'time'
  | 'point'
  | 'audio-question'
  | 'audio-option'
  | 'image'
  | 'word'
  | 'sentence'
  | 'keyboard'
  | 'special'

export interface AugmentContext {
  studyMode: StudyMode
  currentHeart: number
  baseMaxHeart: number
  maxHeart: number
  hasShield: boolean
  selectedAugments: SelectedAugment[]
  currentTime: number
  initialTime: number
  activityTypes: ActivityType[]
  stage: number
  totalStage: number
}

export interface AugmentConditions {
  activityTypes?: ActivityType[]
  customCheck?: (context: AugmentContext) => boolean
}

export interface IAugment {
  category: AugmentCategory
  tier: AugmentTier
  id: string
  nameKor: string
  nameEng: string
  descriptionKor: string
  descriptionEng: string
  conditions?: AugmentConditions
  allowReSelection?: boolean
}

export interface SelectedAugment extends IAugment {
  stage: number
  isActive: boolean
}

export type AugmentOptions = {
  heart: {
    maxHeartBonus: number
  }
  time: {
    timeInterval: number
  }
  questionAudio: {
    enableSound: boolean
    enablePlayCount: number
    playback: 0.75 | 1 | 1.25
    isInfinitePlay: boolean
  }
  exampleAudio: {
    enableSound: boolean
    playback: 0.75 | 1 | 1.25
  }
  image: {
    showImage: boolean
  }
  sentence: {
    showSentence: boolean
    showAll: boolean
  }
  word: {
    showFirst: boolean
    showLast: boolean
    showMask: boolean
  }
  keyboard: {
    enableKeyboard: boolean
    wrongKeyCount: number
  }
}

const applyAudioAugmentQuestion = (
  augment: SelectedAugment | undefined,
  audioOption: {
    enableSound: boolean
    enablePlayCount: number
    isInfinitePlay: boolean
    playback: 0.75 | 1 | 1.25
  },
  idToPlaybackMap: Record<string, 0.75 | 1 | 1.25>,
): void => {
  if (!augment) return

  switch (augment.id) {
    case AUGMENT_IDS.AUDIO_QUESTION.RABBIT_CHELLO_ROBOT:
    case AUGMENT_IDS.AUDIO_QUESTION.CHELLO_ROBOT:
    case AUGMENT_IDS.AUDIO_QUESTION.TORTOISE_CHELLO_ROBOT:
      audioOption.isInfinitePlay = true
      break

    case AUGMENT_IDS.AUDIO_QUESTION.JACK_ONE_TIME_AMPLIFIER:
      audioOption.isInfinitePlay = false
      audioOption.enablePlayCount += 1
      break
  }

  audioOption.enableSound = true

  const playback = idToPlaybackMap[augment.id]
  if (playback !== undefined) {
    audioOption.playback = playback
  }
}

const applyAudioAugmentOptions = (
  augment: SelectedAugment | undefined,
  audioOption: {
    enableSound: boolean
    playback: 0.75 | 1 | 1.25
  },
  idToPlaybackMap: Record<string, 0.75 | 1 | 1.25>,
): void => {
  if (!augment) return

  audioOption.enableSound = true

  const playback = idToPlaybackMap[augment.id]
  if (playback !== undefined) {
    audioOption.playback = playback
  }
}

export function getAugmentOptions(
  selectedAugments: SelectedAugment[],
  activityType?: ActivityType,
): AugmentOptions {
  const options: AugmentOptions = {
    heart: {
      maxHeartBonus: 0,
    },
    time: {
      timeInterval: AUGMENT_CONSTANTS.TIME_INTERVAL.DEFAULT,
    },
    questionAudio: {
      enableSound: false,
      enablePlayCount: 0,
      isInfinitePlay: false,
      playback: AUGMENT_CONSTANTS.AUDIO_PLAYBACK.NORMAL,
    },
    exampleAudio: {
      enableSound: false,
      playback: AUGMENT_CONSTANTS.AUDIO_PLAYBACK.NORMAL,
    },
    image: {
      showImage: false,
    },
    sentence: {
      showSentence: false,
      showAll: false,
    },
    word: {
      showFirst: false,
      showLast: false,
      showMask: false,
    },
    keyboard: {
      enableKeyboard: false,
      wrongKeyCount: 0,
    },
  }

  const relevantAugments = selectedAugments.filter((a) => {
    if (!a.isActive) return false
    if (activityType && a.conditions?.activityTypes) {
      return a.conditions.activityTypes.includes(activityType)
    }
    return true
  })

  const heartMaxAugments = relevantAugments.filter(
    (a) => HEART_MAP[a.id] !== undefined,
  )
  options.heart.maxHeartBonus = heartMaxAugments.reduce((sum, a) => {
    const bonus = HEART_MAP[a.id] ?? 0
    return sum + bonus
  }, 0)

  const wordAugments = relevantAugments.filter((a) => a.category === 'word')

  if (wordAugments.length > 0) {
    options.word.showMask = true

    wordAugments.forEach((wordAugment) => {
      switch (wordAugment.id) {
        case AUGMENT_IDS.WORD.FAIR_WIND:
          options.word.showFirst = true
          break

        case AUGMENT_IDS.WORD.BARO_TELESCOPE:
          options.word.showLast = true
          break

        case AUGMENT_IDS.WORD.TORI_STARRY_ASTROLOGY:
          options.word.showFirst = true
          options.word.showLast = true
          break
      }
    })
  }

  const keyboardAugment = relevantAugments.filter(
    (a) => a.category === 'keyboard',
  )

  if (keyboardAugment.length > 0) {
    options.keyboard.enableKeyboard = true

    keyboardAugment.forEach((keyboardAugment) => {
      switch (keyboardAugment.id) {
        case AUGMENT_IDS.KEYBOARD.BASIC_KEYBOARD:
          options.keyboard.wrongKeyCount = 5
          break

        case AUGMENT_IDS.KEYBOARD.ADVANCED_KEYBOARD:
          options.keyboard.wrongKeyCount = 3
          break

        case AUGMENT_IDS.KEYBOARD.CUSTOM_KEYBOARD:
          options.keyboard.wrongKeyCount = 1
          break

        case AUGMENT_IDS.KEYBOARD.MYSTERIOUS_KEYBOARD:
          options.keyboard.wrongKeyCount = 0
          break
      }
    })
  }

  const audioQuestionAugment = relevantAugments.find(
    (a) => a.category === 'audio-question',
  )

  applyAudioAugmentQuestion(
    audioQuestionAugment,
    options.questionAudio,
    AUDIO_QUESTION_PLAYBACK_MAP,
  )

  const audioOptionAugment = relevantAugments.find(
    (a) => a.category === 'audio-option',
  )

  applyAudioAugmentOptions(
    audioOptionAugment,
    options.exampleAudio,
    AUDIO_OPTION_PLAYBACK_MAP,
  )

  const timeAugment = relevantAugments.find((a) => a.category === 'time')

  if (timeAugment) {
    if (
      timeAugment.id === AUGMENT_IDS.TIME.EDMOND_SECRET_GARDEN ||
      timeAugment.id === AUGMENT_IDS.TIME.GREENTHUMB_SECRET_GARDEN
    ) {
      options.time.timeInterval = AUGMENT_CONSTANTS.TIME_INTERVAL.SLOW
    }
  }

  const imageAugment = relevantAugments.find((a) => a.category === 'image')

  if (imageAugment) {
    options.image.showImage = true
  }

  const sentenceAugment = relevantAugments.find(
    (a) => a.category === 'sentence',
  )

  if (sentenceAugment) {
    options.sentence.showSentence = true
    switch (sentenceAugment.id) {
      case AUGMENT_IDS.SENTENCE.GOMA_NOTE:
        options.sentence.showAll = true
        break
      case AUGMENT_IDS.SENTENCE.GOMA_TORN_NOTE:
        options.sentence.showAll = false
        break
    }
  }

  return options
}

interface UseAugmentProps {
  studyMode: StudyMode
  activityTypes: ActivityType[]
  currentHeart: number
  baseMaxHeart: number
  hasShield: boolean
  currentTime: number
  initialTime: number
  stage: number
  totalStage: number
}

export function useAugmentManager({
  studyMode,
  activityTypes,
  currentHeart,
  baseMaxHeart,
  hasShield,
  currentTime,
  initialTime,
  stage,
  totalStage,
}: UseAugmentProps) {
  const [selectedAugments, setSelectedAugments] = useState<SelectedAugment[]>(
    [],
  )

  const augmentOptions = useMemo(
    () => getAugmentOptions(selectedAugments),
    [selectedAugments],
  )
  const maxHeart = baseMaxHeart + (augmentOptions.heart?.maxHeartBonus ?? 0)

  const checkActivityTypes = (
    conditions: AugmentConditions,
    context: AugmentContext,
  ): boolean => {
    if (!conditions.activityTypes) {
      return true
    }

    return conditions.activityTypes.some((type) =>
      context.activityTypes.includes(type),
    )
  }

  const checkCustomCheck = (
    conditions: AugmentConditions,
    context: AugmentContext,
  ): boolean => {
    if (!conditions.customCheck || conditions.customCheck(context)) {
      return true
    }

    return false
  }

  const checkAugmentConditions = (
    augment: IAugment,
    context: AugmentContext,
  ): boolean => {
    const conditions = augment.conditions

    if (!conditions) {
      return true
    } else {
      if (
        checkActivityTypes(conditions, context) &&
        checkCustomCheck(conditions, context)
      ) {
        return true
      }

      return false
    }
  }

  const selectAugment = (augment: IAugment, stage: number) => {
    const selectedAugment: SelectedAugment = {
      ...augment,
      stage,
      isActive: true,
    }

    setSelectedAugments((prev) => [...prev, selectedAugment])
  }

  const getSelectedTierByStage = (targetStage: number): AugmentTier | null => {
    const selectedAugment = selectedAugments.find(
      (a) => a.stage === targetStage,
    )
    return selectedAugment?.tier || null
  }

  const getTierWeight = (tier: AugmentTier): number => {
    if (stage === 0) {
      return baseTierWeights[tier]
    }

    if (stage === 1) {
      const stage1Tier = getSelectedTierByStage(0)
      if (stage1Tier && tierWeightAdjustmentsStage2[stage1Tier]) {
        return tierWeightAdjustmentsStage2[stage1Tier][tier]
      }
      return baseTierWeights[tier]
    }

    if (stage === 2) {
      const stage1Tier = getSelectedTierByStage(0)
      const stage2Tier = getSelectedTierByStage(1)

      if (
        stage1Tier &&
        stage2Tier &&
        tierWeightAdjustmentsStage3[stage1Tier]?.[stage2Tier]
      ) {
        return tierWeightAdjustmentsStage3[stage1Tier][stage2Tier][tier]
      }

      if (stage1Tier && tierWeightAdjustmentsStage2[stage1Tier]) {
        return tierWeightAdjustmentsStage2[stage1Tier][tier]
      }

      return baseTierWeights[tier]
    }

    if (stage === 3) {
      const stage1Tier = getSelectedTierByStage(0)
      const stage2Tier = getSelectedTierByStage(1)
      const stage3Tier = getSelectedTierByStage(2)

      if (
        stage1Tier &&
        stage2Tier &&
        stage3Tier &&
        tierWeightAdjustmentsStage4[stage1Tier]?.[stage2Tier]?.[stage3Tier]
      ) {
        return tierWeightAdjustmentsStage4[stage1Tier][stage2Tier][stage3Tier][
          tier
        ]
      }

      if (
        stage1Tier &&
        stage2Tier &&
        tierWeightAdjustmentsStage3[stage1Tier]?.[stage2Tier]
      ) {
        return tierWeightAdjustmentsStage3[stage1Tier][stage2Tier][tier]
      }

      return baseTierWeights[tier]
    }

    return baseTierWeights[tier]
  }

  const weightedRandomSelectOne = <T>(
    items: T[],
    getWeight: (item: T) => number,
  ): T | null => {
    if (items.length === 0) {
      return null
    }

    if (items.length === 1) {
      return items[0]
    }

    const totalWeight = items.reduce((sum, item) => sum + getWeight(item), 0)

    let random = Math.random() * totalWeight

    for (let i = 0; i < items.length; i++) {
      const weight = getWeight(items[i])
      random -= weight

      if (random <= 0) {
        return items[i]
      }
    }

    return items[items.length - 1]
  }

  const groupByTier = <T>(
    items: T[],
    getTier: (item: T) => AugmentTier,
  ): Map<AugmentTier, T[]> => {
    const tierGroups = new Map<AugmentTier, T[]>()
    items.forEach((item) => {
      const tier = getTier(item)
      if (!tierGroups.has(tier)) {
        tierGroups.set(tier, [])
      }
      tierGroups.get(tier)!.push(item)
    })
    return tierGroups
  }

  const selectOneFromTierGroups = <T>(
    tierGroups: Map<AugmentTier, T[]>,
    getWeight: (item: T) => number,
  ): { item: T; tier: AugmentTier; index: number; items: T[] } | null => {
    const tierRepresentatives: Array<{ tier: AugmentTier; items: T[] }> = []
    tierGroups.forEach((tierItems, tier) => {
      tierRepresentatives.push({ tier, items: tierItems })
    })

    const selectedTierGroup = weightedRandomSelectOne(
      tierRepresentatives,
      (rep) => getWeight(rep.items[0]),
    )

    if (!selectedTierGroup) return null

    const tierItems = selectedTierGroup.items
    const randomIndex = Math.floor(Math.random() * tierItems.length)
    return {
      item: tierItems[randomIndex],
      tier: selectedTierGroup.tier,
      index: randomIndex,
      items: tierItems,
    }
  }

  const selectOnePerCategory = <T>(
    categoryGroups: Map<string, T[]>,
    getTier: (item: T) => AugmentTier,
    getWeight: (item: T) => number,
  ): T[] => {
    const selectedByCategory: T[] = []

    categoryGroups.forEach((groupItems) => {
      const tierGroups = groupByTier(groupItems, getTier)
      const selected = selectOneFromTierGroups(tierGroups, getWeight)
      if (selected) {
        selectedByCategory.push(selected.item)
      }
    })

    return selectedByCategory
  }

  const selectByTierCompetition = <T>(
    items: T[],
    getTier: (item: T) => AugmentTier,
    getWeight: (item: T) => number,
  ): T[] => {
    const finalSelected: T[] = []
    const tierGroups = groupByTier(items, getTier)

    while (
      finalSelected.length < AUGMENT_CONSTANTS.AUGMENT_COUNT &&
      tierGroups.size > 0
    ) {
      const selected = selectOneFromTierGroups(tierGroups, getWeight)
      if (!selected) break

      finalSelected.push(selected.item)

      selected.items.splice(selected.index, 1)

      if (selected.items.length === 0) {
        tierGroups.delete(selected.tier)
      }
    }

    return finalSelected
  }

  const selectByCategoryCompetition = <T>(
    items: T[],
    getCategory: (item: T) => string,
    getTier: (item: T) => AugmentTier,
    getWeight: (item: T) => number,
  ): T[] => {
    const categoryGroups = new Map<string, T[]>()
    items.forEach((item) => {
      const category = getCategory(item)
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, [])
      }
      categoryGroups.get(category)!.push(item)
    })

    const selectedByCategory = selectOnePerCategory(
      categoryGroups,
      getTier,
      getWeight,
    )

    if (selectedByCategory.length < AUGMENT_CONSTANTS.AUGMENT_COUNT) {
      return selectedByCategory
    }

    return selectByTierCompetition(selectedByCategory, getTier, getWeight)
  }

  const createFilteredAugments = (
    augments: IAugment[],
    context: AugmentContext,
  ): IAugment[] => {
    return augments.filter((augment) =>
      checkAugmentConditions(augment, context),
    )
  }

  const selectableAugments = useMemo<IAugment[]>(() => {
    if (activityTypes.length === 0) {
      return []
    }

    const augmentContext: AugmentContext = {
      studyMode,
      currentHeart,
      baseMaxHeart,
      maxHeart,
      hasShield,
      selectedAugments,
      currentTime,
      initialTime,
      activityTypes,
      stage,
      totalStage,
    }

    const filtered = createFilteredAugments(AugmentData, augmentContext)

    const selectedIds = new Set(selectedAugments.map((a) => a.id))
    const filteredExcludingSelected = filtered.filter((augment) => {
      if (!selectedIds.has(augment.id)) return true
      return augment.allowReSelection === true
    })

    return selectByCategoryCompetition(
      filteredExcludingSelected,
      (augment) => augment.category,
      (augment) => augment.tier,
      (augment) => getTierWeight(augment.tier),
    )
  }, [
    selectedAugments,
    currentHeart,
    maxHeart,
    hasShield,
    currentTime,
    initialTime,
    activityTypes,
    stage,
    totalStage,
  ])

  const getAugmentOptionsInternal = (
    activityType?: ActivityType,
  ): AugmentOptions => {
    return getAugmentOptions(selectedAugments, activityType)
  }

  return {
    selectedAugments,
    selectableAugments,
    selectAugment,
    getAugmentOptions: getAugmentOptionsInternal,
  }
}
