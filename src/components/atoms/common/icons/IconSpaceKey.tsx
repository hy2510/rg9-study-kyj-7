import spaceKeyIcon from '@assets/icons/space-key.svg'
import type { ImgIconProps } from '@interfaces/common/icons/ImgIconProps'
import { imgProps } from '@utils/common/icons/imgProps'

export function IconSpaceKey({ width, height, ...rest }: ImgIconProps) {
  return (
    <img
      src={spaceKeyIcon}
      {...imgProps(width, height, { alt: '', 'aria-hidden': true, ...rest })}
    />
  )
}
