# AllotmentPro — Hostel Allotment Platform

A hostel administration and room-allocation platform being developed in phases. The repository contains the original browser prototype and a new Next.js application.

## Project status

- **Legacy prototype:** `hostel_allotment_sys/` — static HTML, CSS and JavaScript, with a stabilized allocation engine.
- **New application:** `src/` — Next.js App Router, React, strict TypeScript and Tailwind CSS.
- **Current milestone:** Phase 4 database foundation.
- **Added in Phase 4:** PostgreSQL 16 development setup, Prisma ORM 7 schema and migration, synthetic seed data, typed data access and database-aware health check.
- **Not yet enabled:** authentication, protected management APIs, real participant imports and production allocation execution.

See [Phase 4 notes](docs/PHASE-4.md), [architecture](docs/ARCHITECTURE.md), and [roadmap](docs/ROADMAP.md).

## Run locally

Requires Node.js 20.19+ (Node.js 22 recommended), npm and Docker.

```bash
cp .env.example .env
docker compose up -d db
npm install
npm run db:validate
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Health endpoint: [http://localhost:3000/api/health](http://localhost:3000/api/health).

For details and database reset instructions, see [Phase 4 setup](docs/PHASE-4.md).

## Quality checks

```bash
npm run db:validate
npm run db:generate
npm run lint
npm run typecheck
npm run build
npm run test:allocation
```

## Run the legacy prototype

Open `hostel_allotment_sys/index.html` in a browser, or run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/hostel_allotment_sys/`.

The legacy prototype currently supports CSV uploads only. Do not upload real student records; it has no production authentication or server-side storage.

## Environment and security

Copy `.env.example` to `.env` for local development. The Compose database credentials are local-only placeholders. Never commit real secrets, database credentials, or real student data. No hosted database is provisioned by this repository.

## Development workflow

- Work on feature branches; keep `main` protected from unfinished work.
- Complete and verify each phase before moving to the next.
- Keep the legacy prototype available until the new application replaces its workflows.
