# AllotmentPro — Hostel Allotment Platform

A hostel administration and room-allocation platform being developed in phases. The repository contains the original browser prototype and a new Next.js application.

## Project status

- **Legacy prototype:** `hostel_allotment_sys/` — static HTML, CSS and JavaScript, with a stabilized allocation engine.
- **New application:** `src/` — Next.js App Router, React, strict TypeScript and Tailwind CSS.
- **Current milestone:** Phase 7 server-side allocation engine.
- **Database:** PostgreSQL 16 with Prisma ORM 7.
- **Authentication:** Auth.js credentials sign-in, hashed passwords, protected dashboard and server-side role checks.
- **Roles:** Admin, Warden and Staff; no public registration.
- **Management:** role-protected hostel/building/room creation, participant directory, CSV import, search, pagination and audit events.
- **Allocation:** deterministic FIFO preview, administrator-only commit, persisted assignments, waitlist and run history.
- **Not yet enabled:** institution-specific eligibility policy, reallocation/rollback and production deployment.

See [Phase 7 notes](docs/PHASE-7.md), [Phase 6 notes](docs/PHASE-6.md), [Phase 5 notes](docs/PHASE-5.md), [Phase 4 database setup](docs/PHASE-4.md), [architecture](docs/ARCHITECTURE.md), and [roadmap](docs/ROADMAP.md).

## Run locally

Requires Node.js 20.19+ (Node.js 22 recommended), npm and Docker.

```bash
cp .env.example .env
```

Generate a unique Auth.js secret and put it in `.env`:

```bash
npx auth secret
```

Start PostgreSQL and install dependencies:

```bash
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

Remove the bootstrap variables from `.env`, then start the application:

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

For the role matrix, migration details and API examples, see [Phase 5 notes](docs/PHASE-5.md).

## Quality checks

```bash
npm run db:validate
npm run db:generate
npm run lint
npm run typecheck
npm run build
npm run test:allocation
npm run test:csv
npm run test:allocation-engine
```

## Run the legacy prototype

Open `hostel_allotment_sys/index.html` in a browser, or run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/hostel_allotment_sys/`.

The legacy prototype is browser-only and is not protected by the new app's authentication. Do not upload real student records to it.

## Environment and security

Never commit `.env`, real passwords, password hashes, production database credentials or real student data. The Docker credentials are local-only. No hosted database has been provisioned.

Production use still requires rate limiting, account recovery, MFA or institution SSO, secure secret management, monitoring and a security review.

## Development workflow

- Work on feature branches; keep `main` protected from unfinished work.
- Complete and verify each phase before moving to the next.
- Keep the legacy prototype available until replacement workflows are tested.
