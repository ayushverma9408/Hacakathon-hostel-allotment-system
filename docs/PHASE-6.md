# Phase 6 — Hostel and participant management

## Delivered

- Protected hostel directory with create and nested building/room inventory views.
- Role-protected create APIs for hostels, buildings and rooms.
- Room floor and capacity validation; duplicate hostel/building/room codes return conflict responses.
- Participant directory with search, session filter, pagination and active/inactive status.
- Participant create, edit and safe deactivation (soft status change).
- CSV import for registration number, full name, email, department and academic year.
- CSV parser supports UTF-8 BOM, quoted commas, escaped quotes, multiline fields and CRLF.
- CSV validation reports invalid rows, rejects duplicate registration numbers within the file and skips database duplicates.
- Zod validation and server-side permission checks on every management endpoint.
- Audit events for hostel, building, room and participant mutations/imports.
- Dashboard metrics now read counts and configured room capacity from PostgreSQL.
- CSV parser regression tests added to CI.

## Permissions

| Capability | Admin | Warden | Staff |
|---|---:|---:|---:|
| Read hostel/building/room inventory | Yes | Yes | Yes |
| Create hostel/building/room | Yes | Yes | No |
| Read participants | Yes | Yes | Yes |
| Create/update/deactivate participants | Yes | Yes | No |
| Import participant CSV | Yes | Yes | No |

The API enforces permissions through the centralized permission helper; the UI only hides write controls as a convenience and is not the security boundary.

## Routes

- GET/POST /api/admin/hostels
- POST /api/admin/buildings
- POST /api/admin/rooms
- GET /api/admin/sessions
- GET/POST /api/admin/participants
- PATCH/DELETE /api/admin/participants/:participantId
- POST /api/admin/participants/import

## UI

- /admin/hostels — hostel, building and room inventory.
- /admin/participants — participant directory, manual entry, editing, deactivation and CSV import.

## CSV format

Required headers: registrationNo, fullName.

Optional headers: email, department, academicYear.

Example:

```csv
registrationNo,fullName,email,department,academicYear
DEMO-REG-003,"Sample Participant Three",,Computer Science,2
```

Imports are limited to 2 MB. Rows with invalid values are reported and skipped. Existing registration numbers are skipped using database uniqueness. The API returns inserted/skipped counts and invalid row numbers.

## Local verification

After checking out the Phase 6 branch:

```bash
npm install
docker compose up -d db
npm run db:migrate:deploy
npm run db:generate
npm run db:seed
npm run auth:create-admin
npm run test:csv
npm run lint
npm run typecheck
npm run build
npm run dev
```

The database seed uses synthetic DEMO records only. Do not import real student data into a local demo environment unless its access controls, retention and security have been reviewed.

## Scope limits

- Academic sessions are selected from existing ACTIVE sessions; this phase does not yet include session creation/management UI.
- Hostel/building/room update/deactivation UI is not included yet; creation and inventory reading are available.
- CSV import is single-session and does not yet provide a dry-run preview or configurable header mapping.
- Occupancy/available-bed counts depend on confirmed allocations and are not represented as available capacity yet.
- Production readiness still requires security review, backups, monitoring and institution-specific privacy controls.
