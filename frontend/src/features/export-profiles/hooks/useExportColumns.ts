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

  function move(index: number, direction: -1 | 1) {
    setColumns((cols) => {
      const target = index + direction
      if (target < 0 || target >= cols.length) return cols
      const next = [...cols]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  return { columns, reset, toggle, rename, move }
}
