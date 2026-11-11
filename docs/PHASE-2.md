# Phase 2 — Allocation reliability

## What changed

- Consolidated allocation into `hostel_allotment_sys/js/allocation.js`; the page now calls this single engine instead of maintaining a second allocation algorithm.
- Normalized common gender values (`M`, `Male`, `Boy`; `F`, `Female`, `Girl`; and `Other`).
- Enforced gender-matched rooms. A room categorized for one gender is not silently reused for another category.
- Validated every hostel row and every participant row, including required fields and positive whole-number room capacity.
- Rejected duplicate building/room combinations and unsupported gender values.
- Expanded room capacity into individual bed slots and added allocation statistics.
- Replaced the naive CSV split with a parser that supports quoted commas, escaped quotes, multiline quoted values, CRLF files, and UTF-8 BOM headers.
- Made the upload UI explicitly CSV-only. Excel uploads are not implemented yet; export an Excel workbook as CSV before uploading.
- Persisted completed results to `localStorage`, which is the storage format currently read by the Results page.
- Added Node's built-in test-runner regression coverage.

## Run the regression tests

Requires Node.js 18 or newer:

```bash
node --test tests/allocation.test.js
```

The tests cover gender normalization and matching, capacity expansion, invalid rows/capacities, duplicate rooms, repeated execution, and waitlisting.

## Current boundaries

This remains a browser-only prototype. Results are stored in the current browser's local storage, not a shared database. Authentication, server-side persistence, Excel parsing, and multi-user concurrency are intentionally deferred to later phases.
