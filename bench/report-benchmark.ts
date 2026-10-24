import { performance } from 'node:perf_hooks';
import { createReport } from '../src/reporting.js';
import { makeEvents, makeRequest } from '../fixtures/synthetic-events.js';

const eventCount = Number(process.env.EVENT_COUNT ?? 30000);
const tenantCount = Number(process.env.TENANT_COUNT ?? 240);
const iterations = Number(process.env.ITERATIONS ?? 7);
if (![eventCount, tenantCount, iterations].every(v => Number.isSafeInteger(v) && v > 0)) {
  throw new Error('All benchmark inputs must be positive integers');
}
const events = makeEvents(eventCount, tenantCount);
const request = makeRequest(tenantCount);
createReport(events, request); // warm-up
const durations: number[] = [];
let checksum = '';
for (let iteration = 0; iteration < iterations; iteration++) {
  const start = performance.now();
  const result = createReport(events, request);
  durations.push(Number((performance.now() - start).toFixed(2)));
  checksum = JSON.stringify(result.totals);
}
const sorted = [...durations].sort((a, b) => a - b);
const median = sorted[Math.floor(sorted.length / 2)];
const p95 = sorted[Math.ceil(sorted.length * .95) - 1];
console.log(JSON.stringify({ eventCount, tenantCount, iterations, durationsMs: durations, medianMs: median, p95Ms: p95, checksum }, null, 2));
