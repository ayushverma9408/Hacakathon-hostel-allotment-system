# Current State and Target Architecture

## Repository state

The repository contains two application tracks:

1. **Legacy prototype** under `hostel_allotment_sys/`: static HTML/CSS/JavaScript, stabilized during Phase 2.
2. **New application** at the repository root: Next.js App Router, React, TypeScript and Tailwind CSS.

The new application has a PostgreSQL/Prisma data foundation and Auth.js authentication with role-aware server authorization on the Phase 5 branch. The legacy app remains available during migration and is not covered by the new authentication boundary.

## Stabilized legacy prototype

- One canonical allocation engine is used by the UI.
- Hostel and participant records are validated row by row.
- Room capacity and duplicate room identifiers are checked.
- CSV parsing supports quoted commas, escaped quotes, multiline fields and UTF-8 BOM headers.
- Completed browser runs are saved for the Results page.
- Excel upload is disabled until a real XLS/XLSX parser is added.
- Regression tests are in `tests/allocation.test.cjs`.

The legacy app remains browser-only and is not suitable for real student records or production use.

## New application stack

- **Full stack:** Next.js App Router + React + TypeScript.
- **UI:** Tailwind CSS with a responsive dashboard shell.
- **Database:** PostgreSQL 16 for local development; production provider not selected.
- **ORM and migrations:** Prisma ORM 7 with the PostgreSQL driver adapter.
- **Validation:** Zod schemas at future API boundaries.
- **Authentication:** Auth.js Credentials provider, encrypted JWT sessions (8-hour maximum), bcrypt password hashes and server-side Admin/Warden/Staff permissions.
- **Testing:** Node's built-in test runner for the legacy allocation domain, plus Prisma validation/client generation and Next.js quality checks.
- **Deployment target:** Vercel plus a managed PostgreSQL provider, subject to production configuration.

## Implemented data model

- **User:** email, display name, role, active status and optional bcrypt password hash.
- **AcademicSession:** unique session code, date range and lifecycle status.
- **Hostel:** unique code, name, active status and optional institution-defined policy code.
- **Building:** belongs to a hostel; building codes are unique within a hostel.
- **Room:** belongs to a building; room codes are unique within a building and capacity must be positive.
- **Participant:** unique institutional registration number, session, name and optional academic/contact metadata.
- **AllocationRun:** session, optional creator, algorithm version and lifecycle status.
- **Allocation:** links run, session, participant and room; uniqueness constraints prevent duplicate participant/session and duplicate bed slots within a run.
- **WaitlistEntry:** links a run and participant with a stable queue position and reason; waitlisted people do not receive a fictitious room/bed assignment.
- **AuditEvent:** optional actor, action, entity reference and JSON metadata.\n\n## Reporting\n\n- Reporting endpoints require the `reports:read` permission.\n- Occupancy is derived from the latest completed allocation run for the selected session and active room inventory.\n- Allocation and waitlist CSV exports are generated server-side, quote every field, include a UTF-8 BOM and neutralize spreadsheet formula prefixes.\n- Reports do not write allocation records; print output uses browser print styles. XLSX generation and a dedicated audit-log explorer remain future work.

The initial migration adds foreign keys, indexes, unique constraints and basic CHECK constraints. The Phase 7 planner validates bed numbers against room capacity and commits assignments transactionally. A database-level bed-capacity guard and institution-specific policy checks remain future work.

## Security and migration principles

- Never commit secrets, production credentials or real student records.
- Seed data is synthetic and uses reserved `.test` email addresses.
- Validate input on the server; browser validation is only a usability aid.
- Enforce authorization on every protected server action/API using the centralized permission matrix; re-read current roles and account status from PostgreSQL.
- Prevent over-capacity and duplicate assignments with validated planning, database uniqueness constraints and serializable transactions.
- Do not infer eligibility rules from personal characteristics; institution-approved allocation policy must be explicit.
- Keep an audit trail for administrative changes.
- Do not invent eligibility rules; institution-approved policy governs allocation.
- Migrate functionality incrementally; do not remove the legacy prototype until replacement workflows are tested.
