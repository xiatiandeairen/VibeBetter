# v0.22.0 Release Notes — Transparent Rate Limit Headers

Enterprise-grade rate limiting transparency for API consumers.

- Standard HTTP rate limit headers on all rate-limited responses
- `X-RateLimit-Limit` — Maximum requests per window
- `X-RateLimit-Remaining` — Remaining requests in current window
- `X-RateLimit-Reset` — Unix timestamp when the window resets
- Headers present on both success (2xx) and 429 (Too Many Requests) responses
