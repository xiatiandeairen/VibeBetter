# Release Notes — v0.89.0 → v1.8.0

## v0.89.0 — SSO Types (Commercial)
- `packages/shared/src/types/sso.ts` — SSOProvider, SSOConfig, SSOSession interfaces for SAML + OIDC enterprise single sign-on

## v0.90.0 — Sprint Plan (Product)
- `vibe sprint-plan` command — suggest sprint priorities based on PSRI, TDI, AI rate, and hotspot analysis

## v0.91.0 — Annotate (User)
- `vibe annotate` command — add, list, and clear notes on files within the risk system

## v0.92.0 — Graceful Error (Maturity)
- `apps/server/src/utils/graceful-error.ts` — wrapAsync + errorMiddleware for automatic async route error forwarding

## v0.93.0 — Pre-Review (Scenario)
- `vibe pre-review` command — generate a file-by-file review checklist based on git diff

## v0.94.0 — Report Types (Commercial)
- `packages/shared/src/types/reports.ts` — ReportTemplate, ReportSchedule, ReportDelivery interfaces for scheduled reporting

## v0.95.0 — Goals (Product)
- `vibe goals` command — set, track, and check metric goals (e.g. "AI Success Rate > 90")

## v0.96.0 — Alias (User)
- `vibe alias` command — create custom command aliases (e.g. `vibe c` → `vibe check`)

## v0.97.0 — DB Health (Maturity)
- `apps/server/src/utils/db-health.ts` — database connection pool monitoring with health classification

## v0.98.0 — Standup (Scenario)
- `vibe standup` command — generate daily standup summary (yesterday/today/blockers) from metrics

## v0.99.0 — Marketplace Types (Commercial)
- `packages/shared/src/types/marketplace.ts` — Plugin, PluginManifest, PluginConfig interfaces for future marketplace

## v1.0.0 — Version Info (Product)
- `vibe version` command — show detailed version info for all packages + runtime environment

## v1.1.0 — Interactive Mode (User)
- `vibe interactive` command — interactive menu-driven CLI mode with numbered choices

## v1.2.0 — Startup Checks (Maturity)
- `apps/server/src/utils/startup-checks.ts` — comprehensive startup validation for DB, Redis, config, and environment

## v1.3.0 — Retro (Scenario)
- `vibe retro` command — generate retrospective data (went well / improve / action items) for sprint review

## v1.4.0 — Custom Metrics Types (Commercial)
- `packages/shared/src/types/custom-metrics.ts` — CustomMetric, MetricFormula, MetricThreshold for user-defined metrics

## v1.5.0 — Benchmark (Product)
- `vibe benchmark` command — compare project metrics against industry benchmarks

## v1.6.0 — Notify (User)
- `vibe notify` command — send metric alerts to stdout, file, or webhook

## v1.7.0 — Migration Helper (Maturity)
- `apps/server/src/utils/migration-helper.ts` — safe schema migration runner with rollback support

## v1.8.0 — Compliance (Scenario)
- `vibe compliance` command — check if project metrics meet compliance thresholds

---

**Cycle**: Commercial → Product → User → Maturity → Scenario (4 full cycles)
**Total**: 20 versions across 5 categories
