# Product Roadmap

## Goal
Turn the original hostel-allotment prototype into a secure, full-stack hostel allocation platform while preserving the existing workflow during migration.

## Phase 1 — Repository audit and foundation
- [x] Confirm the actual repository structure and implementation.
- [x] Create isolated development branches.
- [x] Document the current state and target architecture.

## Phase 2 — Stabilize the existing prototype
- [x] Consolidate allocation into one canonical engine.
- [x] Validate hostel and participant rows, capacity and duplicate rooms.
- [x] Improve CSV parsing and persist browser results.
- [x] Add regression tests and a GitHub Actions workflow.

## Phase 3 — Full-stack application foundation
- [x] Introduce Next.js App Router, React and strict TypeScript.
- [x] Add Tailwind CSS and a responsive admin dashboard shell.
- [x] Add environment placeholders, linting and type-check scripts.
- [x] Add a health endpoint and foundation documentation.

## Phase 4 — Database and backend foundation
- [x] Add PostgreSQL local development through Docker Compose.
- [x] Define Prisma models and relational migrations.
- [x] Add synthetic seed data and typed server-side data access.
- [x] Add Zod schemas and a database-aware health endpoint.

## Phase 5 — Authentication and roles
- [x] Add Auth.js credentials sign-in and eight-hour JWT sessions.
- [x] Hash provisioned passwords with bcrypt; disable public registration.
- [x] Add Admin, Warden and Staff permission matrix.
- [x] Protect dashboard routes and enforce permissions in API handlers.
- [x] Add a one-time administrator bootstrap command.

## Phase 6 — Hostel and participant management
- [x] Add role-protected hostel, building and room creation.
- [x] Add participant registration, editing, deactivation, search and pagination.
- [x] Add CSV import with validation and duplicate handling.
- [x] Record audit events for management mutations and imports.

## Phase 7 — Allocation engine
- [x] Move deterministic FIFO allocation planning to the server.
- [x] Add read-only preview and administrator-only transactional commit.
- [x] Persist bed assignments, waitlist entries and allocation run history.
- [x] Prevent duplicate participant/session assignments and duplicate bed slots within a run.
- [ ] Implement institution-approved eligibility, priority and accommodation policy.
- [ ] Add reallocation, rollback and waitlist promotion.

## Phase 8 — Reports and operations
- [x] Add session-scoped occupancy analytics.
- [x] Add allocation and waitlist CSV exports with spreadsheet-formula protection.
- [x] Add print-friendly reports and role-protected reporting APIs.
- [ ] Add XLSX exports and advanced reporting filters.

## Phase 9 — Audit oversight
- [x] Add an administrator-only audit trail with actor, action, entity and date filters.
- [x] Add pagination and actor attribution.
- [x] Protect audit UI and API server-side.
- [ ] Add exportable audit records, retention policy and tamper-evident archival.

## Phase 10 — Security, QA and deployment
- [x] Centralize and test the Admin/Warden/Staff permission matrix.
- [x] Validate credentials and bcrypt input length.
- [x] Add baseline security headers and production-only HSTS.
- [x] Add security regression tests to CI.
- [x] Document production secrets, migrations, backups, HTTPS and edge rate-limiting requirements.
- [ ] Add distributed rate limiting, MFA/SSO, CSP nonce support and external security review.

## Phase 11 — End-to-end testing and release preparation
- [x] Add Playwright browser tests for Admin, Warden and Staff journeys.
- [x] Exercise hostel/building/room and participant creation, allocation preview/commit, CSV reporting and audit review.
- [x] Run browser tests against a disposable PostgreSQL service in CI.
- [x] Keep E2E accounts and records synthetic and isolated from production.
- [ ] Complete accessibility, responsive, load and external security testing.
- [ ] Provision production hosting/database and verify backup restoration.
- [ ] Obtain institutional approval for allocation rules and operational sign-off.

See [Phase 11 implementation notes](PHASE-11.md).

## Working agreement
- Complete one phase at a time.
- Work on feature branches; do not overwrite `main` during development.
- Keep each change small and reviewable.
- Run relevant checks before merging.
- Do not commit secrets, real student data or production credentials.
