# Architecture Decision Records

One file per decision, numbered, never renumbered, never edited once
accepted — correct a decision by writing a new ADR that supersedes it.

The template merges three models. Each field says which one it comes
from, because that provenance is the point.

## Front matter

```yaml
---
# --- Nygard: the record itself ---
id: "0006"
state: decided            # also Kruchten's state vocabulary
date: 2026-03-04
# --- Zimmermann: which decision problem this outcome answers ---
occurrences: [P-EXP-04#1]
# --- Kruchten: ontology attributes ---
kind: property (constraint)
scope: export module
cost: S
risk: L
# --- Kruchten: relationships between decisions ---
constrains: ["0007"]
enables: []
bound-to: ["0005"]
is-alternative-to: []
overrides: null
raises: []
supersedes: null
superseded-by: null
---
```

**`state`** -- Kruchten's lifecycle: `idea`, `tentative`, `decided`,
`approved`, `challenged`, `rejected`, `obsolesced`. It must agree with
the occurrence's derived state: an occurrence whose only committed
option is `[~]` needs an ADR in state `tentative`, and a `[!]` option
forces state `challenged`.

**`kind`** -- Kruchten's decision kinds: `existence` (structural or
behavioural), `ban`/`non-existence`, `property` (a guideline or
constraint), `executive` (process, technology, organisational). A
parenthetical refinement is allowed after the kind.

**Relationships** -- Kruchten's links, pointing at other ADR ids.
`raises` is the exception: it points at problem ids in the guidance
model, because a decision opens new *questions*, not new answers.

## Body

| Section | Source |
|---|---|
| `## Epitome` | Kruchten -- one-line summary |
| `## Context` | Nygard |
| `## Decision` | Zimmermann -- the Y-statement, one sentence |
| `## Consequences` | Nygard -- positive and negative |
| `## Implementation` | traceability to code |

The Decision section must be a real Y-statement:

> In the context of *\<use case\>*, facing *\<concern\>*, we decided for
> *\<option\>* and neglected *\<alternatives\>*, to achieve
> *\<quality\>*, accepting *\<downside\>*, because *\<rationale\>*.

The tool checks all seven connectives are present **and in order**, so a
prose paragraph that merely mentions the words will not pass. If the
sentence will not fit, the decision is probably two decisions.

## What `-check` catches here

- A `state` or `kind` outside Kruchten's vocabulary
- A Decision section that is not a well-formed Y-statement
- A relationship pointing at an ADR or problem that does not exist
- An ADR whose state contradicts its occurrence's derived state
- An occurrence and an ADR that do not name each other -- the link must
  go both ways
- An `open` or `not applicable` occurrence that names an ADR anyway