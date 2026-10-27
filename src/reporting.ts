import type { ActivityEvent, ReportRequest, ReportingResponse, TenantReport } from './types.js';

function emptyReport(tenantId: string): TenantReport {
  return { tenantId, views: 0, signups: 0, purchases: 0, revenue: 0 };
}

function summarize(events: ActivityEvent[], tenantId: string, from: number, to: number): TenantReport {
  const result = emptyReport(tenantId);
  const matching = events.filter(event => event.tenantId === tenantId &&
    Date.parse(event.occurredAt) >= from && Date.parse(event.occurredAt) < to);

  for (const event of matching) {
    if (event.kind === 'view') result.views += 1;
    if (event.kind === 'signup') result.signups += 1;
    if (event.kind === 'purchase') {
      result.purchases += 1;
      result.revenue += event.value;
    }
  }
  return result;
}

export function createReport(events: ActivityEvent[], request: ReportRequest): ReportingResponse {
  const from = Date.parse(request.from);
  const to = Date.parse(request.to);
  if (!Number.isFinite(from) || !Number.isFinite(to) || from >= to) {
    throw new Error('Invalid reporting interval');
  }
  if (new Set(request.tenantIds).size !== request.tenantIds.length) {
    throw new Error('Duplicate tenant IDs are not supported');
  }

  const reports = request.tenantIds.map(tenantId => summarize(events, tenantId, from, to));
  const totals = reports.reduce((acc, report) => ({
    views: acc.views + report.views,
    signups: acc.signups + report.signups,
    purchases: acc.purchases + report.purchases,
    revenue: acc.revenue + report.revenue
  }), { views: 0, signups: 0, purchases: 0, revenue: 0 });

  return { from: request.from, to: request.to, reports, totals };
}
