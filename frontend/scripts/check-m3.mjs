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
  // Each task appends: { file: 'components/ui/X/X.module.css', requires: [...], forbids: [...] }
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
