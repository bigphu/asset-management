# Decision Log (Solution Space)

One file per guidance package, holding the problem occurrences this
project has instantiated. Project-specific; dies with the project.

## Recording a decision

```
go run ./tools/backlog init P-EVT-01
```

Copies the problem block out of `../guidance/` into the matching file
here, numbered as the next occurrence, every box unticked. Fill in
`Trigger`, then tick boxes as the decision is made.

## Two forms, one meaning

Type the **terse form** in your editor — the state is the checkbox mark:

| Mark | Option state |
|---|---|
| `[ ]` | eligible -- undecided, the default |
| `[x]` | chosen |
| `[~]` | tentative -- chosen but weakly held |
| `[-]` | neglected -- ruled out |
| `[!]` | challenged -- was chosen, evidence has turned against it |

Then run `go run ./tools/backlog`, which rewrites them into the
**canonical form** — plain GFM that renders correctly in a browser:

```markdown
- [x] **All filtered rows**
- [x] **Last-write-wins (LWW)** — _tentative_
- [x] **In-memory buffer** — ⚠️ _challenged_
- [ ] ~~Entire table~~
- [ ] **Checkbox for user choice**
```

Both forms parse, so this round-trips: edit either one, run the tool,
get the canonical file back. On GitHub you see a real task list with the
ruled-out options struck through; in an editor you can still flip a
state by typing one character between the brackets.

Occurrence status is derived from these, never written by hand:

| Option marks | Occurrence status |
|---|---|
| any `[!]` | `challenged` |
| nothing but `[ ]` | `open` |
| nothing but `[-]` | `not applicable` |
| `[x]` plus only `[-]` | `decided` |
| anything else | `partially decided` |

A freshly copied block is `open` with zero typing, which is the point:
recording "we will have to decide this" has to be cheap.

`-check` treats an unformatted file as an error, so CI keeps the
committed files canonical.

## What `-check` catches

**In the guidance model**

- A ticked box -- project state leaking into the reusable half
- A `Level` outside Executive / Conceptual / Technology / Vendor/Asset
- A misspelled field key, or a field bullet missing its colon
- A `Raises` or `Bound to` pointing at a problem that does not exist
- Text referring to an option by position ("option 2") instead of by name
- Two options in one problem sharing a label

**Between the two halves**

- An option added to a guidance package that an existing occurrence has
  not accounted for
- An option removed or renamed out from under an occurrence
- More than one `[x]` without a `Note` mentioning a subset
- An occurrence that is `decided` or `partially decided` but names no
  ADR -- the Definition of Done

## Usage

```
go run ./tools/backlog           # regenerate ../backlog.md
go run ./tools/backlog -check    # validate only, exit 1 on failure
```

Run `-check` in CI.