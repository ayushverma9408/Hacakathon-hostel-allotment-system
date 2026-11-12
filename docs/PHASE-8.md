# Phase 8 — Reports and analytics

## Delivered
- Protected reporting page at `/admin/reports` for Admin, Warden and Staff roles.
- Session-scoped occupancy summary derived from the latest completed allocation run.
- Hostel, building and room capacity, occupied-bed, vacant-bed and occupancy percentages.
- Server-generated allocation-register and waitlist CSV exports.
- UTF-8 BOM and CRLF output, quoted fields, escaped quotes and spreadsheet-formula neutralization.
- Print-friendly report layout using browser print.
- Permission checks and input validation on both report APIs.
- Participant-level exports are restricted to Admin and Warden; Staff can view aggregate occupancy only.

## Data and calculation rules
- Reports never recalculate or mutate allocation results.
- Assigned counts are taken from CONFIRMED allocations in the completed run.
- Waitlist counts are taken from that run's waitlist entries.
- Capacity uses currently active rooms belonging to active hostels. This means later inventory changes can affect historical capacity totals; the report should be interpreted as current configured capacity against the saved run's assignments.
- No synthetic or fabricated records are included.

## Deferred
- XLSX export (CSV is provided; an actual XLSX file will require a dedicated spreadsheet writer).
- Waitlist promotion and allocation changes.
- Dedicated audit-log explorer and advanced filters.
- Institution-approved eligibility and accommodation policy.
