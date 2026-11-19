export function getGuideParentOrigin(): string | undefined {
  try {
    if (!document.referrer) return undefined
    return new URL(document.referrer).origin
  } catch {
    return undefined
  }
}
