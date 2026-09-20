---
type: adr
id: "0007"
title: Returned in API response body (synchronous)
date: 2026-09-17
state: decided
kind: existence
scope: export API
cost: S
risk: M
occurrences: [P-EXP-02#1]
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

The export request returns the file in its response body.

## Context

S-03 exports a filtered asset list of hundreds of rows. The occurrence
records this as deliberately deferred: the trigger to revisit is export
time exceeding about three seconds.

## Decision

In the context of delivering the export (S-03), facing how the file
reaches the user, we decided for **Returned in API response body
(synchronous)** and neglected **Background worker + Download link** and
**Hybrid approach**, to achieve a one-request download with no queue,
worker or file storage, accepting a timeout risk if generation slows,
because an export of a few hundred rows finishes well within the
three-second threshold set for revisiting this.

## Consequences

- Positive: A single request; the browser downloads the file directly.
- Positive: No job queue, worker or temporary file storage.
- Negative: A slow export holds a request open and can hit an HTTP timeout.
- Negative: Crossing the three-second threshold means a background job, which opens P-EVT-01 -- how work leaves the request path.

## Implementation

Not implemented yet. The backend is still the Express generator scaffold, with no database chosen.
