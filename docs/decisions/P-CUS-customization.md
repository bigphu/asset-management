# Decisions: Output Customization

Instantiated from `../guidance/P-CUS-customization.md`. Tick the boxes here, never in
the guidance model. Add a block with `go run ./tools/backlog init <problem-id>`.

`[ ]` eligible &middot; `[x]` chosen &middot; `[~]` tentative &middot; `[-]` neglected &middot; `[!]` challenged

---

### P-CUS-01#1 - *What is the customization model?*

- **Trigger:** S-04
- **ADR:** 0011
- **Sprint:** 1

- **Options:**
  - [x] **Ad-hoc parameters**
  - [ ] **Saved, reusable export profiles**
  - [ ] ~~Upload template file with placeholders~~
  - [ ] ~~Hybrid approach~~

---

### P-CUS-02#1 - *Which aspects of the output are customizable?*

- **Trigger:** S-04
- **ADR:** 0012
- **Sprint:** 1

- **Options:**
  - [x] **Column selection**
  - [x] **Column order**
  - [x] **Header labels**
  - [x] **Date and number formatting**
  - [ ] ~~Sheet name~~
  - [ ] ~~Report title rows above the header~~
  - [ ] ~~Freeze header and auto-filter~~
  - [ ] ~~Grouping and sort order~~
  - [ ] ~~Column widths~~

- **Note:** a subset is chosen here, not a single option

---

### P-CUS-03#1 - *Where are saved export profiles stored?*

- **Trigger:** S-04
- **ADR:** 0013
- **Sprint:** 1

- **Options:**
  - [ ] ~~localStorage in user browser~~
  - [x] **Per-user database record**
  - [ ] ~~Importable/Exportable JSON file~~