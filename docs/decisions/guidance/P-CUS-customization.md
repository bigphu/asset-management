# Problem Space - *Customization*

## Sprint 1

### P-CUS-01 - *How to treat customization options?*

**Level:** Conceptual  
**Viewpoint:** Information / Flexibility  

**Options:**  
- [ ] **Ad-hoc parameter**  
  Parameters passed directly with the export request for immediate, one-off formatting without persistence.
- [ ] **Reusable export profile**  
  Saved configuration templates storing column selections, sorting, and styling preferences for repeated use.
- [ ] **Upload XLSX template with placeholder**  
  Pre-designed Excel files containing placeholder tags that the backend populates with dynamic data.
- [ ] **Hybrid approach**  
  Combining reusable saved profiles with dynamic template mapping for maximum flexibility.

**Raises:** P-CUS-02, P-CUS-03, P-CUS-04  
**Trigger:** S-SP1-04

---

### P-CUS-02 - *What are the permitted customizations?*

**Level:** Conceptual  
**Viewpoint:** Information / Scope  

**Options:**  
- [ ] **Comprehensive layout and formatting rules**  
  Supports selected columns, column order, column labels, date/number formatting, sheet names, report titles, free header toggles with auto-fillers, grouping/sorting, and custom column widths.

**Trigger:** S-SP1-04

---

### P-CUS-03 - *Where is the export profile saved?*

**Level:** Technical  
**Viewpoint:** Interface / Persistence  

**Options:**  
- [ ] **localStorage in user browser**  
  Client-side storage; simple to implement with zero backend footprint, but isolated to a single browser/device and lost if cache is cleared.
- [ ] **Per-user database record**  
  Stored securely in the backend database linked to the user account; accessible across devices and persistent, but requires schema design and API endpoints.
- [ ] **Importable/Exportable JSON file**  
  File-based profiles managed entirely by the user locally; highly portable across environments, but requires manual file management.

**Trigger:** Only when P-CUS-01 chooses option 2 or 4

---

### P-CUS-04 - *What to do when an export profile references non-existent columns?*

**Level:** Technical  
**Viewpoint:** Concurrency / Data Integrity  

**Options:**  
- [ ] **Throw error**  
  Abort the export process and return an explicit validation error to the client.
- [ ] **Skip those columns**  
  Silently omit missing or deleted columns and proceed with generating the rest of the report.
- [ ] **Export empty column and warn user**  
  Render an empty placeholder column in the output file alongside a warning notification in the response headers or UI.

**Trigger:** When P-DEV-01 chose the dynamic attribute option