export type PageSlot = number | 'gap-start' | 'gap-end'

/**
 * Page numbers to render: always the first and last, plus `siblings` pages
 * either side of the current one, with a gap marker where pages are skipped —
 * e.g. 1 … 4 5 6 … 20. A gap is only used when it hides at least two pages;
 * hiding one would take as much room as the number itself.
 */
export function pageSlots(page: number, pageCount: number, siblings = 1): PageSlot[] {
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

  // first + last + current + siblings on both sides + two gaps
  const maxSlots = 2 * siblings + 5
  if (pageCount <= maxSlots) return range(1, pageCount)

  // Near an end only one gap is needed; the pages it frees go to that end, so
  // the row always holds `maxSlots` items and never shifts width.
  const edgeRun = maxSlots - 2
  if (page <= edgeRun - siblings) return [...range(1, edgeRun), 'gap-end', pageCount]
  if (page >= pageCount - edgeRun + 1 + siblings) {
    return [1, 'gap-start', ...range(pageCount - edgeRun + 1, pageCount)]
  }
  return [1, 'gap-start', ...range(page - siblings, page + siblings), 'gap-end', pageCount]
}
