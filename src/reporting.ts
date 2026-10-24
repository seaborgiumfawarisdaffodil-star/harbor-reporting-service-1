import type { ActivityEvent, ReportRequest, ReportingResponse, TenantReport } from './types.js';

function emptyReport(tenantId: string): TenantReport {
  return { tenantId, views: 0, signups: 0, purchases: 0, revenue: 0 };
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

  const reports = request.tenantIds.map(emptyReport);
  const byTenant = new Map(
    reports.map(report => [report.tenantId, report] as const)
  );

  for (const event of events) {
    const report = byTenant.get(event.tenantId);
    if(!report) continue;
    const occuredAt = Date.parse(event.occurredAt);
    if(!(occuredAt >= from && occuredAt < to)) continue;

    if(event.kind === "view") {
      report.views +=1;
    } else if(event.kind === 'signup') {
      report.signups +=1;
    } else {
      report.purchases +=1;
      report.revenue += event.value;
    }
  }
  
  const totals = reports.reduce((acc, report) => ({
    views: acc.views + report.views,
    signups: acc.signups + report.signups,
    purchases: acc.purchases + report.purchases,
    revenue: acc.revenue + report.revenue
  }), { views: 0, signups: 0, purchases: 0, revenue: 0 });

  return { from: request.from, to: request.to, reports, totals };
}
