export function isTextEntryKeyboardTarget(
  target: EventTarget | null,
): boolean {
  if (!(target instanceof HTMLElement)) return false

  const textEntryTarget = target.closest(
    'input, textarea, select, [contenteditable="true"]',
  )
  return Boolean(textEntryTarget)
}

export function uniquePagesFromStory<T extends { Page: number }>(
  storyData: T[],
): T[] {
  return storyData.filter(
    (item, index, arr) => arr.findIndex((i) => i.Page === item.Page) === index,
  )
}

export function getProgressPageForParent(
  pages: { Page: number }[],
  pageNumber: number,
  singlePagePortrait: boolean,
  spreadHalf: 0 | 1,
): number {
  const pIdx = pageNumber - 1
  const left = pages[pIdx]
  const right = pages[pIdx + 1]
  if (singlePagePortrait) {
    return spreadHalf === 0
      ? (left?.Page ?? pageNumber)
      : (right?.Page ?? left?.Page ?? pageNumber)
  }
  const maxLR = Math.max(left?.Page ?? 0, right?.Page ?? 0)
  return maxLR > 0 ? maxLR : pageNumber
}

export function getResumeSpreadPage(
  bookmarkPage: number,
  pages: { Page: number }[],
): { pageNumber: number; spreadHalf: 0 | 1 } | null {
  if (
    !Number.isInteger(bookmarkPage) ||
    bookmarkPage <= 1 ||
    bookmarkPage > pages.length
  )
    return null
  return bookmarkPage % 2 === 0
    ? { pageNumber: bookmarkPage - 1, spreadHalf: 1 }
    : { pageNumber: bookmarkPage, spreadHalf: 0 }
}

export const MOBILE_BOOK_EDGE_TAP_PX = 50
