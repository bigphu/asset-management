---
type: adr
id: "0013"
title: Per-user database record
date: 2026-09-17
state: decided
kind: existence
scope: export customization
cost: M
risk: M
occurrences: [P-CUS-03#1]
constrains: []
enables: []
bound-to: ["0011"]
is-alternative-to: []
overrides: []
supersedes: []
superseded-by: []
raises: [P-ASS-05]
---

## Epitome

Saved export profiles are rows in the backend database, owned by a user.

## Context

S-04 asks that a profile be named, saved, picked at export time, edited
and deleted, so that a monthly report is not reconfigured every time.
Sharing profiles between users is out of scope. The problem's trigger
is P-CUS-01 resolving to saved profiles, which it has not fully done
yet (0011). No story establishes who the user is.

## Decision

In the context of saving export profiles (S-04), facing where a profile
is kept, we decided for **Per-user database record** and neglected
**localStorage in user browser** and **Importable/Exportable JSON file**,
to achieve profiles that survive a cleared browser and follow the user
to another device, accepting a new table and CRUD endpoints for a second
managed resource, because a monthly report configured once must still be
there next month, which browser storage cannot promise.

## Consequences

- Positive: Profiles persist and are available on any device.
- Positive: A profile is a stored parameter set (0011), so it can be validated with the same rules as a live export.
- Negative: "Per-user" needs a user identity, and no story yet provides authentication. Until one does, there is no user to key a profile on.
- Negative: Profiles are a managed resource of their own, so S-04 raises P-ASS-05 (where input validation lives) a second time. That occurrence is not yet recorded.

## Implementation

Not implemented yet. The backend is still the Express generator scaffold, with no database chosen.
