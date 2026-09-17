# Decisions: Entity Catalogue

Instantiated from `../guidance/P-ASS-assets.md`. Tick the boxes here, never in
the guidance model. Add a block with `go run ./tools/backlog init <problem-id>`.

`[ ]` eligible &middot; `[x]` chosen &middot; `[~]` tentative &middot; `[-]` neglected &middot; `[!]` challenged

---

### P-ASS-01#1 - *How are entity attributes modelled when subtypes differ?*

- **Trigger:** S-01
- **ADR:** 0001
- **Sprint:** 1

- **Options:**
  - [x] **Fixed relational schema**
  - [ ] ~~Entity-Attribute-Value (EAV) model~~
  - [ ] ~~JSON column~~
  - [ ] ~~Hybrid approach~~

---

### P-ASS-02#1 - *What does deletion mean for this entity?*

- **Trigger:** S-01
- **ADR:** 0002
- **Sprint:** 1

- **Options:**
  - [ ] ~~Hard delete~~
  - [x] **Soft delete**
  - [ ] ~~Active status~~

---

### P-ASS-03#1 - *How is a long list paginated?*

- **Trigger:** S-02
- **ADR:** 0003
- **Sprint:** 1

- **Options:**
  - [x] **Offset/limit**
  - [ ] ~~Cursor-based~~
  - [ ] ~~No pagination~~

---

### P-ASS-04#1 - *How are concurrent edits to the same record resolved?*

- **Trigger:** S-01
- **ADR:** 0004
- **Sprint:** 1

- **Options:**
  - [x] **Last-write-wins (LWW)** — _tentative_
  - [ ] **Optimistic locking**
  - [ ] ~~Pessimistic locking~~

- **Note:** single-user system; revisit on a second writer

---

### P-ASS-05#1 - *Where does input validation live?*

- **Trigger:** S-01
- **ADR:** 0005
- **Sprint:** 1

- **Options:**
  - [x] **DTOs in API layer**
  - [ ] ~~Domain layer~~
  - [ ] ~~Database constraints~~
  - [ ] ~~Hybrid approach~~