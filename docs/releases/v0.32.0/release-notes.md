# v0.32.0 Release Notes — Request ID Middleware (Maturity)

Unique request ID tracking for all API requests.

- `X-Request-Id` header added to every response via middleware
- Uses `crypto.randomUUID()` for ID generation
- Preserves client-provided request IDs when present
- Registered before request logger for full traceability
