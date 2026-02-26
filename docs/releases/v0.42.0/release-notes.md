# v0.42.0 Release Notes — Input Sanitization (Maturity)

Server-side input sanitization utility helpers.

- `stripHtml()` removes HTML tags from input
- `limitLength()` truncates strings to a max length
- `escapeForLog()` escapes newlines/tabs for safe logging
- `sanitizeInput()` combines strip + trim + limit in one call
