function createSentenceWithBlank(
  sentence: string,
  answerWord: string,
  placeholder = '___',
): string {
  return sentence.replace(answerWord, placeholder)
}

function playAudio(src: string): void {
  const audio = new Audio(src)
  void audio.play().catch(() => {})
}

export { createSentenceWithBlank, playAudio }
