// Interactive-element gate. Run: npm run check:a11y
//
// A click handler on a non-interactive element is invisible to keyboard and
// assistive tech. oxlint's jsx-a11y rules are not enabled in this config, so
// this script covers the one case that has actually bitten us: an onClick on a
// bare div/span with no role and no tabIndex.
//
// Exempt: aria-hidden="true" elements. A scrim is decorative and hidden from
// assistive tech; its click is a redundant convenience alongside Escape and a
// real close button, not the only route to the action.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = join(here, '../src')
const NON_INTERACTIVE = ['div', 'span', 'li', 'td', 'tr', 'section', 'article', 'header', 'footer', 'nav', 'aside', 'p']

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.tsx') ? [p] : []
  })
}

// Returns each opening tag's full text. Tracks brace depth so a `>` inside an
// expression such as `onClick={() => f()}` does not end the tag early.
function openingTags(src, tag) {
  const out = []
  const needle = `<${tag}`
  let i = 0
  while ((i = src.indexOf(needle, i)) !== -1) {
    const after = src[i + needle.length]
    if (after && /[A-Za-z0-9_-]/.test(after)) { i += needle.length; continue }
    let depth = 0
    let j = i + needle.length
    for (; j < src.length; j++) {
      const c = src[j]
      if (c === '{') depth++
      else if (c === '}') depth--
      else if (c === '>' && depth === 0) break
    }
    out.push({ text: src.slice(i, j + 1), index: i })
    i = j + 1
  }
  return out
}

let failures = 0
for (const file of walk(ROOT)) {
  const src = readFileSync(file, 'utf8')
  for (const tag of NON_INTERACTIVE) {
    for (const { text, index } of openingTags(src, tag)) {
      if (!/\bonClick\b/.test(text)) continue
      if (/\brole=/.test(text) && /\btabIndex\b/.test(text)) continue
      if (/aria-hidden=["{]?true/.test(text)) continue
      const line = src.slice(0, index).split('\n').length
      console.log(`FAIL  ${relative(ROOT, file).replaceAll(String.fromCharCode(92), '/')}:${line} — <${tag}> has onClick but no role + tabIndex; use a <button>`)
      failures++
    }
  }
}
console.log(failures ? `\n${failures} FAILING` : '\nno click handlers on non-interactive elements')
process.exit(failures ? 1 : 0)
