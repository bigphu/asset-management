# Material Design 3 Adoption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the 15 hand-rolled components in `frontend/src/components/ui/` to follow Material Design 3, driven by new M3 system tokens layered over the existing palette.

**Architecture:** Additive token groups (shape, elevation, state, type scale) plus a role-alias layer sit in `tokens.css`. A single shared CSS-module class provides M3 state layers, which every interactive component composes. Components are restyled one per task against M3 role names, so a later swap to generated tonal palettes touches only `tokens.css`.

**Tech Stack:** React 19, Vite 8, TypeScript, CSS Modules, no UI runtime dependency. Verification is two Node scripts (no test framework exists in this repo) plus `tsc`, `vite build`, and `oxlint`.

**Spec:** `docs/superpowers/specs/2026-09-23-material-design-3-adoption-design.md`

## Global Constraints

- No new runtime dependencies. Verification scripts are Node-only, dev-time.
- No changes to component markup, props, or behavior. `Button` keeps exactly `primary | outline | ghost | ghost-accent` and `md | sm`; no `tonal` variant is added.
- No changes to the four status color pairs (`--color-status-*`).
- No existing token is removed or renamed until Task 15.
- Every component CSS file must reference color and radius only through tokens — no raw hex, no `rgba(`, no literal `px` border-radius.
- State-layer opacities are exactly: hover `0.08`, focus `0.10`, pressed `0.10`, dragged `0.16`, disabled content `0.38`, disabled container `0.12`.
- Shape scale is exactly: xs `4px`, sm `8px`, md `12px`, lg `16px`, xl `28px`, full `999px`.
- Deliberate deviations from M3, per the spec, are preserved: dark table header, system font stack, table density -1, no origin-based ripple.
- `color-mix(in srgb, ...)` is used for disabled states. This requires Chrome/Edge 111+, Firefox 113+, Safari 16.2+. Accepted.

## Review Focus

Five failure modes the spec implies but no task's happy path exercises. Each has a test pinned to the task that owns the code.

1. **Disabled filled button becomes invisible.** At 12% container and 38% content over a white surface, a disabled primary button can wash out to near-nothing. Task 3 asserts the composite stays distinguishable from the page background.
2. **State layer swallows the focus ring.** The global `:focus-visible` outline in `global.css` must still be visible; a `::before` at `inset: 0` plus `overflow: hidden` can clip it. Task 3 asserts the outline is not clipped and that keyboard focus remains visible.
3. **State layer paints over content.** `::before` is a later sibling in paint order, so without `isolation`/stacking care it covers the label. Task 3 asserts the label stays above the layer.
4. **Toolbar overflow at the 900px breakpoint.** 40px pill buttons with 24px padding are wider than today's 33px buttons; the Inventory toolbar holds three controls plus a search field. Task 13 asserts no horizontal overflow at 900px.
5. **Select-all checkbox loses its indeterminate state.** `appearance: none` removes the native control entirely, including the indeterminate dash that `Table`'s header checkbox relies on. Task 6 asserts checked *and* indeterminate both render a visible mark.

---

### Task 1: Verification scripts

The test cycle every later task depends on. Nothing here changes any styling.

**Files:**
- Create: `frontend/scripts/check-contrast.mjs`
- Create: `frontend/scripts/check-m3.mjs`
- Modify: `frontend/package.json` (add `check:contrast`, `check:m3`, `check` scripts)

**Interfaces:**
- Consumes: nothing.
- Produces: `npm run check:contrast` and `npm run check:m3`, both exiting non-zero on failure. `check-m3.mjs` exports nothing; it reads a `RULES` object keyed by CSS file path, where each rule is `{ file, requires: string[], forbids: RegExp[] }`. Later tasks add entries to `RULES`.

- [ ] **Step 1: Write the contrast checker**

Create `frontend/scripts/check-contrast.mjs`:

```js
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
```

- [ ] **Step 2: Write the M3 rule checker**

Create `frontend/scripts/check-m3.mjs`. `RULES` starts empty; each later task adds one entry.

```js
// Static M3 conformance gate for component CSS. Run: npm run check:m3
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const src = (p) => join(here, '../src', p)

// Applied to every file listed in RULES.
const GLOBAL_FORBIDS = [
  [/#[0-9a-fA-F]{3,8}\b/, 'raw hex color'],
  [/rgba?\(/, 'raw rgb/rgba color'],
  [/border-radius:\s*\d/, 'literal border-radius (use a --md-shape-* token)'],
]

export const RULES = [
  // Task N appends: { file: 'components/ui/X/X.module.css', requires: [...], forbids: [...] }
]

let totalFailures = 0
for (const rule of RULES) {
  const problems = []
  const path = src(rule.file)
  if (!existsSync(path)) {
    problems.push('file not found')
  } else {
    const css = readFileSync(path, 'utf8')
    // tokens.css legitimately declares raw color values; every other file must not.
    if (rule.file !== 'styles/tokens.css') {
      for (const [pattern, why] of GLOBAL_FORBIDS) {
        if (pattern.test(css)) problems.push(`contains ${why}`)
      }
    }
    for (const needle of rule.requires ?? []) {
      if (!css.includes(needle)) problems.push(`missing required: ${needle}`)
    }
    for (const [pattern, why] of rule.forbids ?? []) {
      if (pattern.test(css)) problems.push(why)
    }
  }
  if (problems.length === 0) {
    console.log(`PASS  ${rule.file}`)
  } else {
    for (const p of problems) console.log(`FAIL  ${rule.file} — ${p}`)
    totalFailures += problems.length
  }
}
console.log(totalFailures ? `\n${totalFailures} FAILING` : `\n${RULES.length} file(s) conform`)
process.exit(totalFailures ? 1 : 0)
```

- [ ] **Step 3: Add npm scripts**

In `frontend/package.json`, inside `"scripts"`:

```json
"check:contrast": "node scripts/check-contrast.mjs",
"check:m3": "node scripts/check-m3.mjs",
"check": "tsc --noEmit && npm run check:contrast && npm run check:m3 && npm run build"
```

- [ ] **Step 4: Run both to verify they pass against today's code**

Run: `cd frontend && npm run check:contrast && npm run check:m3`
Expected: 15 PASS lines then `ALL PASS`; then `0 file(s) conform` (RULES is empty) and exit 0.

- [ ] **Step 5: Commit**

```bash
git add frontend/scripts frontend/package.json
git commit -m "chore: add contrast and M3 conformance check scripts"
```

---

### Task 2: M3 system tokens

**Files:**
- Modify: `frontend/src/styles/tokens.css`

**Interfaces:**
- Consumes: existing `--color-*` tokens.
- Produces: `--md-shape-{xs,sm,md,lg,xl,full}`, `--md-elevation-{0..5}`, `--md-state-{hover,focus,pressed,dragged,disabled-content,disabled-container}`, type-scale quads `--md-{headline-sm,title-lg,title-md,title-sm,body-lg,body-md,body-sm,label-lg,label-md}-{size,line,tracking,weight}`, and role aliases `--md-{primary,on-primary,primary-container,on-primary-container,surface,surface-container,on-surface,on-surface-variant,outline,outline-variant,error,error-container,inverse-surface,inverse-on-surface,inverse-primary,scrim}`.

- [ ] **Step 1: Write the failing check**

In `frontend/scripts/check-m3.mjs`, replace the empty `RULES` array with:

```js
export const RULES = [
  {
    file: 'styles/tokens.css',
    requires: [
      '--md-shape-xs: 4px', '--md-shape-sm: 8px', '--md-shape-md: 12px',
      '--md-shape-lg: 16px', '--md-shape-xl: 28px', '--md-shape-full: 999px',
      '--md-elevation-0', '--md-elevation-1', '--md-elevation-2',
      '--md-elevation-3', '--md-elevation-4', '--md-elevation-5',
      '--md-state-hover: 0.08', '--md-state-focus: 0.1', '--md-state-pressed: 0.1',
      '--md-state-dragged: 0.16', '--md-state-disabled-content: 0.38',
      '--md-state-disabled-container: 0.12',
      '--md-label-lg-size: 14px', '--md-body-md-size: 14px', '--md-title-lg-size: 22px',
      '--md-primary:', '--md-on-primary:', '--md-outline-variant:', '--md-scrim:',
    ],
  },
]
```

`tokens.css` is already exempt from the global forbids — Task 1's checker skips them for that one path, because it is the one file whose job is to declare raw color values.

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL lines listing every missing `--md-*` token, exit 1.

- [ ] **Step 3: Add the token groups**

Append to the `:root` block in `frontend/src/styles/tokens.css`, before the closing brace:

```css
  /* ---- Material Design 3: shape scale ---- */
  --md-shape-xs: 4px;
  --md-shape-sm: 8px;
  --md-shape-md: 12px;
  --md-shape-lg: 16px;
  --md-shape-xl: 28px;
  --md-shape-full: 999px;

  /* ---- Material Design 3: elevation ---- */
  --md-elevation-0: none;
  --md-elevation-1: 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
  --md-elevation-2: 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15);
  --md-elevation-3: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.3);
  --md-elevation-4: 0 6px 10px 4px rgba(0, 0, 0, 0.15), 0 2px 3px 0 rgba(0, 0, 0, 0.3);
  --md-elevation-5: 0 8px 12px 6px rgba(0, 0, 0, 0.15), 0 4px 4px 0 rgba(0, 0, 0, 0.3);

  /* ---- Material Design 3: state layer opacities ---- */
  --md-state-hover: 0.08;
  --md-state-focus: 0.1;
  --md-state-pressed: 0.1;
  --md-state-dragged: 0.16;
  --md-state-disabled-content: 0.38;
  --md-state-disabled-container: 0.12;

  /* ---- Material Design 3: type scale ----
     Applied to the existing system font stack; M3 permits brand fonts. */
  --md-headline-sm-size: 24px;
  --md-headline-sm-line: 32px;
  --md-headline-sm-tracking: 0;
  --md-headline-sm-weight: 400;

  --md-title-lg-size: 22px;
  --md-title-lg-line: 28px;
  --md-title-lg-tracking: 0;
  --md-title-lg-weight: 400;

  --md-title-md-size: 16px;
  --md-title-md-line: 24px;
  --md-title-md-tracking: 0.15px;
  --md-title-md-weight: 500;

  --md-title-sm-size: 14px;
  --md-title-sm-line: 20px;
  --md-title-sm-tracking: 0.1px;
  --md-title-sm-weight: 500;

  --md-body-lg-size: 16px;
  --md-body-lg-line: 24px;
  --md-body-lg-tracking: 0.5px;
  --md-body-lg-weight: 400;

  --md-body-md-size: 14px;
  --md-body-md-line: 20px;
  --md-body-md-tracking: 0.25px;
  --md-body-md-weight: 400;

  --md-body-sm-size: 12px;
  --md-body-sm-line: 16px;
  --md-body-sm-tracking: 0.4px;
  --md-body-sm-weight: 400;

  --md-label-lg-size: 14px;
  --md-label-lg-line: 20px;
  --md-label-lg-tracking: 0.1px;
  --md-label-lg-weight: 500;

  --md-label-md-size: 12px;
  --md-label-md-line: 16px;
  --md-label-md-tracking: 0.5px;
  --md-label-md-weight: 500;

  /* ---- Material Design 3: color roles ----
     Components reference these, never the palette tokens directly, so a future
     tonal palette can be swapped in here without touching any component. */
  --md-primary: var(--color-accent);
  --md-on-primary: var(--color-accent-contrast);
  --md-primary-container: var(--color-accent-soft);
  --md-on-primary-container: var(--color-accent);
  --md-surface: var(--color-surface);
  --md-surface-container: var(--color-status-neutral-bg);
  --md-on-surface: var(--color-text);
  --md-on-surface-variant: var(--color-text-muted);
  --md-outline: var(--color-border-strong);
  --md-outline-variant: var(--color-border);
  --md-error: var(--color-status-critical-text);
  --md-error-container: var(--color-status-critical-bg);
  --md-inverse-surface: var(--color-inverse-bg);
  --md-inverse-on-surface: var(--color-inverse-text);
  --md-inverse-on-surface-variant: var(--color-inverse-text-muted);
  --md-inverse-primary: var(--color-accent-on-inverse);
  --md-scrim: rgba(17, 24, 39, 0.32);
```

- [ ] **Step 4: Run the checks to verify they pass**

Run: `cd frontend && npm run check:m3 && npm run check:contrast && npm run build`
Expected: `1 file(s) conform`, `ALL PASS`, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles/tokens.css frontend/scripts/check-m3.mjs
git commit -m "feat: add M3 shape, elevation, state, type scale and role tokens"
```

---

### Task 3: State-layer utility and Button

Owns Review Focus items 1, 2 and 3.

**Files:**
- Create: `frontend/src/styles/state-layer.module.css`
- Modify: `frontend/src/components/ui/Button/Button.module.css` (full rewrite)
- Modify: `frontend/scripts/check-m3.mjs` (append two RULES entries)

**Interfaces:**
- Consumes: all `--md-*` tokens from Task 2.
- Produces: the class `stateLayer` in `src/styles/state-layer.module.css`, composed by every later interactive component as
  `composes: stateLayer from '../../../styles/state-layer.module.css';`
  (that relative path is correct from any `components/ui/<Name>/` directory).

- [ ] **Step 1: Write the failing check**

Append to `RULES` in `frontend/scripts/check-m3.mjs`:

```js
  {
    file: 'styles/state-layer.module.css',
    requires: [
      '.stateLayer',
      'isolation: isolate',
      'background: currentColor',
      'var(--md-state-hover)',
      'var(--md-state-focus)',
      'var(--md-state-pressed)',
      'z-index: 0',
    ],
  },
  {
    file: 'components/ui/Button/Button.module.css',
    requires: [
      'composes: stateLayer from',
      'height: 40px',
      'var(--md-shape-full)',
      'var(--md-label-lg-size)',
      'var(--md-state-disabled-content)',
      'var(--md-state-disabled-container)',
      'var(--md-elevation-0)',
    ],
    forbids: [
      [/translateY/, 'M3 uses state layers, not a translate on press'],
      [/opacity:\s*0\.5/, 'disabled must use 0.38 content / 0.12 container, not 0.5'],
    ],
  },
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL — `styles/state-layer.module.css — file not found`, plus Button missing/forbidden lines. Exit 1.

- [ ] **Step 3: Create the state-layer utility**

Create `frontend/src/styles/state-layer.module.css`:

```css
/*
 * Material Design 3 state layer.
 * Composed by every interactive component. The layer is a ::before overlay
 * tinted with currentColor at the spec opacity, which is what makes hover,
 * focus and press read as Material rather than as a background swap.
 *
 * Content must stay above the layer, so children are lifted to z-index 1.
 */
.stateLayer {
  position: relative;
  isolation: isolate;
  cursor: pointer;
}

.stateLayer::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast);
}

.stateLayer > * {
  position: relative;
  z-index: 1;
}

.stateLayer:hover:not(:disabled)::before {
  opacity: var(--md-state-hover);
}

.stateLayer:focus-visible:not(:disabled)::before {
  opacity: var(--md-state-focus);
}

.stateLayer:active:not(:disabled)::before {
  opacity: var(--md-state-pressed);
}

/* The global :focus-visible outline must remain visible, so the layer never
   clips it — no overflow: hidden here, and outline-offset keeps it outside. */
.stateLayer:focus-visible {
  outline-offset: 2px;
}
```

- [ ] **Step 4: Rewrite Button**

Replace the entire contents of `frontend/src/components/ui/Button/Button.module.css`:

```css
.button {
  composes: stateLayer from '../../../styles/state-layer.module.css';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: var(--md-shape-full);
  background: transparent;
  color: var(--md-on-surface);
  box-shadow: var(--md-elevation-0);
  font-size: var(--md-label-lg-size);
  line-height: var(--md-label-lg-line);
  letter-spacing: var(--md-label-lg-tracking);
  font-weight: var(--md-label-lg-weight);
  white-space: nowrap;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.button:disabled {
  cursor: not-allowed;
  color: color-mix(in srgb, var(--md-on-surface) calc(var(--md-state-disabled-content) * 100%), transparent);
}

/* Sizes — sm is M3 density -2 for dense toolbars. */
.md {
  height: 40px;
}

.sm {
  height: 32px;
  padding: 0 16px;
  font-size: var(--md-label-md-size);
  line-height: var(--md-label-md-line);
  letter-spacing: var(--md-label-md-tracking);
}

/* Filled button */
.primary {
  background: var(--md-primary);
  color: var(--md-on-primary);
}

.primary:disabled {
  background: color-mix(in srgb, var(--md-on-surface) calc(var(--md-state-disabled-container) * 100%), transparent);
}

/* Outlined button */
.outline {
  border: 1px solid var(--md-outline);
  color: var(--md-primary);
}

.outline:disabled {
  border-color: color-mix(in srgb, var(--md-on-surface) calc(var(--md-state-disabled-container) * 100%), transparent);
}

/* Text buttons — 12px padding per M3 */
.ghost {
  padding: 0 12px;
  color: var(--md-on-surface);
}

.ghost-accent {
  padding: 0 12px;
  color: var(--md-primary);
}
```

- [ ] **Step 5: Run the check to verify it passes**

Run: `cd frontend && npm run check:m3 && npm run build`
Expected: all listed files conform; build succeeds.

- [ ] **Step 6: Verify the three Review Focus behaviors in a browser**

Start the dev server (`npm run dev`), open any page with buttons, and confirm by inspection:

1. A disabled `primary` button is still visibly a button against the page background — its container is `on-surface @ 12%`, not transparent.
2. Tab to a button: the global 2px accent outline is visible and not clipped.
3. Button labels render above the state layer on hover, not behind a tint.

Record the outcome. If (1) fails, raise it rather than patching opacity — the spec's 12%/38% values are normative and a failure here is a spec problem.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/styles/state-layer.module.css frontend/src/components/ui/Button/Button.module.css frontend/scripts/check-m3.mjs
git commit -m "feat: add M3 state layer utility and restyle Button"
```

---

### Task 4: IconButton

**Files:**
- Modify: `frontend/src/components/ui/IconButton/IconButton.module.css` (full rewrite)
- Modify: `frontend/scripts/check-m3.mjs`

**Interfaces:**
- Consumes: `stateLayer` from Task 3.
- Produces: nothing other components depend on.

- [ ] **Step 1: Write the failing check**

Append to `RULES`:

```js
  {
    file: 'components/ui/IconButton/IconButton.module.css',
    requires: [
      'composes: stateLayer from',
      'width: 40px',
      'height: 40px',
      'var(--md-shape-full)',
      'var(--md-on-surface-variant)',
    ],
  },
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL for `IconButton.module.css` — missing `composes`, `width: 40px`, `--md-shape-full`.

- [ ] **Step 3: Rewrite IconButton**

Replace the entire contents of `frontend/src/components/ui/IconButton/IconButton.module.css`:

```css
/* M3 standard icon button: 40px container, 24px icon, full-round state layer. */
.iconButton {
  composes: stateLayer from '../../../styles/state-layer.module.css';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--md-shape-full);
  background: transparent;
  color: var(--md-on-surface-variant);
  box-shadow: var(--md-elevation-0);
  transition: color var(--transition-fast);
}

.iconButton svg {
  width: 24px;
  height: 24px;
}

.iconButton:disabled {
  cursor: not-allowed;
  color: color-mix(in srgb, var(--md-on-surface) calc(var(--md-state-disabled-content) * 100%), transparent);
}

.danger {
  color: var(--md-error);
}
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `cd frontend && npm run check:m3 && npm run build`
Expected: conform, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/IconButton frontend/scripts/check-m3.mjs
git commit -m "feat: restyle IconButton to M3 standard icon button"
```

---

### Task 5: Input, Select and FormField

M3 outlined text field. These three ship together because `FormField` supplies the label and supporting text that the field spec defines.

**Files:**
- Modify: `frontend/src/components/ui/Input/Input.module.css` (full rewrite)
- Modify: `frontend/src/components/ui/Select/Select.module.css` (full rewrite)
- Modify: `frontend/src/components/ui/FormField/FormField.module.css` (full rewrite)
- Modify: `frontend/scripts/check-m3.mjs`

**Interfaces:**
- Consumes: `--md-*` tokens.
- Produces: nothing other components depend on.

- [ ] **Step 1: Write the failing check**

Append to `RULES`:

```js
  {
    file: 'components/ui/Input/Input.module.css',
    requires: ['height: 56px', 'var(--md-shape-xs)', 'var(--md-outline)', 'var(--md-body-lg-size)'],
  },
  {
    file: 'components/ui/Select/Select.module.css',
    requires: ['height: 56px', 'var(--md-shape-xs)', 'var(--md-outline)'],
  },
  {
    file: 'components/ui/FormField/FormField.module.css',
    requires: ['var(--md-body-sm-size)', 'var(--md-on-surface-variant)'],
  },
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL for all three files.

- [ ] **Step 3: Rewrite Input**

Replace `frontend/src/components/ui/Input/Input.module.css`:

```css
/* M3 outlined text field. */
.input {
  width: 100%;
  height: 56px;
  padding: 0 16px;
  border: 1px solid var(--md-outline);
  border-radius: var(--md-shape-xs);
  background: var(--md-surface);
  color: var(--md-on-surface);
  font-size: var(--md-body-lg-size);
  line-height: var(--md-body-lg-line);
  letter-spacing: var(--md-body-lg-tracking);
  transition: border-color var(--transition-fast);
}

.input:hover:not(:disabled) {
  border-color: var(--md-on-surface);
}

.input:focus {
  border: 2px solid var(--md-primary);
  padding: 0 15px; /* keep text from shifting when the outline thickens */
  outline: none;
}

.input::placeholder {
  color: var(--md-on-surface-variant);
}

.input:disabled {
  border-color: color-mix(in srgb, var(--md-on-surface) calc(var(--md-state-disabled-container) * 100%), transparent);
  color: color-mix(in srgb, var(--md-on-surface) calc(var(--md-state-disabled-content) * 100%), transparent);
}
```

- [ ] **Step 4: Rewrite Select**

Replace `frontend/src/components/ui/Select/Select.module.css`:

```css
/* M3 outlined text field with a trailing indicator. */
.select {
  height: 56px;
  min-width: 118px;
  padding: 0 16px;
  border: 1px solid var(--md-outline);
  border-radius: var(--md-shape-xs);
  background: var(--md-surface);
  color: var(--md-on-surface);
  font-size: var(--md-body-lg-size);
  line-height: var(--md-body-lg-line);
  letter-spacing: var(--md-body-lg-tracking);
  transition: border-color var(--transition-fast);
}

.select:hover:not(:disabled) {
  border-color: var(--md-on-surface);
}

.select:focus {
  border: 2px solid var(--md-primary);
  padding: 0 15px;
  outline: none;
}

.select:disabled {
  border-color: color-mix(in srgb, var(--md-on-surface) calc(var(--md-state-disabled-container) * 100%), transparent);
  color: color-mix(in srgb, var(--md-on-surface) calc(var(--md-state-disabled-content) * 100%), transparent);
}
```

- [ ] **Step 5: Rewrite FormField**

Replace `frontend/src/components/ui/FormField/FormField.module.css`:

```css
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* M3 text field label */
.label {
  font-size: var(--md-body-sm-size);
  line-height: var(--md-body-sm-line);
  letter-spacing: var(--md-body-sm-tracking);
  font-weight: var(--md-body-sm-weight);
  color: var(--md-on-surface-variant);
}

/* M3 supporting text — 16px inset to align with the field's text baseline */
.hint {
  padding: 0 16px;
  font-size: var(--md-body-sm-size);
  line-height: var(--md-body-sm-line);
  letter-spacing: var(--md-body-sm-tracking);
  color: var(--md-on-surface-variant);
}
```

- [ ] **Step 6: Run the check to verify it passes**

Run: `cd frontend && npm run check:m3 && npm run build`
Expected: conform, build succeeds.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/ui/Input frontend/src/components/ui/Select frontend/src/components/ui/FormField frontend/scripts/check-m3.mjs
git commit -m "feat: restyle Input, Select and FormField as M3 outlined text fields"
```

---

### Task 6: Checkbox

Owns Review Focus item 5.

**Files:**
- Modify: `frontend/src/components/ui/Checkbox/Checkbox.module.css` (full rewrite)
- Modify: `frontend/scripts/check-m3.mjs`

**Interfaces:**
- Consumes: `--md-*` tokens. Markup stays a native `<input type="checkbox">`.
- Produces: nothing other components depend on.

- [ ] **Step 1: Write the failing check**

Append to `RULES`:

```js
  {
    file: 'components/ui/Checkbox/Checkbox.module.css',
    requires: [
      'appearance: none',
      'width: 18px',
      'var(--md-primary)',
      ':checked',
      ':indeterminate',
    ],
  },
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL for `Checkbox.module.css` — missing `appearance: none`, `:checked`, `:indeterminate`.

- [ ] **Step 3: Rewrite Checkbox**

Replace `frontend/src/components/ui/Checkbox/Checkbox.module.css`. `appearance: none` removes the native control, so checked *and* indeterminate both need drawing — `Table`'s select-all header relies on indeterminate.

```css
/* M3 checkbox: 18px box, 2px radius, 40px touch target via margin-free padding. */
.checkbox {
  appearance: none;
  flex: none;
  position: relative;
  width: 18px;
  height: 18px;
  margin: 0;
  border: 2px solid var(--md-on-surface-variant);
  border-radius: var(--md-shape-xs);
  background: transparent;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.checkbox:checked,
.checkbox:indeterminate {
  background: var(--md-primary);
  border-color: var(--md-primary);
}

/* Checkmark */
.checkbox:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid var(--md-on-primary);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Indeterminate dash */
.checkbox:indeterminate::after {
  content: '';
  position: absolute;
  left: 2px;
  top: 6px;
  width: 10px;
  height: 2px;
  background: var(--md-on-primary);
}

.checkbox:focus-visible {
  outline: 2px solid var(--md-primary);
  outline-offset: 2px;
}

.checkbox:disabled {
  cursor: not-allowed;
  border-color: color-mix(in srgb, var(--md-on-surface) calc(var(--md-state-disabled-content) * 100%), transparent);
}
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `cd frontend && npm run check:m3 && npm run build`
Expected: conform, build succeeds.

- [ ] **Step 5: Verify both marked states render**

With the dev server running, open Inventory and confirm: ticking one row shows a checkmark; the header select-all shows a dash when only some rows are selected, and a checkmark when all are. A blank box in either state is a failure.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ui/Checkbox frontend/scripts/check-m3.mjs
git commit -m "feat: restyle Checkbox to M3 with checked and indeterminate marks"
```

---

### Task 7: Card

**Files:**
- Modify: `frontend/src/components/ui/Card/Card.module.css` (full rewrite)
- Modify: `frontend/scripts/check-m3.mjs`

**Interfaces:** Consumes `--md-*` tokens. Produces nothing.

- [ ] **Step 1: Write the failing check**

```js
  {
    file: 'components/ui/Card/Card.module.css',
    requires: ['var(--md-shape-md)', 'var(--md-outline-variant)', 'var(--md-elevation-0)'],
  },
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL for `Card.module.css`.

- [ ] **Step 3: Rewrite Card**

Replace `frontend/src/components/ui/Card/Card.module.css`:

```css
/* M3 outlined card: elevation 0, outline-variant border, 12px corners. */
.card {
  background: var(--md-surface);
  border: 1px solid var(--md-outline-variant);
  border-radius: var(--md-shape-md);
  box-shadow: var(--md-elevation-0);
}
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `cd frontend && npm run check:m3 && npm run build`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/Card frontend/scripts/check-m3.mjs
git commit -m "feat: restyle Card as M3 outlined card"
```

---

### Task 8: Menu

**Files:**
- Modify: `frontend/src/components/ui/Menu/Menu.module.css` (full rewrite)
- Modify: `frontend/scripts/check-m3.mjs`

**Interfaces:** Consumes `stateLayer` and `--md-*`. Produces nothing.

- [ ] **Step 1: Write the failing check**

```js
  {
    file: 'components/ui/Menu/Menu.module.css',
    requires: [
      'composes: stateLayer from',
      'var(--md-elevation-2)',
      'var(--md-shape-xs)',
      'var(--md-surface-container)',
      'height: 48px',
    ],
  },
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL for `Menu.module.css`.

- [ ] **Step 3: Rewrite Menu**

Replace `frontend/src/components/ui/Menu/Menu.module.css`:

```css
.container {
  position: relative;
  display: inline-flex;
}

/* Trigger is an M3 standard icon button. */
.trigger {
  composes: stateLayer from '../../../styles/state-layer.module.css';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--md-shape-full);
  background: transparent;
  color: var(--md-on-surface-variant);
}

/* M3 menu: elevation level 2, extra-small corners, surface container. */
.menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 45;
  display: flex;
  flex-direction: column;
  min-width: 128px;
  padding: 8px 0;
  border-radius: var(--md-shape-xs);
  background: var(--md-surface-container);
  box-shadow: var(--md-elevation-2);
  text-align: left;
}

/* M3 menu item: 48px tall, 12px inset, label-large. */
.item {
  composes: stateLayer from '../../../styles/state-layer.module.css';
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 12px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--md-on-surface);
  text-align: left;
  font-size: var(--md-label-lg-size);
  line-height: var(--md-label-lg-line);
  letter-spacing: var(--md-label-lg-tracking);
  font-weight: var(--md-label-lg-weight);
}

.danger {
  color: var(--md-error);
}
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `cd frontend && npm run check:m3 && npm run build`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/Menu frontend/scripts/check-m3.mjs
git commit -m "feat: restyle Menu to M3 elevation 2 with 48px items"
```

---

### Task 9: Drawer

**Files:**
- Modify: `frontend/src/components/ui/Drawer/Drawer.module.css`
- Modify: `frontend/scripts/check-m3.mjs`

**Interfaces:** Consumes `--md-*`. Produces nothing.

- [ ] **Step 1: Write the failing check**

```js
  {
    file: 'components/ui/Drawer/Drawer.module.css',
    requires: [
      'var(--md-scrim)',
      'var(--md-elevation-1)',
      'var(--md-shape-lg)',
      'var(--md-title-lg-size)',
    ],
  },
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL for `Drawer.module.css` — it also currently contains a raw `rgba(`, which the global forbid rejects.

- [ ] **Step 3: Apply the M3 side-sheet edits**

In `frontend/src/components/ui/Drawer/Drawer.module.css`, make exactly these replacements:

`.scrim` — replace the hardcoded scrim color:

```css
  background: var(--md-scrim);
```

`.drawer` — modal side sheet is elevation level 1 with 16px leading corners:

```css
  border-left: none;
  border-top-left-radius: var(--md-shape-lg);
  border-bottom-left-radius: var(--md-shape-lg);
  box-shadow: var(--md-elevation-1);
  background: var(--md-surface);
```

`.header` — border and padding to M3:

```css
  padding: 24px;
  border-bottom: 1px solid var(--md-outline-variant);
```

`.title`:

```css
  font-size: var(--md-title-lg-size);
  line-height: var(--md-title-lg-line);
  letter-spacing: var(--md-title-lg-tracking);
  font-weight: var(--md-title-lg-weight);
```

`.description`:

```css
  margin-top: 4px;
  color: var(--md-on-surface-variant);
  font-size: var(--md-body-md-size);
  line-height: var(--md-body-md-line);
  letter-spacing: var(--md-body-md-tracking);
```

`.body`:

```css
  padding: 24px;
```

`.footer`:

```css
  padding: 16px 24px;
  border-top: 1px solid var(--md-outline-variant);
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `cd frontend && npm run check:m3 && npm run build`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/Drawer frontend/scripts/check-m3.mjs
git commit -m "feat: restyle Drawer as M3 modal side sheet"
```

---

### Task 10: Toast

**Files:**
- Modify: `frontend/src/components/ui/Toast/Toast.module.css`
- Modify: `frontend/scripts/check-m3.mjs`

**Interfaces:** Consumes `--md-*`. Produces nothing.

- [ ] **Step 1: Write the failing check**

```js
  {
    file: 'components/ui/Toast/Toast.module.css',
    requires: [
      'var(--md-inverse-surface)',
      'var(--md-inverse-on-surface)',
      'var(--md-inverse-primary)',
      'var(--md-elevation-3)',
      'var(--md-shape-xs)',
    ],
  },
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL — missing role tokens, and the two raw `rgba(` values in `.undo` trip the global forbid.

- [ ] **Step 3: Apply the M3 snackbar edits**

In `frontend/src/components/ui/Toast/Toast.module.css`:

`.toast`:

```css
  background: var(--md-inverse-surface);
  color: var(--md-inverse-on-surface);
  border-radius: var(--md-shape-xs);
  box-shadow: var(--md-elevation-3);
  min-height: 48px;
  padding: 0 8px 0 16px;
  font-size: var(--md-body-md-size);
  line-height: var(--md-body-md-line);
  letter-spacing: var(--md-body-md-tracking);
```

`.undo` — M3 snackbar action uses inverse-primary with no border:

```css
.undo {
  composes: stateLayer from '../../../styles/state-layer.module.css';
  height: 36px;
  padding: 0 12px;
  border: none;
  border-radius: var(--md-shape-full);
  background: transparent;
  color: var(--md-inverse-primary);
  font-size: var(--md-label-lg-size);
  line-height: var(--md-label-lg-line);
  letter-spacing: var(--md-label-lg-tracking);
  font-weight: var(--md-label-lg-weight);
}
```

Delete the `.undo:hover` rule — the state layer replaces it.

`.close` — M3 snackbar icon button:

```css
.close {
  composes: stateLayer from '../../../styles/state-layer.module.css';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--md-shape-full);
  background: transparent;
  color: inherit;
}
```

Delete the `.close:hover` rule.

- [ ] **Step 4: Run the check to verify it passes**

Run: `cd frontend && npm run check:m3 && npm run build`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/Toast frontend/scripts/check-m3.mjs
git commit -m "feat: restyle Toast as M3 snackbar"
```

---

### Task 11: Badge

**Files:**
- Modify: `frontend/src/components/ui/Badge/Badge.module.css`
- Modify: `frontend/scripts/check-m3.mjs`

**Interfaces:** Consumes `--md-*` and the unchanged `--color-status-*` pairs. Produces nothing.

- [ ] **Step 1: Write the failing check**

```js
  {
    file: 'components/ui/Badge/Badge.module.css',
    requires: ['var(--md-shape-sm)', 'var(--md-label-md-size)'],
  },
```

Note: this file references `--color-status-*` directly and that is correct — status colors are semantic, not role-mapped.

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL for `Badge.module.css`.

- [ ] **Step 3: Apply the M3 chip-shape edits**

In `frontend/src/components/ui/Badge/Badge.module.css`, replace the `.pill` and `.rect` rules:

```css
.pill {
  height: 24px;
  padding: 0 8px;
  border-radius: var(--md-shape-sm);
  font-size: var(--md-label-md-size);
  line-height: var(--md-label-md-line);
  letter-spacing: var(--md-label-md-tracking);
  font-weight: var(--md-label-md-weight);
  text-transform: uppercase;
}

.rect {
  height: 24px;
  padding: 0 8px;
  border-radius: var(--md-shape-sm);
  font-size: var(--md-label-md-size);
  line-height: var(--md-label-md-line);
  letter-spacing: var(--md-label-md-tracking);
  font-weight: var(--md-label-md-weight);
}
```

Leave the four tone rules untouched.

- [ ] **Step 4: Run the check to verify it passes**

Run: `cd frontend && npm run check:m3 && npm run check:contrast && npm run build`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/Badge frontend/scripts/check-m3.mjs
git commit -m "feat: restyle Badge to M3 chip shape"
```

---

### Task 12: Table

Preserves the deliberate dark-header deviation.

**Files:**
- Modify: `frontend/src/components/ui/Table/Table.module.css`
- Modify: `frontend/scripts/check-m3.mjs`

**Interfaces:** Consumes `--md-*`. Produces nothing.

- [ ] **Step 1: Write the failing check**

```js
  {
    file: 'components/ui/Table/Table.module.css',
    requires: [
      'var(--md-outline-variant)',
      'var(--md-label-lg-size)',
      'height: 44px',
      'var(--md-inverse-surface)',
    ],
  },
```

The dark header uses `--md-inverse-surface`, which Task 2 already defined. No new token is needed here.

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL for `Table.module.css`.

- [ ] **Step 3: Apply the M3 list-convention edits**

In `frontend/src/components/ui/Table/Table.module.css`:

`.container`:

```css
  border: 1px solid var(--md-outline-variant);
  border-radius: var(--md-shape-md);
```

`.thead` — the dark header is a recorded deviation from M3, kept deliberately:

```css
.thead {
  background: var(--md-inverse-surface);
}
```

`.th`:

```css
  color: var(--md-inverse-on-surface-variant);
  font-size: var(--md-label-lg-size);
  line-height: var(--md-label-lg-line);
  letter-spacing: var(--md-label-lg-tracking);
  font-weight: var(--md-label-lg-weight);
  height: 44px;
  padding: 0 16px;
  border-bottom: 1px solid var(--md-outline-variant);
  text-transform: none;
```

`.sortable:hover`:

```css
  color: var(--md-inverse-on-surface);
```

`.sortActive .sortArrow`:

```css
  color: var(--md-inverse-primary);
```

`.row`:

```css
  border-bottom: 1px solid var(--md-outline-variant);
```

`tbody tr:hover`:

```css
  background: color-mix(in srgb, var(--md-on-surface) calc(var(--md-state-hover) * 100%), transparent);
```

`.td`:

```css
  height: 44px;
  padding: 0 16px;
  font-size: var(--md-body-md-size);
  line-height: var(--md-body-md-line);
  letter-spacing: var(--md-body-md-tracking);
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `cd frontend && npm run check:m3 && npm run check:contrast && npm run build`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/Table frontend/scripts/check-m3.mjs
git commit -m "feat: restyle Table to M3 list conventions at density -1"
```

---

### Task 13: Pagination

Owns Review Focus item 4.

**Files:**
- Modify: `frontend/src/components/ui/Pagination/Pagination.module.css`
- Modify: `frontend/scripts/check-m3.mjs`

**Interfaces:** Consumes `stateLayer` and `--md-*`. Produces nothing.

- [ ] **Step 1: Write the failing check**

```js
  {
    file: 'components/ui/Pagination/Pagination.module.css',
    requires: [
      'composes: stateLayer from',
      'var(--md-shape-full)',
      'var(--md-label-lg-size)',
      'var(--md-state-disabled-content)',
    ],
    forbids: [[/opacity:\s*0\.3/, 'disabled must use 0.38 content, not 0.3']],
  },
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL for `Pagination.module.css`.

- [ ] **Step 3: Rewrite Pagination**

Replace `frontend/src/components/ui/Pagination/Pagination.module.css`:

```css
.pagination {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tabular {
  font-variant-numeric: tabular-nums;
}

/* M3 icon-button sizing so page controls match the rest of the toolbar. */
.pageBtn {
  composes: stateLayer from '../../../styles/state-layer.module.css';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 8px;
  border: none;
  border-radius: var(--md-shape-full);
  background: transparent;
  color: var(--md-on-surface-variant);
  font-size: var(--md-label-lg-size);
  line-height: var(--md-label-lg-line);
  letter-spacing: var(--md-label-lg-tracking);
  font-weight: var(--md-label-lg-weight);
}

.active {
  background: var(--md-primary);
  color: var(--md-on-primary);
}

.pageBtn:disabled {
  cursor: default;
  color: color-mix(in srgb, var(--md-on-surface) calc(var(--md-state-disabled-content) * 100%), transparent);
}
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `cd frontend && npm run check:m3 && npm run build`

- [ ] **Step 5: Verify the toolbar does not overflow at 900px**

With the dev server running, open Inventory and narrow the window to 900px. Confirm the toolbar row (New asset, Export to Excel, search field, filter select) does not produce a horizontal scrollbar and does not clip. M3 sizing makes every control taller and wider than before, and this is the densest row in the app.

If it overflows, stop and report it — the fix is a layout decision (wrap the toolbar, or drop the toolbar buttons to `size="sm"`), not something to improvise here.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ui/Pagination frontend/scripts/check-m3.mjs
git commit -m "feat: restyle Pagination to M3 icon-button sizing"
```

---

### Task 14: EmptyState and PageHeader

**Files:**
- Modify: `frontend/src/components/ui/EmptyState/EmptyState.module.css`
- Modify: `frontend/src/components/ui/PageHeader/PageHeader.module.css`
- Modify: `frontend/scripts/check-m3.mjs`

**Interfaces:** Consumes `--md-*`. Produces nothing.

- [ ] **Step 1: Write the failing check**

```js
  {
    file: 'components/ui/EmptyState/EmptyState.module.css',
    requires: ['var(--md-title-md-size)', 'var(--md-body-md-size)'],
  },
  {
    file: 'components/ui/PageHeader/PageHeader.module.css',
    requires: ['var(--md-headline-sm-size)', 'var(--md-body-md-size)'],
  },
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL for both files.

- [ ] **Step 3: Rewrite EmptyState**

Replace `frontend/src/components/ui/EmptyState/EmptyState.module.css`:

```css
.empty {
  text-align: center;
  padding: 64px 20px;
  color: var(--md-on-surface-variant);
}

.title {
  margin-bottom: 8px;
  color: var(--md-on-surface);
  font-size: var(--md-title-md-size);
  line-height: var(--md-title-md-line);
  letter-spacing: var(--md-title-md-tracking);
  font-weight: var(--md-title-md-weight);
}

.description {
  margin-bottom: var(--space-4);
  font-size: var(--md-body-md-size);
  line-height: var(--md-body-md-line);
  letter-spacing: var(--md-body-md-tracking);
}
```

- [ ] **Step 4: Rewrite PageHeader**

Replace `frontend/src/components/ui/PageHeader/PageHeader.module.css`:

```css
.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-5);
  margin-bottom: var(--space-5);
}

.title {
  font-size: var(--md-headline-sm-size);
  line-height: var(--md-headline-sm-line);
  letter-spacing: var(--md-headline-sm-tracking);
  font-weight: var(--md-headline-sm-weight);
}

.subtitle {
  margin-top: 4px;
  max-width: 52ch;
  color: var(--md-on-surface-variant);
  font-size: var(--md-body-md-size);
  line-height: var(--md-body-md-line);
  letter-spacing: var(--md-body-md-tracking);
}

.actions {
  flex: none;
}
```

- [ ] **Step 5: Run the check to verify it passes**

Run: `cd frontend && npm run check:m3 && npm run build`

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ui/EmptyState frontend/src/components/ui/PageHeader frontend/scripts/check-m3.mjs
git commit -m "feat: apply M3 type scale to EmptyState and PageHeader"
```

---

### Task 15: Retire legacy tokens and verify the whole surface

**Files:**
- Modify: `frontend/src/styles/tokens.css` (remove `--shadow-sm`, `--shadow-lg`)
- Modify: any file still referencing them (find in Step 1)
- Modify: `frontend/scripts/check-m3.mjs`

**Interfaces:** Consumes everything above. Produces the final state.

- [ ] **Step 1: Find remaining consumers**

Run: `cd frontend && grep -rn "shadow-sm\|shadow-lg\|radius-sm\|radius-md\|radius-lg\|radius-pill" src/`
Expected: a list of files still on the legacy scales. Every hit in `src/components/ui/` must be migrated to `--md-elevation-*` / `--md-shape-*`. Hits in `src/features/` and `src/app/` are out of this plan's scope — leave them and note them in the commit message.

- [ ] **Step 2: Write the failing check**

Append to `RULES`:

```js
  {
    file: 'styles/tokens.css',
    requires: ['--md-elevation-1'],
    forbids: [
      [/--shadow-sm:/, 'legacy shadow token should be retired'],
      [/--shadow-lg:/, 'legacy shadow token should be retired'],
    ],
  },
```

- [ ] **Step 3: Run it to verify it fails**

Run: `cd frontend && npm run check:m3`
Expected: FAIL — `styles/tokens.css — legacy shadow token should be retired` (twice).

- [ ] **Step 4: Migrate remaining consumers and delete the tokens**

For each `components/ui/` file found in Step 1, replace `var(--shadow-sm)` with `var(--md-elevation-1)` and `var(--shadow-lg)` with `var(--md-elevation-3)`. Then delete the `--shadow-sm` and `--shadow-lg` declarations from `tokens.css`.

Leave `--radius-*` in place: `src/features/` and `src/app/` still use them and are out of scope.

- [ ] **Step 5: Run the full gate**

Run: `cd frontend && npm run check && npx oxlint src`
Expected: `tsc` clean, contrast ALL PASS, every M3 rule conforms, build succeeds, and oxlint reports only the five pre-existing `set-state-in-effect` / `exhaustive-deps` warnings.

- [ ] **Step 6: Visual sweep**

With the dev server running, walk both routes — Inventory and Export profiles — and open one drawer, one menu, and one toast. Confirm nothing is clipped, unreadable, or overlapping. Capture a screenshot of each route for the PR.

- [ ] **Step 7: Commit**

```bash
git add frontend/src frontend/scripts
git commit -m "refactor: retire legacy shadow tokens in favour of M3 elevation"
```

---

## Notes for the implementer

- **Spec reconciliation.** The spec's component table mentions a `tonal` button variant. The spec's own non-goals forbid prop changes, and `Button` ships four variants. This plan adds no variant; `primary` is M3 filled, `outline` is M3 outlined, `ghost` and `ghost-accent` are M3 text buttons. The spec has been corrected to match.
- **`composes` path.** From any `src/components/ui/<Name>/<Name>.module.css`, the state layer is at `../../../styles/state-layer.module.css`. Getting this wrong fails the build with a module-resolution error, not a silent miss.
- **`composes` must come first** in a CSS Modules rule, before other declarations.
- **Do not add `overflow: hidden`** to anything composing `stateLayer` — it clips the focus ring (Review Focus item 2).
