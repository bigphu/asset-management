---
type: adr
id: "0003"
title: Offset/limit
date: 2026-09-17
state: decided
kind: existence
scope: asset list API
cost: S
risk: L
occurrences: [P-ASS-03#1]
constrains: []
enables: []
bound-to: ["0008"]
is-alternative-to: []
overrides: []
supersedes: []
superseded-by: []
raises: []
---

## Epitome

The asset list is paged with `LIMIT`/`OFFSET` and returns a total count.

## Context

S-02 asks for a selectable page size and for the current page and total
count to be shown, with sortable columns, filters, and free-text search
that survive a reload. The inventory is expected to run to hundreds of
rows.

## Decision

In the context of the asset list (S-02), facing lists longer than one
screen, we decided for **Offset/limit** and neglected **Cursor-based**
and **No pagination**, to achieve numbered pages, a total count and
sorting on any column, accepting slower deep pages and rows that can
shift between pages while someone edits, because S-02 asks for page
numbers, which a cursor cannot give, and hundreds of rows are far from
where offsets become slow.

## Consequences

- Positive: Page, size, sort and filters all fit in the query string, so they survive a reload for free.
- Positive: The same filter and sort parameters drive the export (0008).
- Negative: Each page needs a count query as well as the page query.
- Negative: An insert or delete between two page loads can repeat or skip a row.
- Negative: Revisit if the catalogue grows by orders of magnitude.

## Implementation

Not implemented yet. The backend is still the Express generator scaffold, with no database chosen.
