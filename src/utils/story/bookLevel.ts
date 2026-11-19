export function isBookLevelAtLeastTwo(bookLevel?: string): boolean {
  const level = Number.parseInt(bookLevel?.trim().substring(0, 1) ?? '', 10)
  return Number.isFinite(level) && level >= 2
}
