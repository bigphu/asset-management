# Problem Space - *File exportation*

## Sprint 1

### P-EXP-01 - *Where will the Excel file be created?*

**Level:** Conceptual  
**Viewpoint:** Architecture / Processing  

**Options:**  
- [ ] **In browser (client-side)**  
  Offloads computation to the user's browser; preserves server resources, but is limited by client memory and performance for large datasets.
- [ ] **Backend**  
  Generated directly on the API server; handles moderate datasets reliably, but consumes server CPU and RAM.
- [ ] **Dedicated report generation service**  
  Offloaded to an isolated microservice or worker pool; prevents heavy reporting tasks from starving the core API of resources.

**Raises:** P-EXP-02, P-EXP-04, P-EXP-05
**Trigger:** S-SP1-03

---

### P-EXP-02 - *Should the exportation be synchronous or asynchronous?*

**Level:** Technical  
**Viewpoint:** Performance / API Design  

**Options:**  
- [ ] **Returned in API response body**  
  Direct file stream or download in the HTTP response; simple to implement for small exports, but risks HTTP timeouts if generation takes too long.
- [ ] **Background worker + Download link**  
  Queued job that generates the file asynchronously and provides a download link once ready; ideal for large exports, completely avoiding HTTP timeouts.
- [ ] **Hybrid approach**  
  Synchronous generation for small or filtered datasets, automatically switching to asynchronous background jobs when record counts exceed a specific threshold.

**Trigger:** Exportation may take more than 3 seconds

---

### P-EXP-03 - *What is the scope of exported data?*

**Level:** Technical  
**Viewpoint:** Interface / API  

**Options:**  
- [ ] **In current page**  
  Exports only the rows currently visible in the active pagination view.
- [ ] **All filtered rows**  
  Exports all records matching the current active search query and filters across all pages.
- [ ] **Entire table**  
  Exports the complete, unfiltered dataset from the database table.
- [ ] **Checkbox for user choice**  
  Provides a UI modal empowering users to explicitly select their desired export scope.

**Trigger:** S-SP1-03

---

### P-EXP-04 - *Should the file be built in RAM or streamed?*

**Level:** Technical  
**Viewpoint:** Concurrency / Resource Management  

**Options:**  
- [ ] **In-memory buffer**  
  Construct the entire workbook structure in RAM before transmitting; straightforward to implement, but vulnerable to out-of-memory (OOM) crashes on large files.
- [ ] **Response streaming**  
  Write the workbook stream chunk-by-chunk directly to the HTTP response or disk; highly memory-efficient, but requires library support for streaming writers.

**Trigger:** S-SP1-03

---

### P-EXP-05 - *Which XLSX-building library to use?*

**Level:** Architectural  
**Viewpoint:** Development / Technology Stack  

**Options:**  
- [ ] **Server-side (ExcelJS / Node.js, Apache POI / Java, openpyxl / Python)**  
  Feature-rich ecosystems with robust support for styling, complex formulas, and streaming large datasets on the server.
- [ ] **Client-side (SheetJS / xlsx)**  
  Lightweight JavaScript library running entirely in the browser, best suited for client-side generation of smaller datasets.

**Trigger:** after P-EXP-01 is decided