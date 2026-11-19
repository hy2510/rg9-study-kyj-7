export type SentenceDisplayToken = {
  text: string
  wordIndex?: number
}

export function getSentenceDisplayTokens(
  sentence: string,
): SentenceDisplayToken[] {
  let wordIndex = -1

  return sentence.split(/(\s+)/).map((text) => {
    if (/^\s+$/.test(text)) return { text }
    wordIndex += 1
    return { text, wordIndex }
  })
}
