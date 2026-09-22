import { Checkbox } from '@/components/ui'
import type { ExportColumn } from '../types'
import styles from './ColumnEditor.module.css'

export interface ColumnEditorProps {
  columns: ExportColumn[]
  onToggle: (index: number) => void
  onRename: (index: number, label: string) => void
  onMove: (index: number, direction: -1 | 1) => void
}

export function ColumnEditor({ columns, onToggle, onRename, onMove }: ColumnEditorProps) {
  return (
    <div className={styles.editor}>
      {columns.map((col, index) => (
        <div key={col.key} className={styles.row} data-excluded={!col.included || undefined}>
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
          <div className={styles.reorder}>
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMove(index, -1)}
              aria-label={`Move ${col.key} up`}
            >
              &#9650;
            </button>
            <button
              type="button"
              disabled={index === columns.length - 1}
              onClick={() => onMove(index, 1)}
              aria-label={`Move ${col.key} down`}
            >
              &#9660;
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
