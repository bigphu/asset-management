import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { saveFile } from '@/utils/saveFile'
import type { ExportColumn, ExportDateFormat, ExportScope } from '../types'

// Excel export (S-03). The server builds the file (ADR-0006) from every row
// matching the scope's filters (ADR-0008) and returns it in the response
// body (ADR-0007). Contract: backend/api/routes/exports.js, /api/docs.

export interface ExportRequest extends ExportScope {
  columns: ExportColumn[]
  dateFormat: ExportDateFormat
}

export interface ExportResult {
  filename: string
  rowCount: number
}

async function exportAssets(request: ExportRequest): Promise<ExportResult> {
  const fallbackName = `inventory-export-${new Date().toISOString().slice(0, 10)}.xlsx`
  const { blob, filename, headers } = await apiClient.download('/exports/assets', request, fallbackName)
  saveFile(blob, filename)
  return { filename, rowCount: Number(headers.get('X-Export-Row-Count') ?? 0) }
}

export function useExportAssetsMutation() {
  return useMutation({ mutationFn: exportAssets })
}
