---
ID: S-02
Title: Browse, filter and page the asset list
Sprint: 1
Status: done
Triggers: [P-ASS-03]
---

## Story

As an asset manager, I want to filter and page through the asset list,
so that I can find an asset without scrolling past hundreds of rows.

## Acceptance criteria

- [x] Table view with sortable columns
- [x] Filter by type, status and location
- [x] Free-text search on asset tag and name
- [x] Page size selectable; current page and total count shown
- [x] Filters survive a page reload

## Out of scope

Saved filter presets; column show/hide in the table itself.

## Notes

Triggers P-ASS-03. P-EXP-03 depends on what this story decides about
what "the current result set" means.