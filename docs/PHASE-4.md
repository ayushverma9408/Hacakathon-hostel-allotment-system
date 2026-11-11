# Phase 4 — Database and backend foundation

## Delivered

- PostgreSQL 16 local development service through Docker Compose.
- Prisma ORM 7 with the PostgreSQL driver adapter and generated TypeScript client.
- Initial schema and versioned SQL migration.
- Typed Prisma singleton and a hostel data-access function.
- Zod input schemas for hostel and room records.
- Synthetic, repeatable development seed data.
- Health endpoint that reports whether PostgreSQL is configured, connected or unavailable.
- CI steps for Prisma schema validation and client generation.

## Data model

- `User`: administrative identity and role (authentication is not enabled yet).
- `AcademicSession`: session code, date range and lifecycle status.
- `Hostel`, `Building`, `Room`: physical accommodation hierarchy and room capacity.
- `Participant`: session-linked participant record and institutional registration number.
- `AllocationRun`, `Allocation`: versioned allocation runs and bed assignments.
- `AuditEvent`: actor, action, entity reference and JSON metadata.

The migration includes unique identifiers, foreign keys, indexes, and database checks for valid session dates, positive room capacity, non-negative floors, valid academic-year ranges and positive bed numbers.

## Local setup

Requires Node.js 20.19+ (Node.js 22 is recommended), npm and Docker Desktop / Docker Engine.

1. Create the local environment file:

   ```bash
   cp .env.example .env
   ```

2. Start PostgreSQL:

   ```bash
   docker compose up -d db
   ```

3. Install dependencies and generate the client:

   ```bash
   npm install
   npm run db:validate
   npm run db:generate
   ```

4. Apply the checked-in migration and load synthetic data:

   ```bash
   npm run db:migrate:deploy
   npm run db:seed
   ```

5. Start the web application:

   ```bash
   npm run dev
   ```

The health endpoint is `http://localhost:3000/api/health`. It reports `database: "connected"` after the database is reachable.

To stop the local database:

```bash
docker compose down
```

To also remove the local development database volume, use `docker compose down -v`. This permanently deletes that local Docker volume.

## Important boundaries

- The Docker credentials are for local development only. Never reuse them in production.
- No hosted database has been provisioned and no production connection string is stored in this repository.
- Seed rows use synthetic names and `.test` email addresses only.
- Authentication and server-enforced role checks are Phase 5. Do not expose management mutations or real participant records before those controls exist.
- The database schema stores a policy code but does not invent hostel eligibility rules. Institutional policy must define eligibility.
- Allocation transactions and bed-capacity enforcement belong to Phase 7; the current schema adds uniqueness and basic data-integrity constraints.

## Verification

GitHub Actions runs Prisma validation, client generation, legacy allocation tests, lint, TypeScript checks and the Next.js production build. A passing workflow is required before this phase is considered verified.
