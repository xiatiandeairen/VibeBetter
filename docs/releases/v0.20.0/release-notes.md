# v0.20.0 Release Notes — Structured Request Logging Middleware

Production-grade structured logging for every API request.

- Custom `requestLogger` middleware replaces Hono's built-in logger
- Structured JSON output via pino: method, path, status, duration, userAgent
- Duration tracking (ms) for performance monitoring
- User-agent truncated to 50 chars for log hygiene
