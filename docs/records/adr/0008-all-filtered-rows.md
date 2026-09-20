---
type: adr
id: "0008"
title: All filtered rows
date: 2026-09-17
state: decided
kind: existence
scope: export module
cost: S
risk: L
occurrences: [P-EXP-03#1]
constrains: []
enables: []
bound-to: ["0003", "0009"]
is-alternative-to: []
overrides: []
supersedes: []
superseded-by: []
raises: []
---

## Epitome

The export contains every row matching the current filters, across all pages.

## Context

S-03 requires the exported rows to respect the filters currently
applied. S-02 defines those filters -- type, status, location and
free-text search -- and pages the result (0003).

## Decision

In the context of exporting the asset list (S-03), facing which rows the
file contains, we decided for **All filtered rows** and neglected **The
page currently displayed**, **Entire table** and **Checkbox for user
choice**, to achieve a file holding exactly what the user filtered for,
accepting a file whose size follows the filter rather than the page
size, because S-03 asks the export to respect the filters, and exporting
only the visible page would drop rows without saying so.

## Consequences

- Positive: The export runs the list's query without `LIMIT`/`OFFSET`, keeping its sort -- so row order matches the screen too.
- Positive: Deleted assets are excluded the same way they are from the list (0002).
- Negative: No upper bound: with no filter set, the export is the whole table. Memory use follows (0009).

## Implementation

Not implemented yet. The backend is still the Express generator scaffold, with no database chosen.
