# Phase 11 — End-to-end testing and release preparation

## Scope
Phase 11 adds a real-browser test layer backed by an ephemeral PostgreSQL service in CI. Tests use synthetic `.test` accounts and seeded sample records only.

## Browser journeys covered
- Warden sign-in, inventory management access, allocation preview-only behavior and denial from the administrator audit explorer.
- Staff sign-in, read-only hostel and participant pages, aggregate report access, participant-level export restriction and audit denial.
- Administrator sign-in, hostel/building/room creation, participant registration, allocation preview and commit, CSV report download and audit-event visibility.

## Test infrastructure
- Playwright runs against the production Next.js build.
- GitHub Actions provisions a disposable PostgreSQL service, applies migrations, seeds synthetic records and creates temporary role accounts.
- Chromium browser tests run after the standard Prisma, unit, lint, typecheck and production-build checks.
- Browser traces and screenshots are retained on test failure by Playwright's reporter configuration.

## Run locally
Start PostgreSQL and configure `DATABASE_URL`, then:
```bash
npm install
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
npm run auth:create-admin
npm run test:e2e:setup
npm run build
npx playwright install chromium
npm run test:e2e
```
For local E2E, set `BOOTSTRAP_ADMIN_EMAIL=e2e-admin@example.test`, `BOOTSTRAP_ADMIN_NAME=E2E Administrator` and `BOOTSTRAP_ADMIN_PASSWORD=E2E-Test-Password-2026!` before running `npm run auth:create-admin`. This password is for disposable local test data only; never use it for a real account.

## Release checklist
- Confirm the full CI workflow passes on the release candidate.
- Review the allocation policy with the institution before using it for real assignments.
- Provision managed PostgreSQL, TLS, secret storage, backup/restore and monitoring independently of this test environment.
- Validate real deployment domains, OAuth/Auth.js host configuration and reverse-proxy behavior.
- Complete external security review and user acceptance testing with synthetic data before handling real student records.

## Limitations
- E2E accounts and seeded records are synthetic and intended only for disposable test databases.
- The tests do not constitute a penetration test, accessibility certification, load test or institution-wide user acceptance sign-off.
- Production deployment and backup restoration are not performed by CI.
