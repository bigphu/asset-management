/**
 * Rows-per-page choices for the inventory table (S-02: "page size
 * selectable"), and the viewer's last choice, remembered in this browser.
 * The API accepts up to 500 (backend/api/dto/assets.dto.js).
 */

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 10

const STORAGE_KEY = 'inventory.pageSize'

function isOption(value: number): boolean {
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(value)
}

/** Storage can be unavailable (private mode, blocked site data); fall back to the default. */
export function loadPageSize(): number {
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY))
    return isOption(stored) ? stored : DEFAULT_PAGE_SIZE
  } catch {
    return DEFAULT_PAGE_SIZE
  }
}

export function savePageSize(pageSize: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(pageSize))
  } catch {
    // Not remembered this time; the choice still applies for the session.
  }
}
