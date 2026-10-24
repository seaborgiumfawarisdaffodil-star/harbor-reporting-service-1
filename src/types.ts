export type EventType = 'view' | 'signup' | 'purchase';
export interface ActivityEvent {
  eventId: string;
  tenantId: string;
  occurredAt: string;
  kind: EventType;
  value: number;
}
export interface ReportRequest {
  tenantIds: string[];
  from: string;
  to: string;
}
export interface TenantReport {
  tenantId: string;
  views: number;
  signups: number;
  purchases: number;
  revenue: number;
}
export interface ReportingResponse {
  from: string;
  to: string;
  reports: TenantReport[];
  totals: Omit<TenantReport, 'tenantId'>;
}
