# Harbor Reporting Service

A local, synthetic TypeScript reporting-service fixture.

## Environment
- Node.js 20 or 22
- npm

## Commands
```bash
npm install
npm run typecheck
npm test
npm run benchmark
```

The benchmark runs the same query against deterministic input on each attempt, with a warm-up. It prints individual durations, median and p95. Results depend on machine load and must be measured locally before declaring success.

## Contract
- `createReport(events, request)` must return requested tenants in their original order, including zero-valued tenants.
- Reporting interval is `[from, to)` (UTC ISO timestamps).
- Only requested tenants and in-range events contribute to aggregates.
- Views, signups, purchases and purchase revenue must be unchanged by any performance correction.
- Duplicate tenant requests and invalid intervals must remain rejected.

## Incident context
See `docs/incident-intake.md`. No production data is included.
