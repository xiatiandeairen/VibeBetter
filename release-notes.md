# Release Notes — v2.9.0 to v2.28.0 (Final Batch)

_200-round sprint complete. This is the final batch of 20 versions._

## v2.9.0 — Enterprise Types (Commercial)
- `packages/shared/src/types/enterprise.ts` — EnterpriseConfig, SSOConfig, AuditPolicy, DataRegion interfaces for enterprise customers

## v2.10.0 — AI Score (Product)
- `packages/cli/src/commands/ai-score.ts` — `vibe ai-score` computes a single AI effectiveness score (0-100) combining success rate, stability, risk, coverage, and defect density

## v2.11.0 — Walkthrough (User)
- `packages/cli/src/commands/walkthrough.ts` — `vibe walkthrough` provides a guided tour of all VibeBetter CLI features grouped by category

## v2.12.0 — Error Catalog (Maturity)
- `apps/server/src/utils/error-catalog.ts` — centralized error code catalog (VB1001–VB1010) with HTTP status, description, docs URL, and resolution guidance

## v2.13.0 — Pulumi (Scenario)
- `packages/cli/src/commands/pulumi.ts` — `vibe pulumi` generates Pulumi TypeScript infrastructure code for AWS or Azure deployment

## v2.14.0 — Contract Types (Commercial)
- `packages/shared/src/types/contract.ts` — ServiceContract, SLATerms, EscalationPolicy, EscalationStep interfaces

## v2.15.0 — Radar Chart (Product)
- `packages/cli/src/commands/radar.ts` — `vibe radar` renders an ASCII radar chart of PSRI dimensions in the terminal

## v2.16.0 — FAQ (User)
- `packages/cli/src/commands/faq.ts` — `vibe faq` shows frequently asked questions about metrics and commands with search/filter

## v2.17.0 — Performance Monitor (Maturity)
- `apps/server/src/utils/performance-monitor.ts` — tracks memory usage, event loop lag, GC metrics, and CPU usage with threshold warnings

## v2.18.0 — Chromatic (Scenario)
- `packages/cli/src/commands/chromatic.ts` — `vibe chromatic` generates visual regression test configuration for Chromatic/Storybook

## v2.19.0 — Channel Types (Commercial)
- `packages/shared/src/types/channel.ts` — DistributionChannel, ChannelConfig, ChannelMetrics, ChannelPerformance interfaces

## v2.20.0 — Predict (Product)
- `packages/cli/src/commands/predict.ts` — `vibe predict` uses linear regression on historical weekly data to forecast future risk trends

## v2.21.0 — Demo (User)
- `packages/cli/src/commands/demo.ts` — `vibe demo` runs a demo with sample data to showcase VibeBetter features without a real project

## v2.22.0 — Tracing (Maturity)
- `apps/server/src/utils/tracing.ts` — request tracing utility with trace ID propagation (W3C, B3, Jaeger formats), span management, and header injection/extraction

## v2.23.0 — Playwright (Scenario)
- `packages/cli/src/commands/playwright.ts` — `vibe playwright` generates Playwright E2E tests for the VibeBetter dashboard

## v2.24.0 — Growth Types (Commercial)
- `packages/shared/src/types/growth.ts` — GrowthMetric, Funnel, FunnelStageData, Cohort, Retention, GrowthSummary interfaces

## v2.25.0 — Release Notes (Product)
- `packages/cli/src/commands/release-notes.ts` — `vibe release-notes` auto-generates release notes from PR data with categorization

## v2.26.0 — Celebrate (User)
- `packages/cli/src/commands/celebrate.ts` — `vibe celebrate` celebrates metric achievements (e.g., "AI Success Rate hit 90%!")

## v2.27.0 — Backup (Maturity)
- `apps/server/src/utils/backup.ts` — database backup trigger utility wrapping pg_dump with compression, pruning, and status reporting

## v2.28.0 — Ecosystem (Scenario)
- `packages/cli/src/commands/ecosystem.ts` — `vibe ecosystem` shows all 23 integrations across 10 categories with status indicators
