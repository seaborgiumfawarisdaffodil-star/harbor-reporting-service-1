import assert from 'node:assert/strict';
import test from 'node:test';
import { createReport } from '../src/reporting.js';
import { makeEvents, makeRequest } from '../fixtures/synthetic-events.js';
import type { ActivityEvent } from '../src/types.js';

const events: ActivityEvent[] = [
  { eventId: '1', tenantId: 'alpha', occurredAt: '2026-09-08T10:00:00.000Z', kind: 'view', value: 0 },
  { eventId: '2', tenantId: 'alpha', occurredAt: '2026-09-08T10:01:00.000Z', kind: 'purchase', value: 42 },
  { eventId: '3', tenantId: 'beta', occurredAt: '2026-09-08T10:02:00.000Z', kind: 'signup', value: 0 },
  { eventId: '4', tenantId: 'alpha', occurredAt: '2026-10-08T10:00:00.000Z', kind: 'view', value: 0 }
];

test('preserves reporting response shape and totals', () => {
  assert.deepEqual(createReport(events, { tenantIds: ['alpha', 'beta', 'missing'], from: '2026-09-01T00:00:00Z', to: '2026-10-01T00:00:00Z' }), {
    from: '2026-09-01T00:00:00Z',
    to: '2026-10-01T00:00:00Z',
    reports: [
      { tenantId: 'alpha', views: 1, signups: 0, purchases: 1, revenue: 42 },
      { tenantId: 'beta', views: 0, signups: 1, purchases: 0, revenue: 0 },
      { tenantId: 'missing', views: 0, signups: 0, purchases: 0, revenue: 0 }
    ],
    totals: { views: 1, signups: 1, purchases: 1, revenue: 42 }
  });
});
test('invalid date ranges are rejected', () => {
  assert.throws(() => createReport(events, { tenantIds: ['alpha'], from: 'bad date', to: '2026-10-01T00:00:00Z' }), /Invalid/);
});
test('duplicate requested tenants are rejected', () => {
  assert.throws(() => createReport(events, { tenantIds: ['alpha', 'alpha'], from: '2026-09-01', to: '2026-10-01' }), /Duplicate/);
});
test('large synthetic input gives totals consistent with per-tenant reports', () => {
  const result = createReport(makeEvents(1600, 24), makeRequest(24));
  assert.equal(result.totals.views, result.reports.reduce((sum, report) => sum + report.views, 0));
  assert.equal(result.totals.revenue, result.reports.reduce((sum, report) => sum + report.revenue, 0));
});

test('preserve tenant order and date boundaries', () => {
  const rows: ActivityEvent[] = [
    { eventId: '1', tenantId: 'alpha', occurredAt: 'invalid', kind: "view", value: 0 },
    { eventId: '2', tenantId: 'alpha', occurredAt: '2026-09-08T10:00:00Z', kind: "view", value: 0 },
    { eventId: '3', tenantId: 'alpha', occurredAt: '2026-10-01T00:00:00Z', kind: "view", value: 0 }
  ];

  const result = createReport(rows, {
    tenantIds: ['missing', 'alpha'],
    from: "2026-09-08T10:00:00Z",
    to: "2026-10-01T00:00:00Z"
  });

  assert.deepEqual(result.reports.map(r => [r.tenantId, r.views]),
    [['missing', 0], ['alpha', 1]]
  )
})


// {
//   "eventCount": 30000,
//   "tenantCount": 240,
//   "iterations": 7,
//   "medianMs": 75.3,
//   "p95Ms": 103.12,
//   "checksum": "{\"views\":13652,\"signups\":6443,\"purchases\":2608,\"revenue\":325642}"
// }

// {
//   "eventCount": 15000,
//   "tenantCount": 240,
//   "iterations": 7,
//   "medianMs": 41.55,
//   "p95Ms": 56.94,
//   "checksum": "{\"views\":6740,\"signups\":3285,\"purchases\":1295,\"revenue\":162318}"
// }

// {
//   "eventCount": 30000,
//   "tenantCount": 60,
//   "iterations": 7,
//   "medianMs": 21.38,
//   "p95Ms": 27.34,
//   "checksum": "{\"views\":13652,\"signups\":6443,\"purchases\":2608,\"revenue\":325642}"
// }