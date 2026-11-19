export function isDodonfriendsHost(): boolean {
  const match = (host?: string | null) =>
    typeof host === 'string' && /(^|\.)dodonfriends\.com$/i.test(host)

  if (typeof window === 'undefined') return false
  if (match(window.location.hostname)) return true

  try {
    if (document.referrer) {
      return match(new URL(document.referrer).hostname)
    }
  } catch {
  }
  return false
}
