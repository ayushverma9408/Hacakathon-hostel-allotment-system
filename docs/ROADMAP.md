# Product Roadmap

## Goal
Turn the original hostel-allotment prototype into a secure, full-stack hostel allocation platform while preserving the existing workflow during migration.

## Phase 1 — Repository audit and foundation
- [x] Confirm the actual repository structure and implementation.
- [x] Create isolated development branches.
- [x] Document the current state and target architecture.

## Phase 2 — Stabilize the existing prototype
- [x] Consolidate allocation into one canonical engine.
- [x] Validate hostel and participant rows, capacity, gender and duplicate rooms.
- [x] Improve CSV parsing and persist browser results.
- [x] Add regression tests and a GitHub Actions workflow.
- [ ] Confirm the regression workflow passes.

See [Phase 2 implementation notes](PHASE-2.md).

## Phase 3 — Full-stack application foundation
- [x] Introduce Next.js App Router, React and strict TypeScript.
- [x] Add Tailwind CSS and a responsive admin dashboard shell.
- [x] Add environment placeholders, linting and type-check scripts.
- [x] Add a health endpoint and foundation documentation.
- [ ] Confirm lint, typecheck and production build in CI.

See [Phase 3 implementation notes](PHASE-3.md).

## Phase 4 — Database and backend
- Configure PostgreSQL and Prisma.
- Design users, academic sessions, hostels, buildings, rooms, participants, allocation runs, allocations and audit events.
- Add migrations, seed data and a typed data-access layer.
- Implement validated server-side APIs.

## Phase 5 — Authentication and roles
- Add secure sign-in and session handling.
- Implement Admin, Warden and Read-only/Staff permissions.
- Protect all management APIs on the server.

## Phase 6 — Hostel and participant management
- CRUD for hostels, buildings, rooms and capacity.
- Participant import with column mapping, validation, duplicate detection and error preview.
- Search, filters, bulk actions and audit history.

## Phase 7 — Production allocation engine
- Move deterministic allocation to the server.
- Support configurable eligibility rules and priorities.
- Prevent over-capacity, duplicate assignments and cross-category mismatches.
- Add preview, confirmation, waitlists and reproducible allocation runs.

## Phase 8 — Reports and operations
- Allocation dashboard, occupancy analytics and waitlist management.
- CSV/XLSX exports and printable reports.
- Change history and administrative audit logs.

## Phase 9 — Security, QA and deployment
- Authorization and input-validation tests.
- Accessibility, responsive, performance and security review.
- Production environment setup, database backups and deployment documentation.

## Working agreement
- Complete one phase at a time.
- Work on feature branches; do not overwrite `main` during development.
- Keep each change small and reviewable.
- Run relevant checks before merging.
- Do not commit secrets, real student data or production credentials.
