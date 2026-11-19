export function computeUniquePageTotal<T extends { Page: number }>(
  items: T[] | undefined,
): number {
  if (!items?.length) return 1
  const uniquePages = [...new Set(items.map((p) => p.Page))]
  return Math.max(1, Math.max(...uniquePages))
}
