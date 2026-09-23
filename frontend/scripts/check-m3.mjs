// Static M3 conformance gate for component CSS. Run: npm run check:m3
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const src = (p) => join(here, '../src', p)

// Applied to every file listed in RULES except tokens.css, which is the one
// file whose job is to declare raw color values.
const GLOBAL_FORBIDS = [
  [/#[0-9a-fA-F]{3,8}\b/, 'raw hex color'],
  [/rgba?\(/, 'raw rgb/rgba color'],
  [/border-radius:\s*\d/, 'literal border-radius (use a --md-shape-* token)'],
]

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
]

let totalFailures = 0
for (const rule of RULES) {
  const problems = []
  const path = src(rule.file)
  if (!existsSync(path)) {
    problems.push('file not found')
  } else {
    const css = readFileSync(path, 'utf8')
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
