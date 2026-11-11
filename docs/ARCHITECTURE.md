# Current State and Target Architecture

## Current repository (verified)
The default branch currently contains a static HTML/CSS/JavaScript prototype under `hostel_allotment_sys/`:
- `index.html`: file upload and allocation interface.
- `results.html`: reads previous results from browser localStorage.
- `js/main.js`: browser-side file parsing, UI, and a second allocation implementation.
- `js/allocation.js`: a separate AllocationEngine and data validation helpers.

There is no checked-in `package.json`, server application, database schema, migration, or authentication implementation in the inspected root. The README's SvelteKit/TypeScript/Tailwind description does not match the actual checked-in code. Tailwind is loaded from its CDN in the HTML pages.

## Risks found during the initial code review
1. Excel uploads are advertised in the UI, but `main.js` explicitly rejects XLS/XLSX files.
2. CSV parsing splits on commas and newlines, so quoted commas, escaped quotes, and multiline cells are not handled correctly.
3. There are two allocation implementations. The UI calls the one in `main.js`, not the richer `AllocationEngine`.
4. The UI allocation compares raw lowercased gender strings; values such as `M`, `Male`, and `Boy` are not consistently normalized.
5. The allocation helper's required-field validation uses `some` across fields, allowing rows missing required columns to pass.
6. Capacity parsing silently defaults invalid values to one; negative, fractional, and non-numeric capacities need explicit validation.
7. The main page does not persist a completed run for the results page, despite that page expecting `allocationResults` in localStorage.
8. The README's project path contains a spelling mismatch and its setup instructions refer to a SvelteKit app that is not present.

These are initial static-review findings, not a claim that every runtime path has been tested.

## Recommended target stack
- **Full stack:** Next.js (App Router) + TypeScript.
- **UI:** Tailwind CSS + reusable accessible components.
- **Database:** PostgreSQL.
- **ORM and migrations:** Prisma.
- **Authentication:** Auth.js or an equivalent maintained authentication provider, with server-enforced roles.
- **Validation:** Zod at every API boundary.
- **Testing:** Vitest for domain logic and Playwright for critical user journeys.
- **Deployment:** Vercel for the application and a managed PostgreSQL provider.

This stack gives us one TypeScript codebase, server-side allocation and authorization, durable relational data, and a straightforward deployment path. We will migrate in stages rather than replacing the prototype all at once.

## Core data model (planned)
- User: identity, password/auth-provider reference, role, active status.
- AcademicSession: year/term and lifecycle status.
- Hostel: name, category/eligibility rules, active status.
- Building: belongs to a hostel.
- Room: building, room number, capacity, occupancy policy, active status.
- Participant: unique institutional identifier, name, gender/category where required by the institution, department, year, and contact fields.
- AllocationRun: session, creator, status, rule-set version, timestamps.
- Allocation: run, participant, room, bed/slot, status.
- AuditEvent: actor, action, entity, timestamp, and safe change metadata.

Actual fields and eligibility policies will be finalized before database migrations. We should not assume gender or other sensitive attributes are the only or correct allocation criteria; the institution's approved policy must govern those rules.
