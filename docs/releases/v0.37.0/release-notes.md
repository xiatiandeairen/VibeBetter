# v0.37.0 Release Notes — Metrics Collector (Maturity)

In-memory request counter for API endpoint monitoring.

- `MetricsCollector` singleton tracks request counts per endpoint
- Methods: `increment()`, `getCount()`, `getAll()`, `getTotalRequests()`, `reset()`
- Tracks last-accessed timestamp per endpoint
- Lightweight in-memory implementation with no external dependencies
