import { useCallback, useEffect, useState } from 'react'

import { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { useSpellingPhysicalKeyboard } from '@hooks/study/remix/useSpellingPhysicalKeyboard'
import { getLettersOnly, isSpellingCorrect } from '@utils/spellingUtils'

type UseSpellingInputOptions = {
  augmentOptions: AugmentOptions
  correctWord: string
  onComplete: (isCorrect: boolean) => void
}

export function useSpellingInput({
  augmentOptions,
  correctWord,
  onComplete,
}: UseSpellingInputOptions) {
  const lettersOnly = getLettersOnly(correctWord)
  const showMask = augmentOptions.word.showMask

  const [inputText, setInputText] = useState('')
  const [isChecked, setIsChecked] = useState(false)

  const isCorrect = isChecked && isSpellingCorrect(inputText, correctWord)
  const isIncorrect = isChecked && !isCorrect
  const isAllFilled = showMask
    ? inputText.length === lettersOnly.length
    : inputText.trim().length > 0

  const maxLen = showMask ? lettersOnly.length : Infinity

  const handleKeyPress = useCallback(
    (key: string) => {
      if (isChecked) return

      if (key === 'enter') {
        if (isAllFilled) {
          setIsChecked(true)
          const correct = isSpellingCorrect(inputText, correctWord)
          onComplete(correct)
        }
        return
      }

      if (key === 'backspace') {
        setInputText((prev) => prev.slice(0, -1))
      } else {
        setInputText((prev) => (prev + key).slice(0, maxLen))
      }
    },
    [isChecked, maxLen, inputText, correctWord, isAllFilled, onComplete],
  )

  const setInputValue = useCallback(
    (value: string) => {
      if (isChecked) return
      const filtered = getLettersOnly(value)
      setInputText(showMask ? filtered.slice(0, lettersOnly.length) : filtered)
    },
    [isChecked, showMask, lettersOnly.length],
  )

  useSpellingPhysicalKeyboard({
    onKeyPress: handleKeyPress,
  })

  useEffect(() => {
    if (!isAllFilled || isChecked) return

    if (isSpellingCorrect(inputText, correctWord)) {
      setIsChecked(true)

      onComplete(true)
    }
  }, [inputText, correctWord, isChecked, onComplete, isAllFilled])

  return {
    inputText,
    isChecked,
    isCorrect,
    isIncorrect,
    isAllFilled,
    lettersOnly,
    handleKeyPress,
    setInputValue,
  }
}
