# Package: Output Customization (P-CUS)
 
**Scope:** Letting end users shape the generated output rather than
receiving a fixed format.

---

### P-CUS-01 - *What is the customization model?*

- **Level:** Conceptual  
- **Viewpoint:** Functional  
  
- **Options:**  
  - [ ] **Ad-hoc parameters**  
    Parameters passed directly with the export request for immediate, one-off formatting without persistence.
  - [ ] **Saved, reusable export profiles**  
    Saved configuration templates storing column selections, sorting, and styling preferences for repeated use.
  - [ ] **Upload template file with placeholders**  
    Pre-designed template files containing placeholder tags that the backend populates with dynamic data.
  - [ ] **Hybrid approach**  
    Combining reusable saved profiles with dynamic template mapping for maximum flexibility.
  
- **Raises:** P-CUS-02, P-CUS-03, P-CUS-04  
- **Trigger:** First story that asks for a customizable output
  
---

### P-CUS-02 - *Which aspects of the output are customizable?*

- **Level:** Conceptual  
- **Viewpoint:** Functional   
  
- **Options:** (a subset is chosen, not a single option)
  - [ ] **Column selection**
  - [ ] **Column order**
  - [ ] **Header labels**
  - [ ] **Date and number formatting**
  - [ ] **Sheet name**
  - [ ] **Report title rows above the header**
  - [ ] **Freeze header and auto-filter**
  - [ ] **Grouping and sort order**
  - [ ] **Column widths**
  
- **Trigger:** Same story as P-CUS-01

---

### P-CUS-03 - *Where are saved export profiles stored?*

- **Level:** Conceptual  
- **Viewpoint:** Information
  
- **Options:**  
  - [ ] **localStorage in user browser**  
    Client-side storage; simple to implement with zero backend footprint, but isolated to a single browser/device and lost if cache is cleared.
  - [ ] **Per-user database record**  
    Stored securely in the backend database linked to the user account; accessible across devices and persistent, but requires schema design and API endpoints.
  - [ ] **Importable/Exportable JSON file**  
    File-based profiles managed entirely by the user locally; highly portable across environments, but requires manual file management.
  
- **Trigger:** Only when P-CUS-01 resolves to saved profiles

---

### P-CUS-04 - *What happens when an export profile references an attribute that no longer exists?*

- **Level:** Conceptual
- **Viewpoint:** Functional
  
- **Options:**  
  - [ ] **Fail with an error**  
    Abort the export process and return an explicit validation error to the client.
  - [ ] **Skip the missing column**  
    Silently omit the missing or deleted column and proceed with generating the rest of the report.
  - [ ] **Emit an empty column and warn user**  
    Render an empty placeholder column in the output file alongside a warning notification in the response headers or UI.
  
- **Bound to:** P-ASS-01
- **Trigger:** After P-CUS-01 resolves to a saved-profile option and the entity schema is known to be extensible