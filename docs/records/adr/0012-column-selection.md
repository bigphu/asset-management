---
type: adr
id: "0012"
title: Column selection
date: 2026-09-17
state: decided
kind: existence
scope: export customization
cost: M
risk: L
occurrences: [P-CUS-02#1]
constrains: []
enables: []
bound-to: ["0010"]
is-alternative-to: []
overrides: []
supersedes: []
superseded-by: []
raises: []
---

## Epitome

Users may choose columns, their order, header labels and date and number formats -- nothing else.

## Context

S-04's acceptance criteria name exactly four things: pick which columns
appear, set their order, rename headers, and choose a date format. S-03
already fixes the default: column order matches the screen. The column
list itself is fixed by the schema (0001).

## Decision

In the context of customizing the exported file (S-04), facing which
aspects of the output a user may change, we decided for **Column
selection**, **Column order**, **Header labels** and **Date and number
formatting** and neglected **Sheet name**, **Report title rows above the
header**, **Freeze header and auto-filter**, **Grouping and sort order**
and **Column widths**, to achieve exactly what S-04 asks for, accepting
that the neglected aspects are fixed by the application, because each
further aspect widens the parameter set every request and saved profile
must carry and validate.

## Consequences

- Positive: A small, closed parameter set that is easy to validate and to store.
- Negative: Sort order in the file follows the list's sort, not a separate choice.
- Negative: Sheet name, widths, freezing and title rows are application defaults; changing one means a code change.

## Implementation

Not implemented yet. The backend is still the Express generator scaffold, with no database chosen.
