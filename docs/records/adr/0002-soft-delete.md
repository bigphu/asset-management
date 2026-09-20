---
type: adr
id: "0002"
title: Soft delete
date: 2026-09-17
state: decided
kind: existence
scope: asset module
cost: S
risk: L
occurrences: [P-ASS-02#1]
constrains: ["0003", "0008"]
enables: []
bound-to: []
is-alternative-to: []
overrides: []
supersedes: []
superseded-by: []
raises: []
---

## Epitome

Deleting an asset stamps `deleted_at`; restoring clears it.

## Context

S-01 asks that a deleted asset disappear from the list, and that it
can be restored within the same session. S-01 also gives every asset a
`status`, which describes where the asset is in its life.

## Decision

In the context of deleting an asset (S-01), facing a requirement that
a deleted asset disappear from the list yet stay restorable, we decided
for **Soft delete** and neglected **Hard delete** and **Active status**,
to achieve a lossless, one-step restore, accepting that every read must
now exclude deleted rows, because a hard delete cannot be undone and
reusing `status` for deletion would mix two meanings in one field.

## Consequences

- Positive: Restore is clearing one column; nothing is lost or re-entered.
- Positive: `status` keeps a single meaning: the asset's lifecycle, not whether the record exists.
- Negative: Every read path -- the list (0003), the export (0008), the duplicate-tag check -- must filter out deleted rows. Forgetting one leaks deleted assets.
- Negative: A deleted asset still holds its tag. Whether a new asset may reuse that tag is not yet decided.
- Negative: Deleted rows accumulate; there is no purge policy.

## Implementation

Not implemented yet. The backend is still the Express generator scaffold, with no database chosen.
