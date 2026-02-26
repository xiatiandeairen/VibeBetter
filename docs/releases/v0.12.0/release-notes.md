# v0.12.0 Release Notes — Error Recovery & Resilience

Graceful error handling and retry logic for production reliability.

- CLI API client: 3 retries with exponential backoff (1s, 2s, 4s) for network errors
- Reusable `ErrorBoundary` component for React error containment
- Error messages include recovery suggestions (e.g., "Run `vibe status` to check connection")
