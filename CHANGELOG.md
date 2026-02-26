# Changelog

All notable changes to VibeBetter are documented here.

## [v1.28.0] — 2026-02-26
- `vibe azure` command — format output for Azure DevOps integration

## [v1.27.0] — 2026-02-26
- `apps/server/src/utils/cache-strategy.ts` — cache key builder with namespace, versioning, and TTL strategy

## [v1.26.0] — 2026-02-26
- `vibe preferences` command — user preference management (theme, defaults, format)

## [v1.25.0] — 2026-02-26
- `vibe contributors` command — show contributor statistics and AI usage per author

## [v1.24.0] — 2026-02-26
- `packages/shared/src/types/sla.ts` — SLA, SLO, SLI definitions for platform reliability

## [v1.23.0] — 2026-02-26
- `vibe bitbucket` command — format output for Bitbucket integration

## [v1.22.0] — 2026-02-26
- `apps/server/src/utils/idempotency.ts` — idempotency key handler for POST requests

## [v1.21.0] — 2026-02-26
- `vibe focus` command — filter dashboard to specific file/directory

## [v1.20.0] — 2026-02-26
- `vibe timeline` command — show project metric timeline as ASCII chart

## [v1.19.0] — 2026-02-26
- `packages/shared/src/types/data-retention.ts` — RetentionPolicy, DataClassification interfaces

## [v1.18.0] — 2026-02-26
- `vibe pre-merge` command — run comprehensive pre-merge checks

## [v1.17.0] — 2026-02-26
- `apps/server/src/utils/feature-toggle.ts` — simple feature flag checker using env vars

## [v1.16.0] — 2026-02-26
- `vibe pin` command — pin/bookmark important files for tracking

## [v1.15.0] — 2026-02-26
- `vibe modules` command — list project modules with per-module risk scores

## [v1.14.0] — 2026-02-26
- `packages/shared/src/types/tenant.ts` — Tenant, TenantSettings, TenantQuota interfaces for multi-tenant SaaS

## [v1.13.0] — 2026-02-26
- `vibe gitlab-ci` command — generate .gitlab-ci.yml with VibeBetter integration

## [v1.12.0] — 2026-02-26
- `apps/server/src/utils/query-timer.ts` — decorator/wrapper to log slow database queries (>100ms)

## [v1.11.0] — 2026-02-26
- `vibe tutorial` command — built-in tutorial for new CLI users

## [v1.10.0] — 2026-02-26
- `vibe flow` command — visualize data flow: collect → compute → decide

## [v1.9.0] — 2026-02-26
- `packages/shared/src/types/api-versioning.ts` — ApiVersion, DeprecationNotice interfaces

## [v1.8.0] — 2026-02-26
- `vibe compliance` command — check if metrics meet compliance thresholds

## [v1.7.0] — 2026-02-26
- `apps/server/src/utils/migration-helper.ts` — safe schema migration runner with rollback support

## [v1.6.0] — 2026-02-26
- `vibe notify` command — send metric alerts to stdout, file, or webhook

## [v1.5.0] — 2026-02-26
- `vibe benchmark` command — compare project metrics against industry benchmarks

## [v1.4.0] — 2026-02-26
- `packages/shared/src/types/custom-metrics.ts` — CustomMetric, MetricFormula for user-defined metrics

## [v1.3.0] — 2026-02-26
- `vibe retro` command — generate retrospective data for sprint review

## [v1.2.0] — 2026-02-26
- `apps/server/src/utils/startup-checks.ts` — comprehensive startup validation (DB, Redis, config)

## [v1.1.0] — 2026-02-26
- `vibe interactive` command — interactive menu-driven CLI mode

## [v1.0.0] — 2026-02-26
- `vibe version` command — show detailed version info for all packages

## [v0.99.0] — 2026-02-26
- `packages/shared/src/types/marketplace.ts` — Plugin, PluginManifest, PluginConfig for future marketplace

## [v0.98.0] — 2026-02-26
- `vibe standup` command — generate daily standup summary from recent metrics

## [v0.97.0] — 2026-02-26
- `apps/server/src/utils/db-health.ts` — database connection pool monitoring helper

## [v0.96.0] — 2026-02-26
- `vibe alias` command — create custom command aliases

## [v0.95.0] — 2026-02-26
- `vibe goals` command — set and track metric goals

## [v0.94.0] — 2026-02-26
- `packages/shared/src/types/reports.ts` — ReportTemplate, ReportSchedule, ReportDelivery interfaces

## [v0.93.0] — 2026-02-26
- `vibe pre-review` command — generate pre-review checklist based on changed files

## [v0.92.0] — 2026-02-26
- `apps/server/src/utils/graceful-error.ts` — async route handler error forwarding

## [v0.91.0] — 2026-02-26
- `vibe annotate` command — add notes to files in the risk system

## [v0.90.0] — 2026-02-26
- `vibe sprint-plan` command — suggest sprint priorities based on risk + decisions

## [v0.89.0] — 2026-02-26
- `packages/shared/src/types/sso.ts` — SSOProvider, SSOConfig, SSOSession interfaces (SAML + OIDC)

## [v0.88.0] — 2026-02-26
- `vibe markdown-report` command — generate full analysis as standalone markdown file

## [v0.87.0] — 2026-02-26
- `apps/server/src/utils/env-check.ts` — startup validation for all required env vars

## [v0.86.0] — 2026-02-26
- `vibe quick` command — ultra-short one-line project status

## [v0.85.0] — 2026-02-26
- `vibe forecast` command — predict next week's metrics based on trends

## [v0.84.0] — 2026-02-26
- `packages/shared/src/types/api-analytics.ts` — ApiUsage, RateLimitConfig, QuotaUsage interfaces

## [v0.83.0] — 2026-02-26
- `vibe docker` command — generate Docker setup for VibeBetter server

## [v0.82.0] — 2026-02-26
- `apps/server/src/utils/retry.ts` — generic retry utility with exponential backoff

## [v0.81.0] — 2026-02-26
- `vibe setup-hooks` command — one-command setup for pre-commit + pre-push hooks

## [v0.80.0] — 2026-02-26
- `vibe leaderboard` command — team leaderboard by AI effectiveness

## [v0.79.0] — 2026-02-26
- `packages/shared/src/types/export.ts` — ExportFormat, ExportConfig, ExportJob interfaces

## [v0.78.0] — 2026-02-26
- `vibe github-action` command — generate GitHub Action workflow YAML for VibeBetter

## [v0.77.0] — 2026-02-26
- `apps/server/src/utils/circuit-breaker.ts` — simple circuit breaker for external API calls

## [v0.76.0] — 2026-02-26
- `vibe suggest` command — AI-powered suggestions based on current metrics

## [v0.75.0] — 2026-02-26
- `vibe scorecard` command — project scorecard with letter grades per dimension

## [v0.74.0] — 2026-02-26
- `packages/shared/src/types/notification.ts` — NotificationChannel, NotificationRule, NotificationLog interfaces

## [v0.73.0] — 2026-02-26
- `vibe gitlab` command — format metrics for GitLab CI integration

## [v0.72.0] — 2026-02-26
- `apps/server/src/utils/response-time.ts` — middleware for response time percentile tracking

## [v0.71.0] — 2026-02-26
- `vibe ignore` command — manage files to exclude from analysis

## [v0.70.0] — 2026-02-26
- `vibe profile` command — show developer's personal AI coding stats

## [v0.69.0] — 2026-02-26
- `packages/shared/src/types/webhook-config.ts` — WebhookEndpoint, WebhookEvent, WebhookDelivery interfaces

## [v0.68.0] — 2026-02-26
- `vibe jira` command — format risk report for Jira ticket creation

## [v0.67.0] — 2026-02-26
- `apps/server/src/utils/pagination.ts` — reusable cursor-based pagination helpers

## [v0.66.0] — 2026-02-26
- `vibe why` command — explain why a file is risky with detailed breakdown

## [v0.65.0] — 2026-02-26
- `vibe top` command — live-updating top files by risk (like unix `top`)

## [v0.64.0] — 2026-02-26
- `packages/shared/src/types/organization.ts` — Organization, Team, Membership, Role interfaces

## [v0.63.0] — 2026-02-26
- `vibe git-stats` command — local git statistics (commits/day, authors, file churn)

## [v0.62.0] — 2026-02-26
- `apps/server/src/middleware/cors-config.ts` — centralized CORS configuration with env-based origins

## [v0.61.0] — 2026-02-26
- `vibe what-if` command — simulate weight changes and show PSRI impact

## [v0.60.0] — 2026-02-26
- `vibe hotspots` command — dedicated hotspot analysis with drill-down

## [v0.59.0] — 2026-02-26
- `packages/shared/src/types/audit.ts` — AuditLog, AuditAction interfaces for compliance

## [v0.58.0] — 2026-02-26
- `vibe slack-report` command — format report for Slack webhook posting

## [v0.57.0] — 2026-02-26
- `apps/server/src/utils/crypto.ts` — helper functions for hashing, token generation, HMAC verification

## [v0.56.0] — 2026-02-26
- `vibe onboard` command — interactive CLI onboarding wizard

## [v0.55.0] — 2026-02-26
- `vibe compare-tools` command — compare effectiveness across AI tools

## [v0.54.0] — 2026-02-26
- `packages/shared/src/constants/feature-flags.ts` — FeatureFlag type + default flags

## [v0.53.0] — 2026-02-26
- `vibe deploy-check` command — pre-deployment risk assessment

## [v0.52.0] — 2026-02-26
- `apps/server/src/utils/rate-limit-store.ts` — Redis-backed rate limit store

## [v0.51.0] — 2026-02-26
- `vibe help-me` command — interactive troubleshooting guide based on current metrics

## [v0.50.0] — 2026-02-26
- `vibe trends` command — show metric trend arrows over last 5 snapshots

## [v0.49.0] — 2026-02-26
- `packages/shared/src/types/billing.ts` — BillingEvent, Invoice, PaymentMethod interfaces

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
