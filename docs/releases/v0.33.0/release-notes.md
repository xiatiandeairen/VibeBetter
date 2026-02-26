# v0.33.0 Release Notes — CI/CD Integration (Scenario)

CLI command outputting structured JSON metrics for CI pipelines.

- `vibe ci` outputs project metrics as JSON for pipeline consumption
- `--fail-on-risk` threshold flag (default 0.7) exits with code 1 if PSRI exceeds limit
- Includes all key metrics: AI success/stable rate, PSRI, TDI, hotspot ratio
- Machine-readable status field: `pass` or `fail`
