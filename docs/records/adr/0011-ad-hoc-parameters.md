---
type: adr
id: "0011"
title: Ad-hoc parameters
date: 2026-09-17
state: decided
kind: existence
scope: export customization
cost: S
risk: L
occurrences: [P-CUS-01#1]
constrains: []
enables: ["0012"]
bound-to: []
is-alternative-to: []
overrides: []
supersedes: []
superseded-by: []
raises: []
---

## Epitome

Customization travels as parameters on the export request.

## Context

S-04 asks the user to shape the exported file and to save that choice
as a named profile. This occurrence settles how a customization is
expressed. Whether it can be saved as a profile is still open: *Saved,
reusable export profiles* stays eligible, which leaves the occurrence
partially decided.

## Decision

In the context of customizing the exported file (S-04), facing how a
customization is expressed, we decided for **Ad-hoc parameters** and
neglected **Upload template file with placeholders** and **Hybrid
approach**, to achieve an export whose output is fully described by its
request, accepting that saving a customization is a separate layer still
to be settled, because a saved profile can then be no more than a stored,
named set of those same parameters.

## Consequences

- Positive: The export endpoint stays stateless: the same request always yields the same file.
- Positive: Saved profiles (0013) reduce to storing parameter sets.
- Negative: This alone does not meet S-04's "name the export profile and save it" -- that waits on the saved-profiles option.
- Negative: Every parameter must be validated on each request: an unknown column, a bad date format.

## Implementation

Not implemented yet. The backend is still the Express generator scaffold, with no database chosen.
