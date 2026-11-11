# AllotmentPro — Hostel Allotment Platform

A hostel administration and room-allocation platform being developed in phases. The repository contains the original browser prototype and a new Next.js application.

## Project status

- **Legacy prototype:** `hostel_allotment_sys/` — static HTML, CSS and JavaScript, with a stabilized allocation engine.
- **New application:** `src/` — Next.js App Router, React, strict TypeScript and Tailwind CSS.
- **Current milestone:** Phase 3 application foundation.
- **Not yet connected:** PostgreSQL, authentication, persistent records, and production allocation APIs.

See [Phase 3 notes](docs/PHASE-3.md), [architecture](docs/ARCHITECTURE.md), and [roadmap](docs/ROADMAP.md).

## Run the new application

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Health endpoint: [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Quality checks

```bash
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

Copy `.env.example` to `.env.local` for local development. The database and auth values are placeholders for upcoming phases. Never commit real secrets, database credentials, or real student data.

## Development workflow

- Work on feature branches; keep `main` protected from unfinished work.
- Complete and verify each phase before moving to the next.
- Keep the legacy prototype available until the new application replaces its workflows.
