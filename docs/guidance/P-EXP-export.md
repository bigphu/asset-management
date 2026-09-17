# Package: Export (P-EXP)

**Scope:** Turning in-system data into a file for consumption outside the system.

---

### P-EXP-01 - *Where is the file generated?*

- **Level:** Conceptual  
- **Viewpoint:** Functional
  
- **Options:**  
  - [ ] **In browser (client-side)**  
    Offloads computation to the user's browser; preserves server resources, but is limited by client memory and performance for large datasets.
  - [ ] **Backend (server-side)**  
    Generated directly on the API server; handles moderate datasets reliably, but consumes server CPU and RAM.
  - [ ] **Dedicated report generation service**  
    Offloaded to an isolated microservice or worker pool; prevents heavy reporting tasks from starving the core API of resources.
  
- **Raises:** P-EXP-02, P-EXP-04, P-EXP-05
- **Trigger:** First story that produces a downloadable file

---

### P-EXP-02 - *Synchronous response or background job?*

- **Level:** Conceptual  
- **Viewpoint:** Functional
  
- **Options:**  
  - [ ] **Returned in API response body (synchronous)**  
    Direct file stream or download in the HTTP response; simple to implement for small exports, but risks HTTP timeouts if generation takes too long.
  - [ ] **Background worker + Download link**  
    Queued job that generates the file asynchronously and provides a download link once ready; ideal for large exports, completely avoiding HTTP timeouts.
  - [ ] **Hybrid approach**  
    Synchronous generation for small or filtered datasets, automatically switching to asynchronous background jobs when record counts exceed a specific threshold.
  
- **Raises:** P-EVT-01
- **Trigger:** When generation time exceeds roughly three seconds

---

### P-EXP-03 - *What is the scope of exported data?*

- **Level:** Conceptual  
- **Viewpoint:** Information 
  
- **Options:**  
  - [ ] **The page currently displayed**  
    Exports only the rows currently visible in the active pagination view.
  - [ ] **All filtered rows**  
    Exports all records matching the current active search query and filters across all pages.
  - [ ] **Entire table**  
    Exports the complete, unfiltered dataset from the database table.
  - [ ] **Checkbox for user choice**  
    Provides a UI modal empowering users to explicitly select their desired export scope.
  
- **Bound to:** P-ASS-03
- **Trigger:** First export story

---

### P-EXP-04 - *Is the file buffered in memory or streamed?*

- **Level:** Conceptual  
- **Viewpoint:** Deployment
  
- **Options:**  
  - [ ] **In-memory buffer**  
    Construct the entire workbook structure in RAM before transmitting; straightforward to implement, but vulnerable to out-of-memory (OOM) crashes on large files.
  - [ ] **Response streaming**  
    Write the workbook stream chunk-by-chunk directly to the HTTP response or disk; highly memory-efficient, but requires library support for streaming writers.
  
- **Bound to:** P-EXP-03
- **Trigger:** Same story as P-EXP-01

---

### P-EXP-05 - *Which library generates the spreadsheet?*

- **Level:** Vendor/Asset 
- **Viewpoint:** Deployment
  
- **Options:**
  - [ ] **ExcelJS (Node.js)**  
    Styling, formulas and a streaming writer are all first-class.
  - [ ] **SheetJS (Node.js)**  
    Lightweight, but most styling sits behind the paid edition.
  - [ ] **Apache POI (Java)**  
    Mature and complete; means running a JVM alongside the API.
  - [ ] **openpyxl (Python)**  
    Simple API; means a second runtime in the deployment.

- **Bound to:** P-EXP-01, P-EXP-04
- **Trigger:** After P-EXP-01 and P-EXP-04 are answered
- **Refs:** https://github.com/exceljs/exceljs