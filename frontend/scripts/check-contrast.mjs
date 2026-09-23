// WCAG contrast gate for the design tokens. Run: npm run check:contrast
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(join(here, '../src/styles/tokens.css'), 'utf8')
const literals = Object.fromEntries(
  [...css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]),
)
// Role tokens are aliases (--md-primary: var(--color-accent)), so resolve the
// chain — otherwise this gate can only see the palette, never the roles that
// components actually reference.
const aliases = Object.fromEntries(
  [...css.matchAll(/--([a-z0-9-]+):\s*var\(--([a-z0-9-]+)\)/g)].map((m) => [m[1], m[2]]),
)
const t = (n, depth = 0) => {
  if (literals[n]) return literals[n]
  if (aliases[n] && depth < 10) return t(aliases[n], depth + 1)
  throw new Error(`cannot resolve --${n} to a color`)
}
const opacity = (n) => {
  const m = css.split(String.fromCharCode(10)).find((row) => row.trim().startsWith('--' + n + ':'))
  if (!m) throw new Error(`missing opacity token --${n}`)
  return parseFloat(m.split(':')[1])
}
// Flatten fg at `a` opacity over bg, the way a state layer or a
// color-mix(..., transparent) disabled fill actually renders.
const over = (fg, bg, a) => {
  const px = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const [f, b] = [px(fg), px(bg)]
  return '#' + f.map((c, i) => Math.round(c * a + b[i] * (1 - a)).toString(16).padStart(2, '0')).join('')
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

// Role-level pairings: the names components actually reference.
const ROLE_CHECKS = [
  ['on-primary on primary', 'md-on-primary', 'md-primary', 4.5],
  ['on-surface on surface', 'md-on-surface', 'md-surface', 4.5],
  ['on-surface-variant on surface', 'md-on-surface-variant', 'md-surface', 4.5],
  ['on-surface on surface-container', 'md-on-surface', 'md-surface-container', 4.5],
  ['error on surface', 'md-error', 'md-surface', 4.5],
  ['inverse-on-surface on inverse-surface', 'md-inverse-on-surface', 'md-inverse-surface', 4.5],
  ['inverse-primary on inverse-surface', 'md-inverse-primary', 'md-inverse-surface', 3.0],
  ['outline on surface', 'md-outline', 'md-surface', 3.0],
]

// Composite states. These are NOT WCAG text gates: disabled controls are exempt
// from SC 1.4.11, and a hover layer only has to be perceptible. The floors catch
// a future palette change that makes a state vanish altogether.
function compositeChecks() {
  const surface = t('md-surface')
  const onSurface = t('md-on-surface')
  const disabledContainer = over(onSurface, surface, opacity('md-state-disabled-container'))
  const disabledLabel = over(onSurface, disabledContainer, opacity('md-state-disabled-content'))
  const hoverLayer = over(onSurface, surface, opacity('md-state-hover'))
  return [
    ['disabled container vs surface', ratio(disabledContainer, surface), 1.1],
    ['disabled label vs its container', ratio(disabledLabel, disabledContainer), 2.0],
    ['row hover layer vs surface', ratio(hoverLayer, surface), 1.05],
    ['menu surface-container vs surface', ratio(t('md-surface-container'), surface), 1.05],
  ]
}

let failed = 0
function line(ok, kind, label, got, min) {
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${kind} ${label.padEnd(38)} ${got.toFixed(2)}:1 (min ${min})`)
}
for (const [label, fg, bg, min] of CHECKS) {
  const got = ratio(t(fg), t(bg))
  line(got >= min, 'AA   ', label, got, min)
}
for (const [label, fg, bg, min] of ROLE_CHECKS) {
  const got = ratio(t(fg), t(bg))
  line(got >= min, 'ROLE ', label, got, min)
}
for (const [label, got, min] of compositeChecks()) {
  line(got >= min, 'STATE', label, got, min)
}
console.log(failed ? `\n${failed} FAILING` : '\nALL PASS')
process.exit(failed ? 1 : 0)