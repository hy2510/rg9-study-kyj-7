import type { ImgHTMLAttributes } from 'react'

export type ImgIconProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  width?: number
  height?: number
}
