export const AUGMENT_IDS = {
  WORD: {
    BLANC_MYSTERIOUS_EYE_DROP: "Blanc's Mysterious Eye Drop",
    FAIR_WIND: 'Fair Wind',
    BARO_TELESCOPE: "Baro's Telescope",
    TORI_STARRY_ASTROLOGY: "Tori's Starry Astrology",
  },

  KEYBOARD: {
    BASIC_KEYBOARD: 'Basic Keyboard',
    ADVANCED_KEYBOARD: 'Advanced Keyboard',
    CUSTOM_KEYBOARD: 'Custom Keyboard',
    MYSTERIOUS_KEYBOARD: 'Mystrious Keyboard',
  },

  AUDIO_QUESTION: {
    RABBIT_CHELLO_ROBOT: 'Rabbit Chello Robot',
    CHELLO_ROBOT: 'Chello Robot',
    TORTOISE_CHELLO_ROBOT: 'Tortoise Chello Robot',
    JACK_ONE_TIME_AMPLIFIER: "Jack's One-Time Amplifier",
  },

  AUDIO_OPTION: {
    CHELLO_FAST_RECORDING_TAPE: "Chello's Fast Recording Tape",
    CHELLO_RECORDING_TAPE: "Chello's Recording Tape",
    CHELLO_SLOW_RECORDING_TAPE: "Chello's Slow Recording Tape",
  },

  TIME: {
    EDMOND_SECRET_GARDEN: "Edmond's Secret Garden",
    GREENTHUMB_SECRET_GARDEN: "GreenThumb's Secret Garden",
    DODO_MAGIC_CLOCK: "Dodo's Magic Clock",
  },

  IMAGE: {
    GOMA_NOTE: "Goma's Note",
    GOMA_TORN_NOTE: "Goma's Torn Note",
  },

  SENTENCE: {
    GOMA_NOTE: "Goma's Note",
    GOMA_TORN_NOTE: "Goma's Torn Note",
  },

  HEART: {
    BLANC_GROWTH_PILL: "Blanc's Growth Pill",
    HIRE_LEONI: 'Hire Leoni!',
    SHEILA_PANCAKE: "Sheila's Pancake",
    BLANC_BANDAGE: "Blanc's Bandage",
    GREENTHUMB_MAGIC_BEANS: "Greenthumb's Magic Beans",
    GINO_WINNING_HEADBAND: "Gino's Winning Headband",
  },

  SPECIAL: {
    RORO_BIRTHDAY_PARTY: "Roro's Birthday Party",
  },
} as const

export const AUGMENT_CONSTANTS = {
  AUGMENT_COUNT: 3,

  TIME_INTERVAL: {
    DEFAULT: 1000,
    SLOW: 2000,
  },

  AUDIO_PLAYBACK: {
    SLOW: 0.75,
    NORMAL: 1,
    FAST: 1.25,
  },

  HEART: {
    DEFAULT_MAX: 5,
  },
} as const

export const AUDIO_QUESTION_PLAYBACK_MAP: Record<string, 0.75 | 1 | 1.25> = {
  [AUGMENT_IDS.AUDIO_QUESTION.RABBIT_CHELLO_ROBOT]:
    AUGMENT_CONSTANTS.AUDIO_PLAYBACK.FAST,
  [AUGMENT_IDS.AUDIO_QUESTION.CHELLO_ROBOT]:
    AUGMENT_CONSTANTS.AUDIO_PLAYBACK.NORMAL,
  [AUGMENT_IDS.AUDIO_QUESTION.TORTOISE_CHELLO_ROBOT]:
    AUGMENT_CONSTANTS.AUDIO_PLAYBACK.SLOW,
}

export const AUDIO_OPTION_PLAYBACK_MAP: Record<string, 0.75 | 1 | 1.25> = {
  [AUGMENT_IDS.AUDIO_OPTION.CHELLO_FAST_RECORDING_TAPE]:
    AUGMENT_CONSTANTS.AUDIO_PLAYBACK.FAST,
  [AUGMENT_IDS.AUDIO_OPTION.CHELLO_RECORDING_TAPE]:
    AUGMENT_CONSTANTS.AUDIO_PLAYBACK.NORMAL,
  [AUGMENT_IDS.AUDIO_OPTION.CHELLO_SLOW_RECORDING_TAPE]:
    AUGMENT_CONSTANTS.AUDIO_PLAYBACK.SLOW,
}

export const HEART_MAP: Record<string, number> = {
  [AUGMENT_IDS.HEART.BLANC_GROWTH_PILL]: 1,
}
