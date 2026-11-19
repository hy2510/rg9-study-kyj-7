import { ButtonSoundPlay } from '@components/molecules/study/audio/ButtonSoundPlay'
import type { AugmentOptions } from '@hooks/study/remix/useAugmentManager'

type QuestionSoundButtonProps = {
  soundUrl?: string
  autoPlay?: boolean
  augmentOptions?: AugmentOptions
  forceEnable?: boolean
  replayKey?: string | number
}

export default function QuestionSoundButton({
  soundUrl,
  autoPlay = true,
  augmentOptions,
  forceEnable = true,
  replayKey,
}: QuestionSoundButtonProps) {
  const enabled = augmentOptions?.questionAudio?.enableSound ?? forceEnable
  if (!enabled) return null

  return (
    <ButtonSoundPlay
      position='left-top'
      soundUrl={soundUrl ?? ''}
      augmentOptions={augmentOptions}
      autoPlay={autoPlay}
      replayKey={replayKey}
    />
  )
}
