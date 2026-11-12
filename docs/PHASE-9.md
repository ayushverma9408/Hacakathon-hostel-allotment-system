# Phase 9 — Audit oversight

## Delivered
- Administrator-only audit explorer at `/admin/audit`.
- Server-side protected API at `/api/admin/audit-events`.
- Filters for action, entity type, actor and timestamp range.
- Bounded pagination (25 by default, maximum 100 per page).
- Actor attribution including events whose actor account has since been deleted.
- Newest-first ordering with a stable ID tie-breaker.
- Dashboard navigation shown only to administrators.
- Audit access permission is separate from reporting permissions.

## Existing event coverage
The existing management and allocation workflows already record events for hostel, building and room creation; participant creation, update, deactivation and CSV import; and completed allocation runs. These writes are committed transactionally with the corresponding data changes where implemented.

## Security notes
- Audit page and API both enforce Admin-only access.
- Filters are bounded and dates are validated.
- No audit delete or edit endpoint is exposed.
- Metadata is visible only to administrators.
- Events are not tamper-evident against direct database administrators; archival, retention and immutable storage remain future work.

## Deferred
- CSV export of filtered audit events.
- Configurable retention and archival policy.
- Tamper-evident hash chaining or immutable external storage.
- More complete event coverage for future hostel/building/room edit workflows.
