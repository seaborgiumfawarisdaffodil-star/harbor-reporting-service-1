import type { ActivityEvent, ReportRequest } from '../src/types.js';

// Deterministic synthetic events. No production or personal records.
export function makeEvents(count: number, tenantCount: number): ActivityEvent[] {
  let state = 11235813;
  const next = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0);
  const base = Date.parse('2026-09-01T00:00:00.000Z');
  const output: ActivityEvent[] = [];
  for (let i = 0; i < count; i++) {
    const tenantId = `tenant-${String(next() % tenantCount).padStart(3, '0')}`;
    const kindIndex = next() % 10;
    const kind: ActivityEvent['kind'] = kindIndex < 6 ? 'view' : kindIndex < 9 ? 'signup' : 'purchase';
    const occurredAt = new Date(base + (next() % (30 * 86400000))).toISOString();
    output.push({ eventId: `event-${i}`, tenantId, occurredAt, kind, value: kind === 'purchase' ? (next() % 250) + 1 : 0 });
  }
  return output;
}
export function makeRequest(tenantCount: number): ReportRequest {
  return {
    tenantIds: Array.from({ length: tenantCount }, (_, index) => `tenant-${String(index).padStart(3, '0')}`),
    from: '2026-09-05T00:00:00.000Z',
    to: '2026-09-27T00:00:00.000Z'
  };
}
