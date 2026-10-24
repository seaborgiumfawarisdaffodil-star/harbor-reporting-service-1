# Reporting latency incident — intake

**Incident ID:** PERF-142  
**Service:** Harbor Reporting Service  
**Status:** Under investigation  
**Environment:** Local reproduction using deterministic synthetic events

## Observed symptom
Following a recent reporting refactor, customers requesting multi-tenant activity summaries report slow responses. Existing functional tests remain green. The release cannot proceed until the bottleneck is explained and performance is measured against the documented budget.

## Reproduction request
30,000 synthetic events covering a reporting month; request summaries for 240 tenants; measure repeated synchronous calculation duration after warm-up.

## Acceptance contract
- Representative query target: median under 75 ms on the recording machine, if this threshold is achievable and comparable under stable conditions.
- Correctness: preserve the API contract in README and all existing functional assertions.
- Benchmark: preserve request shape and dataset across baseline and corrected measurements; report multiple individual samples and their aggregate rather than cherry-picking a run.
- If environmental variability prevents a reliable latency conclusion, document that limitation and recommend a hold.

## Relevant change history (synthetic)
- `release/1.7`: baseline functional implementation validated against small tenant sets.
- `release/1.8`: tenant-reporting aggregation refactor to centralize shared calculation paths.
- `PERF-142`: first reported slow multi-tenant request after release/1.8 candidate was built.

## Investigation questions
1. Can the regression be reproduced with the supplied benchmark?
2. How does request latency change with event and tenant counts?
3. Which stage of reporting dominates work, and why?
4. Does a narrowly scoped correction preserve ordering, filtering, totals, and errors?
5. Is evidence sufficient to release or should the change be held?

This document intentionally does not contain a root-cause finding or solution.
