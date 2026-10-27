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

test("preserve tenent order and exclusive end", () => {
  const result = createReport([
    { eventId: 'a', tenantId: 'alpha', occurredAt: '2026-09-01T00:00:00Z', kind: 'view', value: 0 },
    { eventId: 'b', tenantId: 'alpha', occurredAt: '2026-10-01T00:00:00Z', kind: 'view', value: 0 },
  ], {
    tenantIds: ['missing', 'alpha'],
    from: '2026-09-01T00:00:00Z',
    to: '2026-10-01T00:00:00Z'
  })

  assert.deepEqual(result.reports.map(r => [r.tenantId, r.views]), [
    ['missing', 0], ['alpha', 1]
  ])
});


// 3.02 - 15000
//  6.12 - 30000, 60