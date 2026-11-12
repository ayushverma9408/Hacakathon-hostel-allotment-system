# Phase 7 — Allocation engine

## Delivered

- Added a deterministic server-side FIFO allocation planner (fifo-v1).
- Participants are ordered by participant-record creation timestamp, then registration number as a stable tie-breaker. The current schema does not store an application-submission timestamp, so this is a technical baseline rather than a verified first-application timestamp.
- Active rooms are traversed by hostel code, building code and room code; each room expands into bed numbers from 1 through capacity.
- Added preview endpoint. It returns proposed assignments, waitlist positions and capacity statistics without writing records.
- Added administrator-only commit endpoint. It recomputes the plan on the server and writes the run, assignments, waitlist and audit event in one Serializable database transaction.
- Added a separate WaitlistEntry model because a waitlisted participant has no room or bed.
- Added run history and an allocation control page.
- Added duplicate-run and database-conflict protections.
- Added unit tests for deterministic ordering, capacity, waitlist, empty inventory and invalid input.
- Added a CI step for allocation-engine tests.
- Fixed a TypeScript test import that caused the previous Phase 6 CI type-check to fail.

## Allocation policy in this phase

This first production-backed engine intentionally implements only a simple FIFO baseline. It does not infer eligibility or room suitability from personal characteristics. It uses only registration time, registration number and active room capacity.

The institution must define and approve any additional allocation policy (for example, eligibility, accessibility accommodations, room restrictions, priority groups, tie-breakers and appeal handling) before those rules are implemented. This phase does not claim that FIFO is an approved institutional policy.

## Routes

- POST /api/admin/allocations/preview — authorized preview; no database writes.
- GET /api/admin/allocations?sessionId=... — allocation run history.
- POST /api/admin/allocations — administrator-only atomic commit.

## UI

- /admin/allocations — session selection, preview, proposed assignments, waitlist, confirmation and run history.

## Commit safeguards

- Only active academic sessions can be allocated.
- Only active participants in the selected session are considered.
- Participants already allocated in that session are excluded.
- Only rooms in active hostels and active buildings/rooms are considered.
- Every bed number is generated within the room's configured capacity.
- Unique database constraints prevent a participant receiving multiple allocations in one session and prevent a bed slot being duplicated within a run.
- A completed run blocks another run for the same session. Reallocation/rollback is deliberately not enabled yet.
- The commit endpoint recalculates server-side; it never trusts the preview payload from the browser.
- The commit uses Serializable transaction isolation and records an audit event.

## Verification

```bash
npm run db:validate
npm run db:generate
npm run test:allocation
npm run test:csv
npm run test:allocation-engine
npm run lint
npm run typecheck
npm run build
```

CI is the source of truth for this branch's complete checks. Do not treat a queued or running workflow as a pass.

## Remaining work

- Institution-approved eligibility/priority policy and configuration UI.
- Reallocation, cancellation, rollback and waitlist promotion workflows.
- Reports and downloadable allocation registers.
- A database-level guard tying bed numbers to room capacity (current planner validates this before writes).
- End-to-end tests against PostgreSQL for concurrent commit and complete transaction behavior.
- Production security/privacy review, backups and monitoring.
