export type StoryReadingProfile = 'basic' | 'noAudio' | 'noText' | 'noHighlight'

export const STORY_READING_PROFILES_ORDER: StoryReadingProfile[] = [
  'basic',
  'noHighlight',
  'noText',
  'noAudio',
]

export const STORY_READING_PROFILE_STORAGE_KEY = 'storyReadingProfile'

const PROFILE_LABELS: Record<StoryReadingProfile, string> = {
  basic: 'Focus · On',
  noAudio: 'Text Only',
  noText: 'Audio Only',
  noHighlight: 'Focus · Off',
}

export function getStoryReadingProfileLabel(
  profile: StoryReadingProfile,
): string {
  return PROFILE_LABELS[profile]
}

export function parseStoredStoryReadingProfile(
  raw: string | null,
): StoryReadingProfile {
  if (
    raw === 'basic' ||
    raw === 'noAudio' ||
    raw === 'noText' ||
    raw === 'noHighlight'
  ) {
    return raw
  }
  return 'basic'
}

export type StoryReadingProfileFlags = {
  audioMuted: boolean
  showText: boolean
  showHighlightWhilePlaying: boolean
}

export function getStoryReadingProfileFlags(
  profile: StoryReadingProfile,
): StoryReadingProfileFlags {
  switch (profile) {
    case 'basic':
      return {
        audioMuted: false,
        showText: true,
        showHighlightWhilePlaying: true,
      }
    case 'noAudio':
      return {
        audioMuted: true,
        showText: true,
        showHighlightWhilePlaying: false,
      }
    case 'noText':
      return {
        audioMuted: false,
        showText: false,
        showHighlightWhilePlaying: false,
      }
    case 'noHighlight':
      return {
        audioMuted: false,
        showText: true,
        showHighlightWhilePlaying: false,
      }
  }
}
