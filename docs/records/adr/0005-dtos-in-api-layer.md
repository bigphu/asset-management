---
type: adr
id: "0005"
title: DTOs in API layer
date: 2026-09-17
state: decided
kind: property
scope: API layer
cost: S
risk: M
occurrences: [P-ASS-05#1]
constrains: []
enables: []
bound-to: []
is-alternative-to: []
overrides: []
supersedes: []
superseded-by: []
raises: []
---

## Epitome

Request bodies are validated against DTOs at the API boundary.

## Context

S-01 accepts a tag, name, type, status, purchase date and location, and
asks that a duplicate tag be rejected with a clear message. The API is
the only way data enters the system, and the asset has no business
rules yet beyond the format of its fields.

## Decision

In the context of accepting asset input (S-01), facing the choice of
where validation lives, we decided for **DTOs in API layer** and
neglected **Domain layer**, **Database constraints** and **Hybrid
approach**, to achieve early rejection of malformed requests with
per-field messages, accepting that anything bypassing the API is
unchecked, because the API is the only entry point and there are no
business rules beyond field formats.

## Consequences

- Positive: One place defines what a valid request is, and its errors map straight onto form fields.
- Negative: Tag uniqueness cannot be checked by a DTO alone: checking then inserting is a race. The table still needs a `UNIQUE` constraint, with its violation translated into S-01's duplicate-tag message -- a step toward the neglected Hybrid approach.
- Negative: Business rules added later have no home; that is the point to revisit this.

## Implementation

Not implemented yet. The backend is still the Express generator scaffold, with no database chosen.
