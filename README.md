# Hostel Allotment System

A browser-based prototype for assigning participants to hostel rooms using room capacity and participant eligibility data. This repository is being upgraded incrementally into a full-stack hostel allotment management platform.

> **Current status:** The checked-in application is a static HTML/CSS/JavaScript prototype. It is not yet a SvelteKit application and does not currently have a backend, database, or authentication. See [Current State and Target Architecture](docs/ARCHITECTURE.md).

## Current prototype

- Upload participant and hostel CSV files.
- Preview allotment and waitlist results.
- Export a CSV report.
- Dark responsive interface.

**Known limitations:** Excel upload is not implemented in the current JavaScript; CSV parsing is basic; completed allocations are not reliably persisted between pages; and the allocation logic is duplicated. These are tracked for the first stabilization phase.

## Run the current prototype

The existing pages can be opened directly in a modern browser:

1. Open `hostel_allotment_sys/index.html`.
2. Upload the hostel and participant CSV files.
3. Run the allocation and review the preview.
4. Export the CSV report.

For a local static server, run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/hostel_allotment_sys/`.

## Input data

The interface expects hostel data with fields such as `Building`, `Room Number`, `Capacity`, and `Gender`, and participant data with `Name` and `Gender`. The import workflow will be upgraded with explicit column mapping and validation.

Do not upload real student records to this prototype. It currently processes data in the browser and has no production security or access controls.

## Upgrade plan

Development is organized into small, reviewable phases:

1. Repository audit and stabilization.
2. TypeScript application foundation.
3. PostgreSQL database and backend APIs.
4. Authentication and role-based access.
5. Hostel and participant management.
6. Server-side allocation engine.
7. Reports and operational dashboard.
8. Security, testing, and deployment.

See [docs/ROADMAP.md](docs/ROADMAP.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Development

All ongoing work should happen on feature branches. Keep secrets and real participant data out of Git.
