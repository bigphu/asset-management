---
type: adr
id: "0010"
title: ExcelJS (Node.js)
date: 2026-09-17
state: decided
kind: executive
scope: export module
cost: S
risk: L
occurrences: [P-EXP-05#1]
constrains: []
enables: []
bound-to: ["0009"]
is-alternative-to: []
overrides: []
supersedes: []
superseded-by: []
raises: []
---

## Epitome

ExcelJS generates the .xlsx file.

## Context

The file is built on the Node.js backend (0006). S-03 requires a file
that opens in Excel and LibreOffice with no repair prompt, a header row,
and dates stored as dates. S-04 adds header labels and date and number
formats (0012).

## Decision

In the context of generating .xlsx files on the Node.js backend, facing
the choice of library, we decided for **ExcelJS (Node.js)** and
neglected **SheetJS (Node.js)**, **Apache POI (Java)** and **openpyxl
(Python)**, to achieve real date cells, number formats and header
styling in the API's own runtime, accepting a larger dependency than
SheetJS, because SheetJS keeps most styling in its paid edition and POI
or openpyxl would add a second runtime to the deployment.

## Consequences

- Positive: Date and number formats per column cover S-03 and S-04 directly.
- Positive: A streaming writer is available if 0009 is revisited.
- Negative: A third-party dependency on the export path; pin its version.

## Implementation

Not implemented yet. The backend is still the Express generator scaffold, with no database chosen.
