import { useCallback, useEffect, useState } from 'react'

import { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { useSpellingPhysicalKeyboard } from '@hooks/study/remix/useSpellingPhysicalKeyboard'
import { getLettersOnly, isSpellingCorrect } from '@utils/spellingUtils'

type UseClozeSpellingInputOptions = {
  augmentOptions: AugmentOptions
  answers: string[]
  onComplete: (isCorrect: boolean) => void
}

export function useClozeSpellingInput({
  augmentOptions,
  answers,
  onComplete,
}: UseClozeSpellingInputOptions) {
  const blankCount = answers.length
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0)
  const [inputValues, setInputValues] = useState<string[]>(() =>
    Array(blankCount).fill(''),
  )
  const [isChecked, setIsChecked] = useState(false)

  const isCorrect =
    isChecked &&
    answers.every((ans, i) => isSpellingCorrect(inputValues[i] ?? '', ans))
  const isIncorrect = isChecked && !isCorrect
  const allFilled = augmentOptions.word.showMask
    ? answers.every(
        (ans, i) =>
          getLettersOnly(inputValues[i] ?? '').length >=
          getLettersOnly(ans).length,
      )
    : inputValues.every((v) => (v ?? '').trim().length > 0)

  const handleKeyPress = useCallback(
    (key: string) => {
      if (isChecked) return

      if (key === 'enter' || key === 'tab') {
        if (allFilled) {
          setIsChecked(true)
          const correct = answers.every((ans, i) =>
            isSpellingCorrect(inputValues[i] ?? '', ans),
          )
          onComplete(correct)
        } else if (currentBlankIndex < blankCount - 1) {
          setCurrentBlankIndex((prev) => prev + 1)
        }
        return
      }

      const maxLen = augmentOptions.word.showMask
        ? getLettersOnly(answers[currentBlankIndex]).length
        : Infinity

      if (key === 'backspace') {
        setInputValues((prev) => {
          const next = [...prev]
          next[currentBlankIndex] = (next[currentBlankIndex] ?? '').slice(0, -1)
          return next
        })
      } else {
        setInputValues((prev) => {
          const next = [...prev]
          const current = next[currentBlankIndex] ?? ''
          next[currentBlankIndex] = (current + key).slice(0, maxLen)
          return next
        })
      }
    },
    [
      augmentOptions,
      isChecked,
      currentBlankIndex,
      blankCount,
      answers,
      allFilled,
      inputValues,
      onComplete,
    ],
  )

  useSpellingPhysicalKeyboard({
    onKeyPress: handleKeyPress,
  })

  useEffect(() => {
    if (isChecked) return

    const currentInput = inputValues[currentBlankIndex] ?? ''
    const currentAnswer = answers[currentBlankIndex] ?? ''

    if (
      isSpellingCorrect(currentInput, currentAnswer) &&
      currentBlankIndex < blankCount - 1
    ) {
      setCurrentBlankIndex((prev) => prev + 1)
    }
  }, [inputValues, currentBlankIndex, answers, blankCount, isChecked])

  useEffect(() => {
    if (isChecked || !allFilled) return
    const correct = answers.every((ans, i) =>
      isSpellingCorrect(inputValues[i] ?? '', ans),
    )
    if (correct) {
      setIsChecked(true)
      onComplete(correct)
    }
  }, [inputValues, answers, isChecked, onComplete, allFilled])

  const setCurrentBlank = useCallback((index: number) => {
    setCurrentBlankIndex(index)
  }, [])

  const setInputValue = useCallback((index: number, value: string) => {
    setInputValues((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }, [])

  return {
    inputValues,
    currentBlankIndex,
    setCurrentBlankIndex: setCurrentBlank,
    setInputValue,
    handleKeyPress,
    isChecked,
    isCorrect,
    isIncorrect,
    allFilled,
    combinedWord: [
      ...new Set(getLettersOnly(answers.join('')).toLowerCase()),
    ].join(''),
  }
}
