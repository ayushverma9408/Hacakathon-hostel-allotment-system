# Current State and Target Architecture

## Repository state
The repository contains the original static prototype under `hostel_allotment_sys/` and the new Next.js App Router application under `src/`. The legacy prototype remains outside the new application's authentication boundary and must not be used with real student records.

## Application stack
- Next.js App Router, React, TypeScript and Tailwind CSS.
- PostgreSQL 16 with Prisma ORM 7 and versioned migrations.
- Auth.js Credentials authentication, bcrypt password hashes and eight-hour JWT sessions.
- Server-side role authorization for Admin, Warden and Staff.
- Zod request validation and Node's built-in test runner.
- Playwright end-to-end tests against a production Next.js build.

## Implemented capabilities
- Hostel, building and room creation with capacity validation.
- Participant registration, editing, deactivation, CSV import, search and pagination.
- Deterministic FIFO allocation preview, administrator-only transactional commit, assignments, waitlist and run history.
- Session-based occupancy analytics and formula-neutralized CSV exports.
- Administrator-only audit explorer with bounded pagination and filters.
- Baseline security headers, credential validation and CI security regression checks.

## Role boundaries
- Admin: all implemented operational permissions.
- Warden: manage hostel and participant data, preview allocations, read reports and export participant-level CSV; cannot commit allocations or view the audit explorer.
- Staff: read-only hostel, participant, allocation and aggregate report access; cannot export participant-level reports or view audit events.

## Phase 11 verification
- CI provisions a disposable PostgreSQL 16 service and applies the checked-in migrations.
- Synthetic seed data and temporary E2E role accounts are created only in that ephemeral CI database.
- Playwright verifies Warden restrictions, Staff read-only behavior and the administrator workflow from sign-in through inventory creation, participant registration, allocation commit, CSV export and audit inspection.
- E2E tests run against the production Next.js build, not a mocked UI server.

## Known limitations
- The legacy prototype is not protected by the new app's authentication boundary.
- The FIFO allocation order is a technical baseline, not institution-approved policy; eligibility and priority rules require formal approval.
- Reallocation, rollback, waitlist promotion, XLSX exports and advanced report filters remain future work.
- Distributed rate limiting, MFA/SSO, CSP nonce support, external penetration testing, accessibility certification, load testing and production backup/restore verification are not implemented.
- No production hosting or managed database has been provisioned.

## Security and migration principles
- Never commit secrets, production credentials or real student records.
- Seed data and E2E accounts use synthetic reserved `.test` email addresses.
- Validate input on the server; browser validation is only a usability aid.
- Enforce authorization on every protected server action/API and re-read current roles and account status from PostgreSQL.
- Keep allocation constraints transactional and audit administrative mutations.
- Do not infer eligibility from personal characteristics; institution-approved allocation policy must be explicit.
- Migrate functionality incrementally; do not remove the legacy prototype until replacement workflows are tested.
