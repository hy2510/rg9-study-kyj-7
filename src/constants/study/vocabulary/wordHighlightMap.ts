export type HighlightTarget = {
  text: string
  baseOnly?: string
}

export type HighlightConfig = {
  sentence: string
  targets: HighlightTarget[]
}

export const WORD_HIGHLIGHT_MAP: Record<string, HighlightConfig[]> = {
  'EB-1A-507': [
    {
      sentence: 'Anchovies are tiny fish that taste salty.',
      targets: [{ text: 'Anchovies' }],
    },
  ],
  'EB-1B-334': [
    {
      sentence: 'The woodpecker pecks on the tree.',
      targets: [{ text: 'pecks', baseOnly: 'peck' }],
    },
  ],
  'EB-1B-518': [
    {
      sentence: 'Lily ties up her hair with a hairband.',
      targets: [{ text: 'ties', baseOnly: 'tie' }, { text: 'up' }],
    },
  ],
  'EB-1C-303': [
    {
      sentence: 'He practices acting to be an actor.',
      targets: [{ text: 'acting', baseOnly: 'act' }],
    },
  ],
  'EB-1C-312': [
    { sentence: 'Jenny cries out loud.', targets: [{ text: 'cries' }] },
  ],
  'EB-1C-347': [
    {
      sentence: 'The street is covered with leaves.',
      targets: [{ text: 'leaves' }],
    },
  ],
  'EB-1C-522': [
    {
      sentence: 'The firefighter puts out the fire.',
      targets: [{ text: 'fire' }],
    },
  ],
}

export const VOCA_HIGHLIGHT_COLOR = '#f15144'
