export function getLettersOnly(str: string): string {
  return str.replace(/[^a-zA-Z]/g, '')
}

export function getInputChars(str: string, typeSpace = false): string {
  return typeSpace ? str.replace(/[^a-zA-Z ]/g, '') : getLettersOnly(str)
}

export function isSpellingCorrect(
  input: string,
  answer: string,
  typeSpace = false,
): boolean {
  const inputChars = getInputChars(input, typeSpace).toLowerCase()
  const answerChars = getInputChars(answer, typeSpace).toLowerCase()
  return inputChars === answerChars
}

export function isSpecialOrSpace(char: string): boolean {
  return char === ' ' || !/^[a-zA-Z]$/.test(char)
}

export function isFixedChar(char: string, typeSpace = false): boolean {
  if (typeSpace && char === ' ') return false
  return isSpecialOrSpace(char)
}

export function isSpellingInputCharIncorrect(
  answerChar: string,
  inputChar: string,
  typeSpace = false,
): boolean {
  if (!inputChar || isFixedChar(answerChar, typeSpace)) return false
  return inputChar.toLowerCase() !== answerChar.toLowerCase()
}

export function getDisplayChar(
  answerChar: string,
  inputChar: string,
  typeSpace = false,
): string {
  if (isFixedChar(answerChar, typeSpace)) {
    return answerChar
  }
  return /^[A-Z]$/.test(answerChar) ? inputChar.toUpperCase() : inputChar
}

export function buildDisplayText(
  answer: string,
  input: string,
  typeSpace = false,
): string {
  return Array.from({ length: answer.length })
    .map((_, i) => {
      const answerChar = answer[i]
      const inputIndex = getInputChars(answer.slice(0, i), typeSpace).length
      const inputChar = input[inputIndex] ?? ''
      return getDisplayChar(answerChar, inputChar, typeSpace)
    })
    .join('')
}
