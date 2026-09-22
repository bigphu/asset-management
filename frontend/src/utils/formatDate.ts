/** Human-readable date for on-screen display, e.g. "14 Feb 2024". */
export function formatDateDisplay(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
