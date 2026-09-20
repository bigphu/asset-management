---
type: adr
id: "0004"
title: Last-write-wins (LWW)
date: 2026-09-17
state: tentative
kind: non-existence
scope: asset update API
cost: S
risk: M
occurrences: [P-ASS-04#1]
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

An update overwrites the stored asset; there is no concurrency control, for now.

## Context

S-01 lets a user edit any field of an asset. The system has a single
user, and no story introduces a second writer such as another user or a
bulk import (bulk import is out of scope in S-01). Held tentatively:
optimistic locking stays eligible on the occurrence.

## Decision

In the context of editing an asset (S-01), facing two edits to the same
record that could overlap, we decided for **Last-write-wins (LWW)** and
neglected **Pessimistic locking**, to achieve the simplest update path
with no version bookkeeping, accepting that an overlapping edit is
silently overwritten, because there is one user and so no second writer
to collide with.

## Consequences

- Positive: No version column, no conflict response, no conflict UI.
- Negative: Silent data loss if two edits overlap -- possible even for one user with two tabs open.
- Negative: A second writer reopens this. Moving to optimistic locking adds a version column, a `409 Conflict` path on update, and a client that sends back the version it read.

## Implementation

Not implemented yet. The backend is still the Express generator scaffold, with no database chosen.
