# Product Roadmap

## Goal
Turn the current hostel-allotment prototype into a secure, full-stack hostel allocation platform while preserving the existing allocation workflow.

## Phase 1 — Repository audit and foundation
- [x] Confirm the real repository structure and current implementation.
- [x] Create an isolated development branch.
- [x] Document the current state and target architecture.
- [ ] Establish automated tests and linting.
- [ ] Fix allocation, validation, CSV parsing, and persistence defects before migrating the UI.

## Phase 2 — Application foundation
- Introduce a maintainable TypeScript application structure.
- Build a responsive dashboard shell and shared UI components.
- Configure environment variables, validation, logging, and error handling.
- Add development, test, and production scripts.

## Phase 3 — Database and backend
- Design PostgreSQL entities for users, academic sessions, hostels, buildings, rooms, participants, allocation runs, allocations, and audit events.
- Add migrations, seed data, and a typed data-access layer.
- Implement validated server-side APIs; never trust client-submitted capacity or allocation results.

## Phase 4 — Authentication and roles
- Add secure sign-in and session handling.
- Implement Admin, Warden, and Read-only/Staff permissions.
- Protect all management APIs on the server.

## Phase 5 — Hostel and participant management
- CRUD for hostels, buildings, rooms, and capacity.
- Participant import with column mapping, validation, duplicate detection, and an error preview.
- Search, filters, bulk actions, and audit history.

## Phase 6 — Allocation engine
- Implement deterministic, test-covered allocation on the server.
- Support configurable eligibility rules and priorities.
- Prevent over-capacity, duplicate assignments, and cross-category mismatches.
- Add preview, confirmation, waitlists, and reproducible allocation runs.

## Phase 7 — Reports and operations
- Allocation dashboard, occupancy analytics, waitlist management.
- CSV/XLSX exports and printable reports.
- Change history and administrative audit logs.

## Phase 8 — Security, QA, and deployment
- Authorization and input-validation tests.
- Accessibility, responsive, performance, and security review.
- Production environment setup, database backups, and deployment documentation.

## Working agreement
- Complete one phase at a time.
- Work on a feature branch; do not overwrite `main during development.
- Keep each change small and reviewable.
- Run the relevant checks before merging.
- Do not commit secrets, real student data, or production credentials.
