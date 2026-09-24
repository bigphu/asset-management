import { useState } from 'react'
import type { ExportColumn } from '../types'

/** Local working state for the column editor — select, rename, reorder. */
export function useExportColumns(initial: ExportColumn[]) {
  const [columns, setColumns] = useState<ExportColumn[]>(initial)

  function reset(next: ExportColumn[]) {
    setColumns(next)
  }

  function toggle(index: number) {
    setColumns((cols) => cols.map((c, i) => (i === index ? { ...c, included: !c.included } : c)))
  }

  function rename(index: number, label: string) {
    setColumns((cols) => cols.map((c, i) => (i === index ? { ...c, label } : c)))
  }

  /** Take the column at `from` out and reinsert it at `to`. */
  function move(from: number, to: number) {
    setColumns((cols) => {
      if (from === to || to < 0 || to >= cols.length) return cols
      const next = [...cols]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  return { columns, reset, toggle, rename, move }
}
