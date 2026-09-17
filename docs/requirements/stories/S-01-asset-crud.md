---
ID: S-01
Title: Create, read, update and delete an asset
Sprint: 1
Status: done
Triggers: [P-ASS-01, P-ASS-02, P-ASS-04, P-ASS-05]
---

## Story

As an asset manager, I want to add assets to the system and edit or
remove them later, so that the inventory reflects what we actually own.

## Acceptance criteria

- [ ] Create an asset record with tag, name, type, status, purchase date and location
- [ ] Asset tag is unique; a duplicate is rejected with a clear message
- [ ] Edit any field of an existing asset
- [ ] Delete an asset; it disappears from the list
- [ ] A deleted asset can be restored within the same session

## Out of scope

Bulk import; asset check-in/check-out; assignment to a person.

## Notes

Triggers P-ASS-01, P-ASS-02, P-ASS-04, P-ASS-05.