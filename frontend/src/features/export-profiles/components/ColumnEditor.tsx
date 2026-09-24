import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { GripVertical } from 'lucide-react'
import { Checkbox } from '@/components/ui'
import type { ExportColumn } from '../types'
import styles from './ColumnEditor.module.css'

export interface ColumnEditorProps {
  columns: ExportColumn[]
  onToggle: (index: number) => void
  onRename: (index: number, label: string) => void
  /** Move the column at `from` so it ends up at index `to`. */
  onMove: (from: number, to: number) => void
}

/**
 * Include, rename and reorder export columns. Reordering is drag and drop on
 * the grip handle — pointer events rather than the HTML5 drag API, so it also
 * works on touch screens — and the same handle moves its row with the arrow
 * keys (Home/End for first/last) for keyboard users.
 */
export function ColumnEditor({ columns, onToggle, onRename, onMove }: ColumnEditorProps) {
  const rowRefs = useRef(new Map<string, HTMLDivElement>())
  const handleRefs = useRef(new Map<string, HTMLButtonElement>())
  const [draggingKey, setDraggingKey] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  // After a keyboard move React reorders the DOM, which can drop focus from
  // the moved handle; this puts it back.
  const refocusKey = useRef<string | null>(null)

  useEffect(() => {
    if (!refocusKey.current) return
    handleRefs.current.get(refocusKey.current)?.focus()
    refocusKey.current = null
  }, [columns])

  function announce(key: string, to: number) {
    setAnnouncement(`${key} moved to position ${to + 1} of ${columns.length}.`)
  }

  function handlePointerDown(e: PointerEvent<HTMLButtonElement>, key: string) {
    if (e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDraggingKey(key)
  }

  function handlePointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (!draggingKey) return
    const from = columns.findIndex((c) => c.key === draggingKey)
    // The row under the pointer is where the dragged row goes: once the
    // pointer crosses another row's midpoint the two swap places.
    let to = from
    columns.forEach((col, i) => {
      if (i === from) return
      const rect = rowRefs.current.get(col.key)?.getBoundingClientRect()
      if (!rect) return
      const mid = rect.top + rect.height / 2
      if (i < from && e.clientY < mid) to = Math.min(to, i)
      if (i > from && e.clientY > mid) to = Math.max(to, i)
    })
    if (to !== from) onMove(from, to)
  }

  function handlePointerEnd() {
    if (!draggingKey) return
    announce(draggingKey, columns.findIndex((c) => c.key === draggingKey))
    setDraggingKey(null)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number, key: string) {
    const targets: Record<string, number> = {
      ArrowUp: index - 1,
      ArrowDown: index + 1,
      Home: 0,
      End: columns.length - 1,
    }
    if (!(e.key in targets)) return
    e.preventDefault()
    const to = targets[e.key]
    if (to < 0 || to >= columns.length || to === index) return
    refocusKey.current = key
    onMove(index, to)
    announce(key, to)
  }

  return (
    <div className={styles.editor}>
      {columns.map((col, index) => (
        <div
          key={col.key}
          ref={(el) => {
            if (el) rowRefs.current.set(col.key, el)
            else rowRefs.current.delete(col.key)
          }}
          className={styles.row}
          data-excluded={!col.included || undefined}
          data-dragging={draggingKey === col.key || undefined}
        >
          <button
            type="button"
            ref={(el) => {
              if (el) handleRefs.current.set(col.key, el)
              else handleRefs.current.delete(col.key)
            }}
            className={styles.handle}
            aria-label={`Reorder ${col.key}, position ${index + 1} of ${columns.length}`}
            aria-describedby="column-editor-help"
            onPointerDown={(e) => handlePointerDown(e, col.key)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onKeyDown={(e) => handleKeyDown(e, index, col.key)}
          >
            <GripVertical size={16} aria-hidden="true" />
          </button>
          <Checkbox
            checked={col.included}
            onChange={() => onToggle(index)}
            aria-label={`Include ${col.key} column`}
          />
          <span className={styles.key}>{col.key}</span>
          <input
            className={styles.labelInput}
            type="text"
            value={col.label}
            onChange={(e) => onRename(index, e.target.value)}
            aria-label={`Header label for ${col.key}`}
          />
        </div>
      ))}

      <span id="column-editor-help" className={styles.srOnly}>
        Drag to reorder, or use the up and down arrow keys.
      </span>
      <span className={styles.srOnly} aria-live="polite">
        {announcement}
      </span>
    </div>
  )
}
