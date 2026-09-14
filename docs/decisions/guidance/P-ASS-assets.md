# Problem Space - *Asset managment*

## Sprint 1

### P-ASS-01 - *What attributes should an asset schema hold?*

**Level:** Conceptual  
**Viewpoint:** Information  

**Options:**  
- [ ] **Static schema**  
  Traditional relational design with fixed columns for all attributes.
- [ ] **Entity-Attribute-Value (EAV) model**  
  Dynamic schema using rows to store entity attributes flexibly.
- [ ] **JSON column**  
  Semi-structured storage utilizing a native JSON column for extensible and variable fields.
- [ ] **Hybrid approach**  
  Fixed static columns for core/queryable attributes combined with a JSON column for asset-specific attributes.

**Trigger:** S-SP1-01

---

### P-ASS-02 - *What is the meaning of asset deletion?*

**Level:** Conceptual  
**Viewpoint:** Information / Lifecycle  

**Options:**  
- [ ] **Hard delete**  
  Permanently remove the asset record from the database.
- [ ] **Soft delete**  
  Maintain the record and mark deletion with a `deleted_at` timestamp.
- [ ] **Active status**  
  Manage lifecycle via a `status` enumeration (e.g., *active*, *retired*, *disposed*) without deleting records.

**Trigger:** S-SP1-01

---

### P-ASS-03 - *What is the pagination strategy?*

**Level:** Technical  
**Viewpoint:** Interface / API  

**Options:**  
- [ ] **Offset/limit**  
  SQL `LIMIT/OFFSET`; simple to implement and allows direct page jumping, but performance degrades on large offsets and data shifts can cause duplicates/misses.
- [ ] **Cursor-based**  
  Keyspace pagination using a sequential column (e.g., `id` or `created_at`); high performance and resilient to real-time inserts, but does not support jumping to arbitrary pages.
- [ ] **No pagination**  
  Return full collections in a single payload; zero pagination complexity, but introduces latency and memory bottlenecks as the dataset scales.

**Trigger:** S-SP1-02

---

### P-ASS-04 - *How to resolve write-write conflicts?*

**Level:** Technical  
**Viewpoint:** Concurrency / Data Integrity  

**Options:**  
- [ ] **Last-write-wins (LWW)**  
  Overwrite the record with the most recent payload; zero coordination overhead, but risks silent data loss when updates occur concurrently.
- [ ] **Optimistic locking**  
  Track changes with a `version` number or timestamp; rejects or retries writes if the record was modified since read.
- [ ] **Pessimistic locking**  
  Lock target database rows (`SELECT FOR UPDATE`) during read-modify-write; guarantees serialization, but introduces latency and deadlock potential.

**Trigger:** S-SP1-01

---

### P-ASS-05 - *Where to place data validation?*

**Level:** Architectural  
**Viewpoint:** Development / Security  

**Options:**  
- [ ] **DTOs in API layer**  
  Validate input schemas at application ingress; rejects malformed requests early, but leaves internal domain logic unprotected.
- [ ] **Domain layer**  
  Enforce business invariants within entities and value objects; ensures consistent state across all consumers, but adds boilerplate for simple type checks.
- [ ] **Database constraints**  
  Rely on database checks, `FOREIGN KEY`, `UNIQUE`, and `NOT NULL` rules; guarantees final consistency, but produces generic database errors.
- [ ] **Hybrid approach**  
  Sanitize and validate payload shape at DTO ingress, enforce business invariants in the domain layer, and keep database constraints as a defensive safety net.

**Trigger:** S-SP1-01