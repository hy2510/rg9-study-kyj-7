import { TEXT_SHADOW_SOFT } from '@styles/tokens/textShadow'
import { styled } from 'styled-components'

import { AugmentTier } from '@interfaces/study/remix/AugmentTier'
import { getTierDescriptionColor } from '@utils/study/remix/tierStyles'

const AugmentCardDescription = styled.div<{
  tier: AugmentTier
  $variant?: 'selectable' | 'acquired'
}>`
  font-size: ${({ $variant }) => ($variant === 'acquired' ? '1em' : '14px')};
  color: ${({ tier }) => getTierDescriptionColor(tier)};
  text-align: center;
  ${({ $variant }) =>
    $variant === 'acquired'
      ? 'line-height: 1.3;'
      : `text-shadow: ${TEXT_SHADOW_SOFT};`}
`

export default AugmentCardDescription
