# Decisions: Export

Instantiated from `../guidance/P-EXP-export.md`. Tick the boxes here, never in
the guidance model. Add a block with `go run ./tools/backlog init <problem-id>`.

`[ ]` eligible &middot; `[x]` chosen &middot; `[~]` tentative &middot; `[-]` neglected &middot; `[!]` challenged

---

### P-EXP-01#1 - *Where is the file generated?*

- **Trigger:** S-03
- **ADR:** 0006
- **Sprint:** 1

- **Options:**
  - [ ] ~~In browser (client-side)~~
  - [x] **Backend (server-side)**
  - [ ] ~~Dedicated report generation service~~

---

### P-EXP-02#1 - *Synchronous response or background job?*

- **Trigger:** S-03
- **ADR:** 0007
- **Sprint:** 1

- **Options:**
  - [x] **Returned in API response body (synchronous)**
  - [ ] ~~Background worker + Download link~~
  - [ ] ~~Hybrid approach~~

- **Note:** deliberately deferred; trigger is export time exceeding ~3s

---

### P-EXP-03#1 - *What is the scope of exported data?*

- **Trigger:** S-03
- **ADR:** 0008
- **Sprint:** 1

- **Options:**
  - [ ] ~~The page currently displayed~~
  - [x] **All filtered rows**
  - [ ] ~~Entire table~~
  - [ ] ~~Checkbox for user choice~~

---

### P-EXP-04#1 - *Is the file buffered in memory or streamed?*

- **Trigger:** S-03
- **ADR:** 0009
- **Sprint:** 1

- **Options:**
  - [x] **In-memory buffer**
  - [ ] ~~Response streaming~~

- **Note:** rests on a text-only row-size estimate
  
---

### P-EXP-05#1 - *Which library generates the spreadsheet?*

- **Trigger:** S-03
- **ADR:** 0010
- **Sprint:** 1

- **Options:**
  - [x] **ExcelJS (Node.js)**
  - [ ] ~~SheetJS (Node.js)~~
  - [ ] ~~Apache POI (Java)~~
  - [ ] ~~openpyxl (Python)~~
