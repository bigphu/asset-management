---
type: adr
id: "0001"
title: Fixed relational schema
date: 2026-09-17
state: decided
kind: existence
scope: asset data model
cost: M
risk: M
occurrences: [P-ASS-01#1]
constrains: ["0012"]
enables: []
bound-to: []
is-alternative-to: []
overrides: []
supersedes: []
superseded-by: []
raises: []
---

## Epitome

Every asset attribute is a typed column in one assets table.

## Context

S-01 stores the same six attributes for every asset -- tag, name,
type, status, purchase date and location -- and asks for a unique tag.
S-02 filters on type, status and location and searches tag and name.
S-03 exports the columns in screen order. No sprint 1 story needs an
attribute that exists for one asset type and not another.

## Decision

In the context of the asset catalogue (S-01), facing attributes that
might one day differ between asset types, we decided for **Fixed
relational schema** and neglected **Entity-Attribute-Value (EAV) model**,
**JSON column** and **Hybrid approach**, to achieve plain SQL filtering,
sorting and uniqueness on every attribute the stories use, accepting a
schema migration whenever an attribute is added, because every attribute
sprint 1 asks for is common to all assets.

## Consequences

- Positive: S-02's filters, sorting and search, and the unique tag from S-01, map directly onto columns and indexes.
- Positive: The export column list (S-03, S-04) is fixed and known in advance, so P-CUS-04 -- a profile naming an attribute that no longer exists -- does not arise.
- Negative: Adding an attribute means a migration plus changes to the DTOs, the list query and the export.
- Negative: If type-specific attributes arrive, this ADR has to be superseded. The Hybrid approach is the natural successor.

## Implementation

Not implemented yet. The backend is still the Express generator scaffold, with no database chosen.
