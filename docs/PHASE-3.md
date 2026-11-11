# Phase 3 — Full-stack application foundation

## Scope

This phase introduces the new application alongside the existing static prototype. It does not yet connect a database or provide real user authentication.

## Added

- Next.js App Router with React and strict TypeScript.
- Tailwind CSS and a responsive admin dashboard shell.
- Shared navigation and dashboard presentation patterns.
- Metadata and a typed Next.js configuration.
- Environment-variable example file with placeholders only.
- ESLint and TypeScript validation scripts.
- Health endpoint at `/api/health`.
- A dedicated root-level application structure under `src/`.

## Local development

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:allocation
```

The health endpoint is available at `http://localhost:3000/api/health`.

## Important boundaries

- PostgreSQL is not connected yet; the database environment variable is a placeholder.
- Authentication and role-based access are not implemented yet.
- Dashboard counts are intentionally shown as unavailable rather than fabricated.
- The original static prototype remains under `hostel_allotment_sys/`.
- Do not put real student information or credentials into this repository.

## Next phase

Phase 4 adds PostgreSQL, Prisma schema and migrations, seed data, and the first server-side data-access/API layer.
