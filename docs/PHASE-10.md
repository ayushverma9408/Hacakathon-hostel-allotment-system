# Phase 10 — Security, QA and production readiness

## Delivered in this phase
- Centralized the role-to-permission matrix in a pure, independently testable module. API authorization continues to resolve the current active user from PostgreSQL before checking permissions.
- Added credential schema validation that rejects malformed email addresses, passwords shorter than 14 characters, and passwords exceeding bcrypt's 72-byte UTF-8 input limit. This prevents silent bcrypt truncation.
- Added baseline browser security headers across application routes: frame denial, MIME sniffing protection, a restrictive referrer policy, disabled unnecessary browser capabilities, DNS-prefetch opt-out and same-origin opener policy.
- Enabled HSTS only in production, with a two-year max-age and subdomain/preload directives. Deploy only behind HTTPS when using production mode.
- Added automated regression tests for Admin/Warden/Staff permissions, credential validation and environment-sensitive security headers.
- Added a dedicated security test command and CI step.

## Verification
Run:
```bash
npm install
npm run db:generate
npm run test:security
npm run test:allocation
npm run test:csv
npm run test:allocation-engine
npm run test:reports
npm run lint
npm run typecheck
npm run build
```

## Production deployment checklist
1. Provision managed PostgreSQL with automated backups and point-in-time recovery; test a restore before onboarding real users.
2. Set a unique high-entropy `AUTH_SECRET`, `DATABASE_URL`, and production environment variables in the hosting provider's secret manager. Never commit them.
3. Serve only over HTTPS. HSTS is emitted in production; do not enable production mode on a plain-HTTP deployment.
4. Run `npm run db:migrate:deploy` as a controlled release step before routing traffic to a new application version.
5. Create the first administrator through the one-time bootstrap command, then remove all `BOOTSTRAP_ADMIN_*` variables.
6. Restrict database network access, rotate credentials, monitor application and database errors, and establish an incident-response contact.
7. Configure edge/WAF rate limits for login and sensitive write APIs. The app does not claim a distributed rate limiter; in-memory limits would not be reliable across serverless instances.
8. Keep the legacy static prototype out of real-data workflows; it is not protected by the new app's authentication boundary.
9. Validate role access with non-production accounts and synthetic records before launch.

## Explicitly not certified
This phase is a baseline hardening pass, not a penetration test or compliance certification. MFA/SSO, distributed rate limiting, CSP with nonce support, automated dependency vulnerability scanning, backup automation verification, end-to-end browser tests, load testing and external security review remain future work. No production database or hosting environment has been provisioned or tested by this repository change.
