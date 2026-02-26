# Changelog

All notable changes to VibeBetter are documented here.

## [v0.48.0] — 2026-02-26
- `vibe export-config` command — export current CLI configuration as YAML

## [v0.47.0] — 2026-02-26
- `apps/server/src/utils/validators.ts` — common validation helpers (isValidUrl, isValidEmail, isValidProjectId)

## [v0.46.0] — 2026-02-26
- `vibe history` command — metric history displayed as sparkline charts

## [v0.45.0] — 2026-02-26
- `vibe summary` command — combined check + insights + risk in one output

## [v0.44.0] — 2026-02-26
- `packages/shared/src/constants/integrations.ts` — supported integrations registry (GitHub, GitLab, Jira, Slack)

## [v0.43.0] — 2026-02-26
- `vibe badge` command — generate shields.io markdown badges for README

## [v0.42.0] — 2026-02-26
- `apps/server/src/utils/sanitize.ts` — input sanitization helpers (stripHtml, limitLength, sanitizeInput)

## [v0.41.0] — 2026-02-26
- `vibe explain` command — explain what PSRI/TDI/AI metrics mean

## [v0.40.0] — 2026-02-26
- `vibe search` command — search files by name in project metrics

## [v0.39.0] — 2026-02-26
- `packages/shared/src/types/subscription.ts` — Subscription/Plan/Usage/Invoice interfaces

## [v0.38.0] — 2026-02-26
- `vibe hook install` command — install/uninstall VibeBetter pre-commit git hooks

## [v0.37.0] — 2026-02-26
- `apps/server/src/utils/metrics-collector.ts` — in-memory API request counter per endpoint

## [v0.36.0] — 2026-02-26
- `vibe config` command — view/edit CLI configuration

## [v0.35.0] — 2026-02-26
- `vibe watch` command — poll metrics every 30s with delta change display

## [v0.34.0] — 2026-02-26
- `packages/shared/src/constants/pricing.ts` — pricing tier definitions (Free/Pro/Enterprise)

## [v0.33.0] — 2026-02-26
- `vibe ci` command — output JSON metrics for CI/CD pipelines with risk threshold gate

## [v0.32.0] — 2026-02-26
- `apps/server/src/middleware/request-id.ts` — X-Request-Id header middleware using crypto.randomUUID()

## [v0.31.0] — 2026-02-26
- `vibe review` command — suggest files to review based on risk score

## [v0.30.0] — 2026-02-26
- `vibe changelog` command — list recent commits with AI detection tags

## [v0.29.0] — 2026-02-26
- `GET /api/v1/admin/projects/stats` — per-project pull request counts endpoint

## [v0.28.0] — 2026-02-26
- `vibe health` command — comprehensive project health assessment with letter grade

## [v0.27.0] — 2026-02-26
- `vibe dashboard` — terminal TUI dashboard with live metrics

## [v0.26.0] — 2026-02-26
- `vibe report --format html` — HTML report export

## [v0.25.0] — 2026-02-26
- `vibe init --auto` — auto-detect project settings

## [v0.24.0] — 2026-02-26
- Graceful shutdown handling (SIGTERM/SIGINT)

## [v0.23.0] — 2026-02-26
- `vibe diff` — snapshot comparison

## [v0.22.0] — 2026-02-26
- Transparent rate limit headers (X-RateLimit-*)

## [v0.21.0] — 2026-02-26
- `vibe pr --markdown` — PR risk summary

## [v0.20.0] — 2026-02-26
- Structured request logging middleware

## [v0.19.0] — 2026-02-26
- Alert configuration model + CRUD API

## [v0.18.0] — 2026-02-26
- Configurable branding (white-label env vars)

## [v0.17.0] — 2026-02-26
- CLI contextual tips (showTip)

## [v0.16.0] — 2026-02-26
- Enhanced health check (DB + Redis)

## [v0.15.0] — 2026-02-26
- Custom decision rule type definitions

## [v0.14.0] — 2026-02-26
- Admin usage stats endpoint

## [v0.13.0] — 2026-02-26
- `vibe fix` — actionable fix suggestions

## [v0.12.0] — 2026-02-26
- CLI retry logic + React ErrorBoundary

## [v0.11.0] — 2026-02-26
- DigestService + `vibe digest` + weekly report endpoint

## [v0.10.0] — 2026-02-26
- Team comparison view + JSON export

## [v0.9.0] — 2026-02-26
- `vibe analyze` — local offline analysis

## [v0.8.0] — 2026-02-26
- CLI: 8 initial commands (init, status, check, risk, decisions, insights, report, sync)

## [v0.7.0] — 2026-02-26
- Quality engineering: +196% test coverage, refactoring, Quality Dashboard

## [v0.6.0] — 2026-02-26
- Onboarding + OpenAPI + API Key + Redis + template engine + VS Code extension

## [v0.5.0] — 2026-02-26
- AI attribution + org-level + benchmarks + CI + docs restructure

## [v0.4.0] — 2026-02-26
- Webhook + OAuth + drill-down + compare + security hardening + 45 tests

## [v0.3.0] — 2026-02-25
- Settings + radar chart + toast + skeleton + positive decision rules

## [v0.2.0] — 2026-02-25
- PSRI 6D + TDI + decisions engine + AI behavior analysis

## [v0.1.0] — 2026-02-25
- MVP: collection → computation → visualization pipeline
