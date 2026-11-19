import { STORY_PLAYBACK_RATES } from '@src/constants/story/storyPlayback'
import {
  parseStoredStoryReadingProfile,
  STORY_READING_PROFILE_STORAGE_KEY,
  type StoryReadingProfile,
} from '@src/constants/story/storyReadingProfile'

export const STORY_READ_MODE_STORAGE_KEY = 'storyReadMode'

const LEGACY_AUTO_NEXT_KEY = 'storyAutoNextPage'
const LEGACY_PLAYBACK_KEY = 'storyPlaybackRate'

export type StoryReadModeState = {
  readingProfile: StoryReadingProfile
  isAutoNext: boolean
  playbackRate: number
}

const DEFAULT_STATE: StoryReadModeState = {
  readingProfile: 'basic',
  isAutoNext: true,
  playbackRate: 1,
}

function normalizePlaybackRate(rate: unknown): number {
  const n = typeof rate === 'number' ? rate : Number(rate)
  if (!Number.isFinite(n)) return 1
  const match = STORY_PLAYBACK_RATES.find((r) => Math.abs(r - n) < 0.001)
  return match ?? 1
}

function readLegacyAutoNext(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const v = localStorage.getItem(LEGACY_AUTO_NEXT_KEY)
    if (v === null) return true
    if (v === 'true') return true
    if (v === 'false') return false
    return true
  } catch {
    return true
  }
}

function readLegacyPlaybackRate(): number {
  if (typeof window === 'undefined') return 1
  try {
    const raw = localStorage.getItem(LEGACY_PLAYBACK_KEY)
    if (raw == null) return 1
    const n = Number(raw)
    return normalizePlaybackRate(n)
  } catch {
    return 1
  }
}

function migrateFromLegacyKeys(): StoryReadModeState {
  return {
    readingProfile: parseStoredStoryReadingProfile(
      typeof window !== 'undefined'
        ? localStorage.getItem(STORY_READING_PROFILE_STORAGE_KEY)
        : null,
    ),
    isAutoNext: readLegacyAutoNext(),
    playbackRate: readLegacyPlaybackRate(),
  }
}

export function persistStoryReadMode(state: StoryReadModeState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORY_READ_MODE_STORAGE_KEY, JSON.stringify(state))
    localStorage.setItem(
      STORY_READING_PROFILE_STORAGE_KEY,
      state.readingProfile,
    )
    localStorage.setItem(LEGACY_AUTO_NEXT_KEY, String(state.isAutoNext))
    localStorage.setItem(LEGACY_PLAYBACK_KEY, String(state.playbackRate))
  } catch {
  }
}

export function loadStoryReadMode(): StoryReadModeState {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_STATE }
  }

  try {
    const raw = localStorage.getItem(STORY_READ_MODE_STORAGE_KEY)
    if (raw) {
      const o = JSON.parse(raw) as Partial<StoryReadModeState>
      const state: StoryReadModeState = {
        readingProfile: parseStoredStoryReadingProfile(
          o.readingProfile != null ? String(o.readingProfile) : null,
        ),
        isAutoNext:
          typeof o.isAutoNext === 'boolean'
            ? o.isAutoNext
            : readLegacyAutoNext(),
        playbackRate: normalizePlaybackRate(o.playbackRate),
      }
      return state
    }
  } catch {
  }

  const migrated = migrateFromLegacyKeys()
  persistStoryReadMode(migrated)
  return migrated
}

export function saveStoryReadModePartial(
  patch: Partial<StoryReadModeState>,
): void {
  const current = loadStoryReadMode()
  persistStoryReadMode({ ...current, ...patch })
}

export function getStoredStoryPlaybackRate(): number {
  return loadStoryReadMode().playbackRate
}

export function setStoredStoryPlaybackRate(rate: number): void {
  saveStoryReadModePartial({ playbackRate: normalizePlaybackRate(rate) })
}

export function getStoryAutoNextFromStorage(): boolean {
  return loadStoryReadMode().isAutoNext
}

export function setStoryAutoNextInStorage(value: boolean): void {
  saveStoryReadModePartial({ isAutoNext: value })
}
