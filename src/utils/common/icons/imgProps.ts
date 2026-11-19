import type { ImgHTMLAttributes } from 'react'

export function imgProps(
  width: number | undefined,
  height: number | undefined,
  rest: ImgHTMLAttributes<HTMLImageElement>,
): ImgHTMLAttributes<HTMLImageElement> {
  const { width: _rw, height: _rh, alt, ...r } = rest
  return {
    ...r,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    alt: alt ?? '',
  }
}
