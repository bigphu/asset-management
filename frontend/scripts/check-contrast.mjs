// WCAG contrast gate for the design tokens. Run: npm run check:contrast
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(join(here, '../src/styles/tokens.css'), 'utf8')
const tokens = Object.fromEntries(
  [...css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]),
)
const t = (n) => {
  if (!tokens[n]) throw new Error(`missing token --${n}`)
  return tokens[n]
}
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const L = (h) => {
  const n = parseInt(h.slice(1), 16)
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
}
const ratio = (a, b) => {
  const [hi, lo] = [L(a), L(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const CHECKS = [
  ['accent fill + contrast text', 'color-accent-contrast', 'color-accent', 4.5],
  ['accent hover fill + contrast text', 'color-accent-contrast', 'color-accent-hover', 4.5],
  ['accent text on surface', 'color-accent', 'color-surface', 4.5],
  ['accent text on accent-soft', 'color-accent', 'color-accent-soft', 4.5],
  ['table head label on inverse', 'color-inverse-text-muted', 'color-inverse-bg', 4.5],
  ['table head hover on inverse', 'color-inverse-text', 'color-inverse-bg', 4.5],
  ['sort arrow on inverse', 'color-accent-on-inverse', 'color-inverse-bg', 3.0],
  ['toast text on inverse', 'color-inverse-text', 'color-inverse-bg', 4.5],
  ['chip icon on neutral', 'color-text-muted', 'color-status-neutral-bg', 3.0],
  ['status good pill', 'color-status-good-text', 'color-status-good-bg', 4.5],
  ['status warn pill', 'color-status-warn-text', 'color-status-warn-bg', 4.5],
  ['status critical pill', 'color-status-critical-text', 'color-status-critical-bg', 4.5],
  ['status neutral pill', 'color-status-neutral-text', 'color-status-neutral-bg', 4.5],
  ['body text on page bg', 'color-text', 'color-bg', 4.5],
  ['muted text on surface', 'color-text-muted', 'color-surface', 4.5],
]

let failed = 0
for (const [label, fg, bg, min] of CHECKS) {
  const got = ratio(t(fg), t(bg))
  const ok = got >= min
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(34)} ${got.toFixed(2)}:1 (min ${min})`)
}
console.log(failed ? `\n${failed} FAILING` : '\nALL PASS')
process.exit(failed ? 1 : 0)
