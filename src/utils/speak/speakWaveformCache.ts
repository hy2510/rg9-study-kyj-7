const ORIGINAL_BUFFER_CACHE_LIMIT = 8
const originalBufferCache = new Map<string, AudioBuffer>()

export function getCachedOriginalBuffer(url: string): AudioBuffer | undefined {
  return originalBufferCache.get(url)
}

export function setCachedOriginalBuffer(
  url: string,
  buffer: AudioBuffer,
): void {
  if (originalBufferCache.has(url)) {
    originalBufferCache.delete(url)
  } else if (originalBufferCache.size >= ORIGINAL_BUFFER_CACHE_LIMIT) {
    const oldestKey = originalBufferCache.keys().next().value
    if (oldestKey !== undefined) originalBufferCache.delete(oldestKey)
  }
  originalBufferCache.set(url, buffer)
}
