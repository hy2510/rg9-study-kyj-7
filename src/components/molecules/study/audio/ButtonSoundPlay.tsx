import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import { SoundPlayToggleIcon } from '@components/atoms/study/audio/SoundPlayToggleIcon'
import { QuestionSoundPlacement } from '@contexts/QuestionSoundSlotContext'
import { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { useQuestionAudio } from '@src/hooks/study/audio/useQuestionAudio'

type ButtonSoundPlayProps = {
  position: 'left-top' | 'none'
  soundUrl: string
  augmentOptions?: AugmentOptions
  autoPlay?: boolean
  replayKey?: string | number
}

export function ButtonSoundPlay({
  position,
  soundUrl,
  augmentOptions,
  autoPlay = false,
  replayKey,
}: ButtonSoundPlayProps) {
  const { isPlaying, canPlay, play, stop } = useQuestionAudio(soundUrl, {
    augmentOptions,
    autoPlay,
    replayKey,
  })

  const handleClick = () => {
    if (!soundUrl) return
    if (!canPlay) return
    if (isPlaying) {
      stop()
      return
    }
    play()
  }

  const soundButton = (
    <SoundPlayToggleIcon
      isPlaying={Boolean(soundUrl) && isPlaying}
      disabled={!soundUrl || !canPlay}
      onClick={handleClick}
    />
  )

  if (position !== 'left-top') return soundButton

  return (
    <QuestionSoundPlacement
      fallback={
        <SoundPlayButtonWrapper>{soundButton}</SoundPlayButtonWrapper>
      }
    >
      {soundButton}
    </QuestionSoundPlacement>
  )
}

const SoundPlayButtonWrapper = styled.div`
  position: absolute;
  top: -20px;
  left: -20px;

  ${media.tablet} {
    top: -24px;
    left: -4px;
  }
`
