# AllotmentPro — Hostel Allotment Platform

A hostel administration and room-allocation platform being developed in phases. The repository contains the original browser prototype and a new Next.js application.

## Project status

- **Legacy prototype:** `hostel_allotment_sys/` — static HTML, CSS and JavaScript, with a stabilized allocation engine.
- **New application:** `src/` — Next.js App Router, React, strict TypeScript and Tailwind CSS.
- **Current milestone:** Phase 11 end-to-end testing and release preparation.
- **Database:** PostgreSQL 16 with Prisma ORM 7.
- **Authentication:** Auth.js credentials sign-in, hashed passwords, protected dashboard and server-side role checks.
- **Roles:** Admin, Warden and Staff; no public registration.
- **Management:** role-protected hostel/building/room creation, participant directory, CSV import, search, pagination and audit events.
- **Allocation:** deterministic FIFO preview, administrator-only commit, persisted assignments, waitlist and run history.
- **Reports:** session-based hostel/building/room occupancy, allocation and waitlist CSV exports, print-ready reports.
- **Audit trail:** administrator-only event explorer with actor, action, entity and date filters.
- **Testing:** domain regression tests plus Playwright browser journeys against a disposable PostgreSQL database in CI.
- **Not yet enabled:** institution-specific eligibility policy, reallocation/rollback and production deployment.

See [Phase 11 notes](docs/PHASE-11.md), [Phase 10 notes](docs/PHASE-10.md), [Phase 9 notes](docs/PHASE-9.md), [architecture](docs/ARCHITECTURE.md), and [roadmap](docs/ROADMAP.md).

## Run locally

Requires Node.js 20.19+ (Node.js 22 recommended), npm and Docker.

```bash
cp .env.example .env
npx auth secret
docker compose up -d db
npm install
npm run db:validate
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

Set `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME` and a unique `BOOTSTRAP_ADMIN_PASSWORD` (at least 14 characters) in your local `.env`. Then run:

```bash
npm run auth:create-admin
```

Remove the bootstrap variables from `.env`, then start the app:

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

## Quality checks

```bash
npm run db:validate
npm run db:generate
npm run test:allocation
npm run test:csv
npm run test:allocation-engine
npm run test:reports
npm run test:security
npm run lint
npm run typecheck
npm run build
```

## Browser end-to-end tests

Use a disposable local database only. After applying migrations and seeding, create the E2E admin with the synthetic credentials described in [Phase 11](docs/PHASE-11.md), then run:

```bash
npm run test:e2e:setup
npm run build
npx playwright install chromium
npm run test:e2e
```

The E2E setup creates synthetic Warden and Staff accounts. Do not use these credentials or seed records in a real environment.

## Run the legacy prototype

Open `hostel_allotment_sys/index.html` in a browser, or run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/hostel_allotment_sys/`.

The legacy prototype is browser-only and is not protected by the new app's authentication. Do not upload real student records to it.

## Environment and security

Never commit `.env`, real passwords, password hashes, production database credentials or real student data. The Docker credentials are local-only. No hosted database has been provisioned.

Production use still requires institution-approved allocation policy, rate limiting, account recovery, MFA or institution SSO, secure secret management, monitoring, backup/restore verification and an external security review.

## Development workflow

- Work on feature branches; keep `main` protected from unfinished work.
- Complete and verify each phase before merging.
- Keep the legacy prototype available until replacement workflows are tested.
