/** Get character count (CJK chars count as 2) */
export function getChars(str: string | null | undefined): number {
  if (!str) return 0
  let c = 0
  for (let i = 0; i < str.length; i++) {
    c += str.charCodeAt(i) < 127 ? 1 : 2
  }
  return c
}
