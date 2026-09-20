---
type: adr
id: "0009"
title: In-memory buffer
date: 2026-09-17
state: decided
kind: property
scope: export module
cost: S
risk: M
occurrences: [P-EXP-04#1]
constrains: []
enables: []
bound-to: ["0007", "0008", "0010"]
is-alternative-to: []
overrides: []
supersedes: []
superseded-by: []
raises: []
---

## Epitome

The whole workbook is built in memory, then sent.

## Context

The file is generated on the server (0006), returned in the response
body (0007), and holds every filtered row (0008). The occurrence notes
that this rests on a text-only row-size estimate: hundreds of rows of
six short text and date fields.

## Decision

In the context of generating the export on the server, facing whether to
build the workbook in memory or stream it, we decided for **In-memory
buffer** and neglected **Response streaming**, to achieve the simplest
generation code, accepting memory that grows with the number of rows,
because the text-only estimate puts a full export of hundreds of rows
well under a megabyte.

## Consequences

- Positive: The simplest generation code, and the response can carry a `Content-Length`.
- Positive: A failure happens before any byte is sent, so the client gets a clean error, not a truncated file.
- Negative: Memory grows with row count. The estimate is text-only; images, attachments or many more columns invalidate it.
- Negative: Switching to streaming later is contained: ExcelJS has a streaming writer (0010).

## Implementation

Not implemented yet. The backend is still the Express generator scaffold, with no database chosen.
