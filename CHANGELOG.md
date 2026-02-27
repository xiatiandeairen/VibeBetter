# Changelog

All notable changes to VibeBetter are documented here.

## [v2.69.0–v3.8.0] — 2026-02-27 (40-version batch)
- `vibe dependency-graph` command — visualize file dependency graph (v2.69)
- `vibe module-risk` command — per-module risk aggregation (v2.70)
- `vibe team-velocity` command — team velocity metrics across sprints (v2.71)
- `vibe code-churn` command — code churn analysis (v2.72)
- `vibe commit-quality` command — analyze commit message quality (v2.73)
- `vibe review-efficiency` command — PR review efficiency metrics (v2.74)
- `vibe ai-accuracy` command — AI code prediction accuracy analysis (v2.75)
- `vibe skill-matrix` command — team skill matrix visualization (v2.76)
- `vibe incident-risk` command — predict incident risk from metrics (v2.77)
- `vibe capacity-plan` command — capacity planning based on velocity (v2.78)
- `vibe governance` command — governance check: policies, compliance (v2.79)
- `vibe tech-debt-roi` command — ROI of fixing tech debt (v2.80)
- `vibe ai-safety` command — AI code safety assessment (v2.81)
- `vibe migration-plan` command — plan library/framework migrations (v2.82)
- `vibe bus-factor` command — calculate bus factor per module (v2.83)
- `vibe quality-gate` command — configurable quality gates for CI (v2.84)
- `vibe changelog-gen` command — auto-generate changelog from commits (v2.85)
- `vibe deprecation` command — track deprecated API/code usage (v2.86)
- `vibe cognitive-load` command — estimate cognitive load per file (v2.87)
- `vibe sustainability` command — code sustainability score (v2.88)
- `packages/shared/src/types/dependency-graph.ts` — DependencyNode, DependencyEdge, GraphLayout interfaces (v2.89)
- `packages/shared/src/types/module-metrics.ts` — ModuleMetrics, ModuleBoundary, ModuleHealth interfaces (v2.90)
- `packages/shared/src/types/team-velocity.ts` — VelocityPoint, SprintMetrics, Throughput interfaces (v2.91)
- `packages/shared/src/types/code-churn.ts` — ChurnRate, ChurnPattern, StabilityIndex interfaces (v2.92)
- `packages/shared/src/types/commit-quality.ts` — CommitScore, MessageAnalysis, ConventionCompliance interfaces (v2.93)
- `packages/shared/src/types/review-metrics.ts` — ReviewCycle, ReviewerStats, ReviewBottleneck interfaces (v2.94)
- `packages/shared/src/types/ai-accuracy.ts` — AccuracyScore, PredictionResult, ConfidenceInterval interfaces (v2.95)
- `packages/shared/src/types/skill-matrix.ts` — Skill, SkillLevel, SkillGrowth, TeamCapability interfaces (v2.96)
- `packages/shared/src/types/incident-prediction.ts` — IncidentRisk, RiskFactor, MitigationStrategy interfaces (v2.97)
- `packages/shared/src/types/capacity-planning.ts` — CapacityModel, ResourceAllocation, Bottleneck interfaces (v2.98)
- `apps/server/src/utils/dependency-resolver.ts` — resolve file dependencies from imports (v2.99)
- `apps/server/src/utils/module-boundary.ts` — detect and enforce module boundaries (v3.0)
- `apps/server/src/utils/velocity-calculator.ts` — calculate team velocity from PR data (v3.1)
- `apps/server/src/utils/churn-detector.ts` — detect high-churn files and patterns (v3.2)
- `apps/server/src/utils/commit-analyzer.ts` — analyze commit messages for quality (v3.3)
- `apps/server/src/utils/review-analyzer.ts` — analyze review patterns and bottlenecks (v3.4)
- `apps/server/src/utils/accuracy-tracker.ts` — track AI prediction accuracy over time (v3.5)
- `apps/server/src/utils/skill-assessor.ts` — assess developer skills from code patterns (v3.6)
- `apps/server/src/utils/incident-predictor.ts` — predict incidents from metric patterns (v3.7)
- `apps/server/src/utils/capacity-modeler.ts` — model team capacity and workload (v3.8)

## [v2.29.0–v2.68.0] — 2026-02-27 (40-version batch)
- `vibe team-health` command — team health score aggregation (v2.29)
- `vibe ai-roi` command — calculate AI tool ROI: time saved vs cost (v2.30)
- `vibe pair-suggest` command — suggest pair programming partners based on file expertise (v2.31)
- `vibe tech-radar` command — tech radar visualization of project technologies (v2.32)
- `vibe code-owners` command — generate CODEOWNERS file from git history (v2.33)
- `vibe burndown` command — tech debt burndown chart (v2.34)
- `vibe adoption` command — AI tool adoption rate tracking (v2.35)
- `vibe mentor` command — suggest mentorship pairs based on AI usage patterns (v2.36)
- `vibe complexity-trend` command — show complexity trend over time (v2.37)
- `vibe release-risk` command — assess risk level for upcoming release (v2.38)
- `vibe knowledge-map` command — map file knowledge distribution across team (v2.39)
- `vibe sprint-review` command — generate sprint review metrics (v2.40)
- `vibe debt-budget` command — tech debt budget allocation tool (v2.41)
- `vibe refactor-plan` command — generate refactoring plan for high-risk files (v2.42)
- `vibe test-coverage-map` command — visualize test coverage gaps (v2.43)
- `vibe api-health` command — check API endpoint health and performance (v2.44)
- `vibe security-scan` command — basic security check: hardcoded secrets, vulnerable patterns (v2.45)
- `vibe onboard-dev` command — generate onboarding guide for new developers (v2.46)
- `vibe architecture-check` command — check for architectural violations (v2.47)
- `vibe performance-budget` command — check if build sizes meet performance budgets (v2.48)
- `packages/shared/src/types/team-health.ts` — TeamHealthScore, TeamHealthDimension interfaces (v2.49)
- `packages/shared/src/types/ai-roi.ts` — ROICalculation, CostBenefit, TimeMetrics interfaces (v2.50)
- `packages/shared/src/types/pair-programming.ts` — PairSuggestion, ExpertiseMap interfaces (v2.51)
- `packages/shared/src/types/tech-radar.ts` — TechRadarItem, RadarRing, RadarQuadrant interfaces (v2.52)
- `packages/shared/src/types/code-ownership.ts` — CodeOwner, OwnershipMap, OwnershipRule interfaces (v2.53)
- `packages/shared/src/types/burndown.ts` — BurndownPoint, BurndownChart, DebtTarget interfaces (v2.54)
- `packages/shared/src/types/adoption-metrics.ts` — AdoptionRate, AdoptionTrend, ToolMigration interfaces (v2.55)
- `packages/shared/src/types/mentorship.ts` — MentorPair, SkillGap, LearningPath interfaces (v2.56)
- `packages/shared/src/types/complexity-history.ts` — ComplexityPoint, ComplexityTrend interfaces (v2.57)
- `packages/shared/src/types/release-readiness.ts` — ReleaseRisk, DeploymentWindow, RollbackPlan interfaces (v2.58)
- `apps/server/src/utils/team-analytics.ts` — aggregate team metrics from individual developer data (v2.59)
- `apps/server/src/utils/roi-calculator.ts` — calculate AI tool ROI based on PR data (v2.60)
- `apps/server/src/utils/expertise-analyzer.ts` — analyze file expertise from git blame data (v2.61)
- `apps/server/src/utils/dependency-scanner.ts` — scan package.json for outdated/vulnerable deps (v2.62)
- `apps/server/src/utils/architecture-rules.ts` — define and check architectural constraints (v2.63)
- `apps/server/src/utils/performance-tracker.ts` — track API response time percentiles over time (v2.64)
- `apps/server/src/utils/secret-scanner.ts` — scan for potential hardcoded secrets (v2.65)
- `apps/server/src/utils/migration-validator.ts` — validate Prisma migrations before applying (v2.66)
- `apps/server/src/utils/cache-warmer.ts` — pre-warm Redis cache on server startup (v2.67)
- `apps/server/src/utils/health-reporter.ts` — generate detailed health reports for monitoring (v2.68)

## [v2.28.0] — 2026-02-26
- `vibe ecosystem` command — list all VibeBetter ecosystem tools and integrations

## [v2.27.0] — 2026-02-26
- `apps/server/src/utils/performance-budget.ts` — define and check API performance budgets

## [v2.26.0] — 2026-02-26
- `vibe wellbeing` command — developer wellbeing check (session length, break reminders)

## [v2.25.0] — 2026-02-26
- `vibe smart-review` command — suggest optimal reviewers based on file ownership

## [v2.24.0] — 2026-02-26
- `packages/shared/src/types/enterprise.ts` — EnterpriseConfig, SSO, AuditPolicy interfaces

## [v2.23.0] — 2026-02-26
- `vibe discord` command — format VibeBetter report for Discord webhook

## [v2.22.0] — 2026-02-26
- `apps/server/src/utils/graceful-degradation.ts` — fallback strategies when Redis/external services are down

## [v2.21.0] — 2026-02-26
- `vibe celebrate` command — celebrate team achievements when metrics improve

## [v2.20.0] — 2026-02-26
- `vibe roadmap` command — show project roadmap based on risk priorities

## [v2.19.0] — 2026-02-26
- `packages/shared/src/types/referral.ts` — ReferralProgram, ReferralReward interfaces

## [v2.18.0] — 2026-02-26
- `vibe npm-publish` command — check package readiness for npm publishing

## [v2.17.0] — 2026-02-26
- `apps/server/src/utils/memory-monitor.ts` — monitor Node.js heap usage and alert on threshold

## [v2.16.0] — 2026-02-26
- `vibe lang` command — set CLI output language (en/zh placeholder)

## [v2.15.0] — 2026-02-26
- `vibe impact` command — analyze blast radius of file changes

## [v2.14.0] — 2026-02-26
- `packages/shared/src/types/trial.ts` — TrialConfig, TrialStatus, ConversionEvent interfaces

## [v2.13.0] — 2026-02-26
- `vibe monorepo` command — analyze monorepo structure and per-package risk

## [v2.12.0] — 2026-02-26
- `apps/server/src/utils/backup.ts` — database backup helper with timestamp naming

## [v2.11.0] — 2026-02-26
- `vibe learn` command — educational content about AI coding best practices

## [v2.10.0] — 2026-02-26
- `vibe pulse` command — real-time project pulse (quick health + trend in one line)

## [v2.9.0] — 2026-02-26
- `packages/shared/src/types/team-management.ts` — TeamInvite, TeamRole, TeamAnalytics interfaces

## [v2.8.0] — 2026-02-26
- `vibe ansible` command — generate Ansible playbook for VibeBetter deployment

## [v2.7.0] — 2026-02-26
- `apps/server/src/utils/security-headers.ts` — middleware adding security headers (X-Content-Type-Options, X-Frame-Options, etc.)

## [v2.6.0] — 2026-02-26
- `vibe offline` command — cache latest metrics locally for offline access

## [v2.5.0] — 2026-02-26
- `vibe dashboard-url` command — output direct URL to specific dashboard page

## [v2.4.0] — 2026-02-26
- `packages/shared/src/types/marketplace-plugin.ts` — PluginStore, PluginReview, PluginInstall interfaces

## [v2.3.0] — 2026-02-26
- `vibe compose` command — generate docker-compose.yml for full VibeBetter stack

## [v2.2.0] — 2026-02-26
- `apps/server/src/utils/database-monitor.ts` — monitor DB query count, slow queries, connection pool stats

## [v2.1.0] — 2026-02-26
- `vibe ask` command — natural language query interface for metrics

## [v2.0.0] — 2026-02-26
- **MAJOR**: `vibe studio` command — open web dashboard from CLI with auto-login token

## [v1.99.0] — 2026-02-26
- `packages/shared/src/types/changelog-config.ts` — ChangelogFormat, ReleaseNote, SemanticVersion interfaces

## [v1.98.0] — 2026-02-26
- `vibe helm` command — generate Helm chart values for VibeBetter deployment

## [v1.97.0] — 2026-02-26
- `apps/server/src/utils/api-versioning.ts` — API version negotiation middleware

## [v1.96.0] — 2026-02-26
- `vibe autofix` command — suggest automated fixes (add tests, split files)

## [v1.95.0] — 2026-02-26
- `vibe matrix` command — risk matrix visualization (complexity vs frequency) in terminal

## [v1.94.0] — 2026-02-26
- `packages/shared/src/types/support.ts` — SupportTicket, SupportPriority, KnowledgeBase interfaces

## [v1.93.0] — 2026-02-26
- `vibe vercel` command — generate Vercel deployment config

## [v1.92.0] — 2026-02-26
- `apps/server/src/utils/telemetry.ts` — basic telemetry collection for usage analytics (opt-out)

## [v1.91.0] — 2026-02-26
- `vibe calm` command — show only actionable items, suppress noise

## [v1.90.0] — 2026-02-26
- `vibe graph` command — generate dependency graph as DOT format

## [v1.89.0] — 2026-02-26
- `packages/shared/src/types/onboarding-flow.ts` — OnboardingStep, OnboardingProgress, OnboardingTemplate interfaces

## [v1.88.0] — 2026-02-26
- `vibe argocd` command — generate ArgoCD application manifest

## [v1.87.0] — 2026-02-26
- `apps/server/src/utils/data-cleanup.ts` — automatic cleanup of old snapshots, jobs, events beyond retention period

## [v1.86.0] — 2026-02-26
- `vibe cheatsheet` command — display CLI command cheatsheet

## [v1.85.0] — 2026-02-26
- `vibe velocity` command — calculate team velocity metrics (PRs/week, merge rate)

## [v1.84.0] — 2026-02-26
- `packages/shared/src/types/invoice.ts` — InvoiceLine, PaymentStatus, BillingCycle interfaces

## [v1.83.0] — 2026-02-26
- `vibe backstage` command — generate Backstage catalog entry for the project

## [v1.82.0] — 2026-02-26
- `apps/server/src/utils/shutdown-manager.ts` — ordered shutdown of all services (workers, cache, db)

## [v1.81.0] — 2026-02-26
- `vibe journal` command — log daily AI coding notes/observations

## [v1.80.0] — 2026-02-26
- `vibe coverage` command — show test coverage data from CI if available

## [v1.79.0] — 2026-02-26
- `packages/shared/src/types/entitlements.ts` — Entitlement, FeatureGate, UsageLimit interfaces

## [v1.78.0] — 2026-02-26
- `vibe k8s` command — generate Kubernetes deployment manifest for VibeBetter

## [v1.77.0] — 2026-02-26
- `apps/server/src/utils/config-validator.ts` — validate all server configuration on startup with helpful error messages

## [v1.76.0] — 2026-02-26
- `vibe remind` command — set metric check reminders

## [v1.75.0] — 2026-02-26
- `vibe deps` command — analyze file dependencies using import statements

## [v1.74.0] — 2026-02-26
- `packages/shared/src/types/license.ts` — LicenseKey, LicenseTier, LicenseValidation interfaces

## [v1.73.0] — 2026-02-26
- `vibe jenkins` command — generate Jenkins pipeline snippet for VibeBetter integration

## [v1.72.0] — 2026-02-26
- `apps/server/src/utils/health-aggregator.ts` — aggregate health from all subsystems into single status

## [v1.71.0] — 2026-02-26
- `vibe bookmarks` command — manage bookmarked files for quick access

## [v1.70.0] — 2026-02-26
- `vibe diff-files` command — show risk diff for specific files between snapshots

## [v1.69.0] — 2026-02-26
- `packages/shared/src/types/partner.ts` — PartnerIntegration, PartnerAPI, PartnerWebhook interfaces

## [v1.68.0] — 2026-02-26
- `vibe opentelemetry` command — export metrics as OpenTelemetry spans

## [v1.67.0] — 2026-02-26
- `apps/server/src/utils/structured-error.ts` — extended error types with error codes, docs links, and recovery suggestions

## [v1.66.0] — 2026-02-26
- `vibe undo` command — revert last vibe action (e.g., undo decision acceptance)

## [v1.65.0] — 2026-02-26
- `/dashboard/ai-compare` page — side-by-side AI vs Human code quality comparison

## [v1.64.0] — 2026-02-26
- `packages/shared/src/types/api-key-scope.ts` — ApiKeyScope, ScopedPermission interfaces for fine-grained API keys

## [v1.63.0] — 2026-02-26
- `vibe csv` command — export any metric table as CSV

## [v1.62.0] — 2026-02-26
- `apps/server/src/utils/timeout.ts` — request timeout wrapper for long-running operations

## [v1.61.0] — 2026-02-26
- `vibe clean` command — clean up old metric snapshots and collection jobs

## [v1.60.0] — 2026-02-26
- `/dashboard/activity` page — activity feed showing recent PRs, decisions, collections

## [v1.59.0] — 2026-02-26
- `packages/shared/src/types/rbac.ts` — DetailedPermission, RoleBinding, PermissionCheck interfaces

## [v1.58.0] — 2026-02-26
- `vibe email-report` command — generate HTML email body for metric reports

## [v1.57.0] — 2026-02-26
- `apps/server/src/utils/connection-pool.ts` — connection pool manager for external service connections

## [v1.56.0] — 2026-02-26
- `vibe compare-branches` command — compare metrics between git branches

## [v1.55.0] — 2026-02-26
- `/dashboard/trends-detail` page — detailed trend analysis with zoom and annotations

## [v1.54.0] — 2026-02-26
- `packages/shared/src/types/analytics-event.ts` — AnalyticsEvent, EventSchema, EventProcessor interfaces

## [v1.53.0] — 2026-02-26
- `vibe terraform` command — generate Terraform config for VibeBetter infrastructure

## [v1.52.0] — 2026-02-26
- `apps/server/src/utils/batch-processor.ts` — generic batch processing utility with progress callbacks

## [v1.51.0] — 2026-02-26
- `vibe improve` command — suggest specific code improvements for high-risk files

## [v1.50.0] — 2026-02-26
- `/dashboard/modules` page — group files by directory, show per-module risk aggregation

## [v1.49.0] — 2026-02-26
- `packages/shared/src/types/migration.ts` — DataMigration, MigrationStep, MigrationStatus interfaces

## [v1.48.0] — 2026-02-26
- `vibe prometheus` command — expose metrics in Prometheus format

## [v1.47.0] — 2026-02-26
- `apps/server/src/utils/compression.ts` — response compression middleware for large payloads

## [v1.46.0] — 2026-02-26
- `vibe reset` command — reset CLI config and clear cache

## [v1.45.0] — 2026-02-26
- `/dashboard/digest` page showing weekly digest summary

## [v1.44.0] — 2026-02-26
- `packages/shared/src/types/compliance.ts` — ComplianceFramework, ComplianceCheck, ComplianceReport interfaces (SOC2, ISO27001)

## [v1.43.0] — 2026-02-26
- `vibe datadog` command — format metrics for Datadog custom metrics API

## [v1.42.0] — 2026-02-26
- `apps/server/src/utils/concurrency.ts` — semaphore/mutex for limiting concurrent collection jobs

## [v1.41.0] — 2026-02-26
- `vibe shortcuts` command — show all available command shortcuts and aliases

## [v1.40.0] — 2026-02-26
- `/dashboard/goals` page for setting and tracking metric goals

## [v1.39.0] — 2026-02-26
- `packages/shared/src/types/white-label.ts` — ThemeConfig, BrandAssets, CustomDomain interfaces

## [v1.38.0] — 2026-02-26
- `vibe sonarqube` command — format metrics compatible with SonarQube

## [v1.37.0] — 2026-02-26
- `apps/server/src/utils/json-schema.ts` — JSON Schema validation utility for API request bodies

## [v1.36.0] — 2026-02-26
- `vibe feedback` command — submit feedback from CLI to improve recommendations

## [v1.35.0] — 2026-02-26
- `/dashboard/timeline` page showing metric history timeline

## [v1.34.0] — 2026-02-26
- `packages/shared/src/types/usage-tracking.ts` — UsageEvent, UsageReport, QuotaAlert interfaces

## [v1.33.0] — 2026-02-26
- `vibe notebook` command — export analysis as Jupyter-style markdown notebook

## [v1.32.0] — 2026-02-26
- `apps/server/src/utils/event-bus.ts` — simple in-process event emitter for decoupled service communication

## [v1.31.0] — 2026-02-26
- `vibe doctor` command — diagnose common setup issues

## [v1.30.0] — 2026-02-26
- `/dashboard/changelog` page showing project change history

## [v1.29.0] — 2026-02-26
- `packages/shared/src/types/access-control.ts` — Permission, AccessPolicy, ResourceScope interfaces for ABAC

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
