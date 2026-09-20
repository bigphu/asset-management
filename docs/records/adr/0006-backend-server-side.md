---
type: adr
id: "0006"
title: Backend (server-side)
date: 2026-09-17
state: decided
kind: existence
scope: export module
cost: S
risk: L
occurrences: [P-EXP-01#1]
constrains: ["0010"]
enables: ["0008"]
bound-to: []
is-alternative-to: []
overrides: []
supersedes: []
superseded-by: []
raises: []
---

## Epitome

The API server builds the .xlsx file.

## Context

S-03 asks for an export that respects the filters currently applied,
keeps the screen's column order, opens cleanly in Excel and LibreOffice,
and writes dates as dates. The list is paged on the server (0003), so
the browser only ever holds one page. The backend is Node.js with
Express.

## Decision

In the context of exporting the asset list (S-03), facing where the file
is produced, we decided for **Backend (server-side)** and neglected **In
browser (client-side)** and **Dedicated report generation service**, to
achieve an export that applies the list's own server-side filters to
every matching row, accepting export work on the API server's CPU and
memory, because the browser holds only the current page and a separate
service is not justified for hundreds of rows.

## Consequences

- Positive: The export reuses the list's query, so the file matches the screen by construction.
- Positive: One deployable; no extra service to run.
- Negative: A large export competes with ordinary requests for the API process.
- Negative: The spreadsheet library has to run on Node.js (0010).

## Implementation

Not implemented yet. The backend is still the Express generator scaffold, with no database chosen.
