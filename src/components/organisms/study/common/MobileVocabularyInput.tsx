import { type RefObject, useEffect, useRef, useState } from 'react'

import styled from 'styled-components'

import { getInputChars } from '@utils/spellingUtils'

const LATIN_INPUT_PATTERN = /^[a-zA-Z ]*$/

type Props = {
  word: string
  value: string
  typeSpace?: boolean
  onValueChange: (value: string) => void
  onEnter: () => void
  inputRef?: RefObject<HTMLInputElement>
}

export default function MobileVocabularyInput({
  word,
  value,
  typeSpace = false,
  onValueChange,
  onEnter,
  inputRef: suppliedInputRef,
}: Props) {
  const localInputRef = useRef<HTMLInputElement>(null)
  const inputRef = suppliedInputRef ?? localInputRef
  const composing = useRef(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (!composing.current) setDraft(value)
  }, [value])

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [word, inputRef])

  const normalize = (text: string) =>
    getInputChars(text, typeSpace)
      .toLowerCase()
      .slice(0, getInputChars(word, typeSpace).length)

  const commit = (text: string) => {
    const normalized = normalize(text)
    setDraft(normalized)
    onValueChange(normalized)
  }

  return (
    <Input
      ref={inputRef}
      aria-label='System keyboard spelling input'
      type='text'
      inputMode='text'
      enterKeyHint='done'
      autoCapitalize='none'
      autoComplete='off'
      autoCorrect='off'
      spellCheck={false}
      value={draft}
      onChange={(event) => {
        const text = event.currentTarget.value
        if (!composing.current) {
          commit(text)
          return
        }
        setDraft(text)
        if (LATIN_INPUT_PATTERN.test(text)) onValueChange(normalize(text))
      }}
      onCompositionStart={() => {
        composing.current = true
      }}
      onCompositionEnd={(event) => {
        composing.current = false
        commit(event.currentTarget.value)
      }}
      onKeyDown={(event) => {
        if (
          event.key !== 'Enter' ||
          event.nativeEvent.isComposing ||
          composing.current
        )
          return
        event.preventDefault()
        event.stopPropagation()
        onEnter()
      }}
    />
  )
}

const Input = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0;
  border: 0;
  background: transparent;
  color: transparent;
  caret-color: transparent;
  opacity: 0.01;
  font-size: 16px;
  z-index: 1;
`
