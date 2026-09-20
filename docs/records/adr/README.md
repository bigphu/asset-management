# Architecture Decision Records

One file per decision, numbered, never renumbered, never edited once
accepted -- correct a decision by writing a new ADR that supersedes it.

The template merges three models. Each field says which one it comes
from, because that provenance is the point.

Unlike the problems and occurrences, an ADR is mostly prose, so it is
YAML front matter followed by a markdown body rather than a plain YAML
record.

## Front matter

```yaml
---
type: adr
# --- Nygard: the record itself ---
id: "0006"
title: In-memory buffer
date: 2026-03-04
state: decided            # also Kruchten's state vocabulary
# --- Zimmermann: which decision problem this outcome answers ---
occurrences: [P-EXP-04#1]
# --- Kruchten: ontology attributes ---
kind: property
scope: export module
cost: S
risk: L
# --- Kruchten: relationships between decisions ---
constrains: ["0007"]
enables: []
bound-to: ["0005"]
is-alternative-to: []
overrides: []
raises: []
supersedes: []
superseded-by: []
---
```

**`state`** -- Kruchten's lifecycle: `idea`, `tentative`, `decided`,
`approved`, `challenged`, `rejected`, `obsolesced`. It must agree with
the occurrence's derived state: an occurrence whose only committed
option is `tentative` needs an ADR in state `tentative`, and a
`challenged` option forces state `challenged`.

**`kind`** -- Kruchten's decision kinds: `existence` (structural or
behavioural), `ban`/`non-existence`, `property` (a guideline or
constraint), `executive` (process, technology, organisational).

**`scope`, `cost`, `risk`** -- Kruchten's attributes. `scope` is the
part of the system affected, in words. `cost` is `S`, `M` or `L`
(small, medium, large); `risk` is `L`, `M` or `H` (low, medium, high).

**Relationships** -- Kruchten's links, pointing at other ADR ids, and
every one a list. `raises` is the exception: it points at problem ids in
the guidance model, because a decision opens new *questions*, not new
answers.

`occurrences` declares `inverse: adr` in the schema, so an ADR and its
occurrence must name each other. Writing only one half fails the check.

## Body

| Section | Source |
|---|---|
| `## Epitome` | Kruchten -- one-line summary |
| `## Context` | Nygard |
| `## Decision` | Zimmermann -- the Y-statement, one sentence |
| `## Consequences` | Nygard -- positive and negative |
| `## Implementation` | traceability to code |

All five are required; the schema lists them, and an empty one is an
error.

The Decision section must be a real Y-statement:

> In the context of *\<use case\>*, facing *\<concern\>*, we decided for
> *\<option\>* and neglected *\<alternatives\>*, to achieve
> *\<quality\>*, accepting *\<downside\>*, because *\<rationale\>*.

The tool checks all seven connectives are present **and in order**, so a
prose paragraph that merely mentions the words will not pass. If the
sentence will not fit, the decision is probably two decisions.

## Writing one

```
go run ./tools/records new adr P-EXP-04#1
```

Takes the next free number, pre-fills the Kruchten state and splices the
chosen and neglected option labels into the Y-statement, and writes the
number back into the occurrence so both halves of the link exist from
the start. Everything else is a `TODO` and `check` fails until each is
replaced -- a half-written ADR does not pass CI.

## What `check` catches here

- A `state` or `kind` outside Kruchten's vocabulary
- A missing or empty body section
- A Decision section that is not a well-formed Y-statement
- A relationship pointing at an ADR or problem that does not exist, or
  at a record of the wrong type
- An ADR whose state contradicts its occurrence's derived state
- An occurrence and an ADR that do not name each other -- the link must
  go both ways
