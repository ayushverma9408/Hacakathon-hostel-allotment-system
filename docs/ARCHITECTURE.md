# Current State and Target Architecture

## Repository state

The repository currently contains two application tracks:

1. **Legacy prototype** under `hostel_allotment_sys/`: static HTML/CSS/JavaScript, stabilized during Phase 2.
2. **New application** at the repository root: Next.js App Router, React, TypeScript and Tailwind CSS, introduced during Phase 3.

The new app has a responsive dashboard shell and a health endpoint at `/api/health`. It does not yet connect to a database or authenticate users. The legacy app remains available during the migration.

## Stabilized legacy prototype

Phase 2 addressed the initial code-review findings:
- One canonical allocation engine is used by the UI.
- Hostel and participant records are validated row by row.
- Room capacity and duplicate room identifiers are checked.
- Common gender aliases are normalized; incompatible room categories are not mixed.
- CSV parsing supports quoted commas, escaped quotes, multiline fields and UTF-8 BOM headers.
- Completed browser runs are saved for the Results page.
- Excel upload is clearly disabled until a real XLS/XLSX parser is added.
- Regression tests are in `tests/allocation.test.js`.

The legacy app remains browser-only and is not suitable for real student records or production use.

## New application stack

- **Full stack:** Next.js App Router + React + TypeScript.
- **UI:** Tailwind CSS with a responsive dashboard shell.
- **Database (Phase 4):** PostgreSQL.
- **ORM and migrations (Phase 4):** Prisma.
- **Authentication (Phase 5):** Auth.js or an equivalent maintained provider, with server-enforced roles.
- **Validation:** Zod at API boundaries.
- **Testing:** Node's built-in test runner for the existing allocation domain, with broader unit and browser tests added as the app grows.
- **Deployment target:** Vercel plus a managed PostgreSQL provider.

This keeps one TypeScript codebase while moving data access, authorization and allocation to the server in controlled stages.

## Core data model (planned)

- User: identity, auth-provider reference, role, active status.
- AcademicSession: year/term and lifecycle status.
- Hostel: name, category/eligibility rules, active status.
- Building: belongs to a hostel.
- Room: building, room number, capacity, occupancy policy, active status.
- Participant: unique institutional identifier, name, approved eligibility attributes, department, year and only the contact fields actually needed.
- AllocationRun: session, creator, status, rule-set version, timestamps.
- Allocation: run, participant, room, bed/slot, status.
- AuditEvent: actor, action, entity, timestamp and safe change metadata.

Actual fields and eligibility policies will be finalized before migrations. The institution's approved policy must govern eligibility; do not assume gender or any other sensitive attribute is the only or correct allocation criterion.

## Security and migration principles

- Never commit secrets, production credentials or real student records.
- Validate input on the server; browser validation is only a usability aid.
- Enforce authorization on every protected server action/API.
- Prevent over-capacity and duplicate assignments with database constraints and transactions.
- Keep an audit trail for administrative changes.
- Migrate functionality incrementally; do not remove the legacy prototype until replacement workflows are tested.
