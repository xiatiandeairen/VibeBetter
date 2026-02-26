# Changelog

All notable changes to this project will be documented in this file.

---

## [v0.27.0] — 2026-02-26

### Highlights
- **Terminal Dashboard (TUI)** — `vibe dashboard` displays key metrics at a glance
- Color-coded AI Success Rate, Stable Rate, PSRI, TDI, PR counts, hotspots
- Integrates AI behavior stats and pending decision counts
- Single-screen summary for terminal-native workflows

### Added
- `packages/cli/src/commands/dashboard.ts` — Terminal dashboard command
- v0.27.0 release archive (4 standard files)

### Changed
- CLI commands: 13 → 14
- CLI version bumped to 0.27.0

---

## [v0.26.0] — 2026-02-26

### Highlights
- **HTML Report Export** — `vibe report --format html` generates a self-contained HTML report
- Dark theme with inline CSS, ready for email/Confluence/PDF
- Report formats: text, markdown, json, html (4 total)

### Changed
- `packages/cli/src/commands/report.ts` — Added HTML format with inline-styled dark theme
- v0.26.0 release archive (4 standard files)

---

## [v0.25.0] — 2026-02-26

### Highlights
- **Auto-detect Project** — `vibe init --auto` reads git remote to auto-fill project ID
- Extracts owner/repo slug from origin remote URL
- `--project` becomes optional when using `--auto`

### Changed
- `packages/cli/src/commands/init.ts` — Added `--auto` flag with git remote detection
- v0.25.0 release archive (4 standard files)

---

## [v0.24.0] — 2026-02-26

### Highlights
- **Graceful Shutdown** — Server handles SIGTERM/SIGINT for clean exit
- Closes BullMQ worker and queue connections before process exit
- 10-second force-exit timeout as safety net

### Changed
- `apps/server/src/index.ts` — Added `gracefulShutdown()` with signal handlers
- v0.24.0 release archive (4 standard files)

---

## [v0.23.0] — 2026-02-26

### Highlights
- **Snapshot Diff** — `vibe diff` compares metrics between snapshots
- Shows delta, direction arrows (↑↓→), and percentage change
- Inverted display for risk metrics (PSRI/TDI: lower is better)

### Added
- `packages/cli/src/commands/diff.ts` — Snapshot comparison command
- v0.23.0 release archive (4 standard files)

### Changed
- CLI commands: 12 → 13
- CLI version bumped to 0.23.0

---

## [v0.22.0] — 2026-02-26

### Highlights
- **Transparent Rate Limit Headers** — Standard `X-RateLimit-*` headers on all rate-limited responses
- `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Enterprise-friendly: API consumers can track their quota and auto-retry

### Changed
- `apps/server/src/middleware/rate-limit.ts` — Added 3 standard rate limit response headers
- Headers present on both 2xx and 429 responses
- v0.22.0 release archive (4 standard files)

---

## [v0.21.0] — 2026-02-26

### Highlights
- **PR Risk Summary** — `vibe pr` analyzes risk for current branch before opening a PR
- `--markdown` flag outputs a table suitable for pasting into PR descriptions
- Compares diff against base branch (default: main) and cross-references API risk data

### Added
- `packages/cli/src/commands/pr-risk.ts` — PR risk analysis command
- v0.21.0 release archive (4 standard files)

### Changed
- CLI commands: 11 → 12
- CLI version bumped to 0.21.0

---

## [v0.20.0] — 2026-02-26

### Highlights
- **Structured Request Logging** — Custom pino-based request logger replaces Hono logger
- JSON structured output: method, path, status, duration, userAgent
- Duration tracking for performance monitoring

### Added
- `apps/server/src/middleware/request-logger.ts` — Structured request logger
- v0.20.0 release archive (4 standard files)

### Changed
- Replaced `hono/logger` with custom `requestLogger` middleware
- Backend middleware count: 5 → 6

---

## [v0.19.0] — 2026-02-26

### Highlights
- **Metric Alert Configuration** — Threshold-based alerts per project per metric
- `AlertConfig` Prisma model with project relation
- 3 new API endpoints: GET/POST/DELETE alert configs

### Added
- `apps/server/src/routes/v1/alerts.ts` — Alert config CRUD routes
- `AlertConfig` model in Prisma schema
- v0.19.0 release archive (4 standard files)

### Changed
- `Project` model now has `alertConfigs` relation
- Server index registers `/api/v1/alerts` route
- Backend endpoints: 37+ → 40+

---

## [v0.18.0] — 2026-02-26

### Highlights
- **Configurable Branding** — White-label foundation via environment variables
- `BRANDING` constant: name, tagline, primaryColor, logoText
- Override with BRAND_NAME, BRAND_TAGLINE, BRAND_COLOR, BRAND_LOGO_TEXT

### Added
- `packages/shared/src/constants/branding.ts` — Branding constant
- v0.18.0 release archive (4 standard files)

### Changed
- Shared constants index exports branding module

---

## [v0.17.0] — 2026-02-26

### Highlights
- **Contextual Tips** — Random helpful tips after CLI commands
- 8 tips covering check, report, analyze, decisions, sync, risk workflows
- Integrated into `vibe check`, `vibe insights`, `vibe status`

### Added
- `packages/cli/src/utils/tips.ts` — Tip pool + showTip() utility
- v0.17.0 release archive (4 standard files)

### Changed
- `check.ts`, `insights.ts`, `status.ts` — Call showTip() after execution

---

## [v0.16.0] — 2026-02-26

### Highlights
- **Enhanced Health Check** — Production-grade `/health` with database + Redis checks
- Returns `healthy` (200) or `degraded` (503) based on dependency status
- Per-check breakdown for monitoring integration

### Changed
- `/health` endpoint now checks PostgreSQL (Prisma) and Redis (ioredis)
- v0.16.0 release archive (4 standard files)

---

## [v0.15.0] — 2026-02-26

### Highlights
- **Customizable Decision Rules** — Type-safe rule definitions for metric-driven decisions
- `DecisionRule` interface with condition (metric/operator/value) and action (level/category/title/description)
- 4 built-in `DEFAULT_RULES`: AI Success, PSRI High Risk, TDI Critical, Hotspot Warning

### Added
- `packages/shared/src/types/rules.ts` — DecisionRule interface + DEFAULT_RULES
- v0.15.0 release archive (4 standard files)

### Changed
- Shared types index exports rules module

---

## [v0.14.0] — 2026-02-26

### Highlights
- **Admin Usage Analytics** — Platform-level usage statistics endpoint
- `GET /api/v1/admin/stats` — Admin-only, returns users/projects/PRs/collections counts
- Role-based access control (requires `admin` role)

### Added
- `apps/server/src/routes/v1/admin.ts` — Admin stats route
- v0.14.0 release archive (4 standard files)

### Changed
- Server index registers `/api/v1/admin` route
- Backend endpoints: 36+ → 37+

---

## [v0.13.0] — 2026-02-26

### Highlights
- **`vibe fix`** — Actionable fix suggestions for high-risk files
- Generates specific recommendations based on file metrics
- 5 suggestion types: split modules, reduce complexity, stabilize interfaces, assign ownership, review AI code
- Priority-colored output (high/medium/low)

### Added
- `packages/cli/src/commands/fix.ts` — Fix suggestions command
- v0.13.0 release archive (4 standard files)

### Changed
- CLI commands: 10 → 11
- CLI version bumped to 0.13.0

---

## [v0.12.0] — 2026-02-26

### Highlights
- **Error Recovery** — CLI retries network errors with exponential backoff (3 retries)
- **ErrorBoundary** — Reusable React error boundary component
- Improved resilience for production deployments

### Added
- `apps/web/src/lib/error-boundary.tsx` — React ErrorBoundary with retry button
- v0.12.0 release archive (4 standard files)

### Changed
- CLI `ApiClient.request()` now retries on network errors (ECONNREFUSED, ETIMEDOUT, fetch failures)
- Retry delays: 1s → 2s → 4s (exponential backoff)

---

## [v0.11.0] — 2026-02-26

### Highlights
- **Weekly Digest Service** — Automated weekly activity summary
- `DigestService` backend service (7-day metric snapshots + PR activity + trends)
- `GET /api/v1/metrics/projects/:id/digest` — Weekly digest endpoint
- `vibe digest` — CLI command for terminal weekly summary

### Added
- `apps/server/src/services/digest.service.ts` — Digest service
- Digest route in overview.ts
- `packages/cli/src/commands/digest.ts` — CLI digest command
- `getDigest()` method in CLI ApiClient
- v0.11.0 release archive (4 standard files)

---

## [v0.10.0] — 2026-02-26

### Highlights
- **Team Comparison View** — Cross-project performance comparison for enterprise ROI
- Dashboard page (`/dashboard/teams`) with project metrics table
- Health badges based on PSRI thresholds (green/yellow/red)
- "Export Team Report" JSON download
- Teams sidebar navigation item

### Added
- `apps/web/src/app/(dashboard)/dashboard/teams/page.tsx` — Team comparison page
- Teams nav item in sidebar with users-group icon
- v0.10.0 release archive (4 standard files)

---

## [v0.9.0] — 2026-02-26

### Highlights
- **`vibe analyze`** — Local offline analysis, no backend required
- Scans git log (last 90 days by default) for file change frequency
- Identifies hotspot files (≥10 changes) with risk badges
- `--days` flag to customize analysis window

### Added
- `packages/cli/src/commands/analyze.ts` — Local analysis command
- v0.9.0 release archive (4 standard files)

### Changed
- CLI version bumped to 0.9.0
- CLI commands: 8 → 9

---

## [v0.8.0] — 2026-02-26

### Highlights
- **`vibe` CLI tool** — 8 commands for AI Coding workflow integration
- `vibe check` — Pre-commit risk analysis with `--strict` mode
- `vibe report` — Markdown/JSON/text health report generation
- `vibe decisions` — Terminal decision management with `--generate`
- `vibe insights` — AI effectiveness summary (success rate, tool usage)
- `vibe risk` — Project/file-level PSRI query
- `vibe sync` — Trigger collection + computation
- API Key authentication for CLI
- End-to-end verified on VibeBetter's own repository

### Added
- `packages/cli/` package with Commander.js + picocolors + simple-git
- 8 CLI commands (init, status, check, risk, decisions, insights, report, sync)
- `~/.vibebetter/config.json` configuration management
- 5 CLI tests
- v0.8.0 release archive (4 standard files)

---

## [v0.7.0] — 2026-02-26

### Highlights
- **Quality Engineering** — 测试 45→133 (+196%)，消除 25+ 处代码重复，建立 AI 代码审查规范
- **Quality Dashboard** — 新增 /dashboard/quality 质量度量页面
- **requireProject Middleware** — 消除 25+ 处路由层项目权限检查重复
- **metrics.ts Refactor** — 360 行拆分为 3 个聚焦子模块
- **Frontend Tests** — 26 个前端组件测试 (Button/Input/MetricCard/Skeleton)
- **PR Template + AI Quality Checklist** — 规范化代码审查流程

### Added
- Quality Dashboard page (`/dashboard/quality`) with test health, complexity distribution, hotspot risk matrix, AI quality summary
- Quality nav item in sidebar (shield-check icon after Attribution)
- `requireProject()` middleware (`apps/server/src/middleware/require-project.ts`)
- Backend service tests: AuthService (11), ProjectService (15), DecisionService (10), AttributionService (6), MetricsService (21)
- API contract tests (20) + integration tests (16)
- Frontend component tests: Button, Input, MetricCard, Skeleton (26 total)
- Shared package tests (8)
- Coverage scripts (`test:coverage`) for server, web, shared
- PR template (`.github/PULL_REQUEST_TEMPLATE.md`) with AI quality checklist
- AI code quality review checklist (10 checkpoints)

### Changed
- `metrics.ts` (360 lines) split into `metrics/overview.ts`, `metrics/files.ts`, `metrics/export.ts`
- All `:id` routes use `requireProject()` middleware instead of inline ownership checks
- Test count: 45 → 133 (+196%)
- Test files: 3 → 12 (+300%)

---

## [v0.6.0] — 2026-02-26

### Highlights
- **Onboarding Flow** — 4-step wizard: Connect Repo → Collect → Compute → Report
- **AI Coding Health Report** — Printable project insight report
- **OpenAPI Documentation** — Swagger UI at `/api/v1/docs`
- **API Key Authentication** — X-API-Key header for CI/CD integration
- **Redis Cache** — 5-minute TTL on overview queries
- **Insight Template Engine** — Foundation for product differentiation
- **VS Code Extension** — Skeleton for AI behavior auto-reporting

### Added
- Onboarding page (`/dashboard/onboarding`) with step-by-step wizard
- Report page (`/dashboard/report`) with printable health report
- OpenAPI docs route (`/api/v1/docs`) with Swagger UI
- API Key CRUD (`POST/GET/DELETE /api/v1/auth/api-keys`)
- Auth middleware supports JWT + API Key dual mode
- Redis cache layer (`getCached` / `invalidateCache`)
- `DashboardConfig` + `InsightTemplate` type system
- `AI_CODING_TEMPLATE` + `CODE_REVIEW_TEMPLATE`
- VS Code extension skeleton (`packages/vscode-extension/`)
- Webhook config UI in Settings page
- Print styles (`@media print`)
- `ApiKey` Prisma model

### Changed
- Prisma migration strategy: `db push` (dev) + `migrate deploy` (prod)
- Metrics overview cached with 5-min Redis TTL
- Projects page: added "Import from GitHub" button

---

## [v0.5.0] — 2026-02-26

### Highlights
- **AI Attribution Analysis** — AI vs Human code quality comparison (complexity, stability, rollback rate)
- **Organization Dashboard** — Multi-project health comparison table
- **Developer Effectiveness** — Per-developer AI usage ranking
- **Industry Benchmarks** — Excellent/Good/Average/Poor labels on all metrics
- **Failed PR Attribution** — Major revision / rollback / high review breakdown
- **GitHub Actions CI** — Automated lint + test + build pipeline
- **Documentation restructure** — Numbered version archives with standardized format

### Added
- Attribution page (`/dashboard/attribution`) with AI vs Human comparison
- Organization page (`/dashboard/org`) with sortable project comparison
- Developers page (`/dashboard/developers`) with AI usage ranking
- Industry benchmark badges on Dashboard metric cards
- `AttributionService` backend (AI attribution + failed PR analysis)
- 3 new API endpoints (attribution, failed-prs, developers)
- `benchmarks.ts` shared constants with `getBenchmarkLevel()`
- GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- Documentation restructure: `docs/releases/vX.Y.Z/` format

### Changed
- Documentation directory: `product/` `releases/` `roadmap/` `process/`
- Removed redundant files (plan.md, analysis.md, workflow iterations)
- Risk/decision tracking moved to GitHub Issues

---

## [v0.4.0] — 2026-02-26

### Highlights
- **17 frontend routes** — 6 new pages (PR List, File Explorer, PSRI Drill-down, Trend Compare, Settings, OAuth)
- **GitHub Webhook** — Real-time PR event processing with auto-collection and metrics recomputation
- **GitHub OAuth** — Infrastructure code-ready (needs GITHUB_CLIENT_ID/SECRET configuration)
- **Security hardening** — CORS whitelist, API rate limiting, structured Pino logging
- **Deep analysis** — PSRI drill-down with breadcrumb navigation, trend comparison, file risk explorer
- **45 automated tests** — up from 29 (16 new integration tests)

### Added
- PR list page (`/dashboard/prs`) with inline detail expansion
- File explorer page (`/dashboard/files`) with search, risk badges, AI% column
- PSRI drill-down page (`/dashboard/drilldown`) with breadcrumb: PSRI → Dimension → File
- Trend comparison page (`/dashboard/compare`) with side-by-side period analysis
- GitHub Webhook endpoint (`POST /api/v1/webhooks/github`) handling `pull_request` and `push` events
- GitHub OAuth flow (`/api/v1/oauth/github` → `/callback` → `/status`)
- Rate limiting middleware (10 req/min on auth routes)
- Pino structured logging (replaces console.log/error)
- CSV data export (`GET /api/v1/metrics/projects/:id/export?format=csv`)
- Zustand global state store (persisted project selection + auth state)
- Auto-collection on project creation (fire-and-forget)
- "Export CSV" button on Dashboard
- 16 new integration tests covering schema validation + utility functions

### Changed
- CORS: from `origin: '*'` to whitelist (`localhost:3000`, `localhost:3001`, `CORS_ORIGIN`)
- Login page: added Suspense boundary for `useSearchParams`, conditional GitHub OAuth button
- Backend files/top route: accepts `sort` query param (structural, change, default)
- Navigation: added Pull Requests, Files, Drill-down, Compare, Settings to sidebar

### Security
- Rate limiting on `/auth/register` and `/auth/login` (10 req/60s)
- CORS origin whitelist (configurable via `CORS_ORIGIN` env)
- Structured logging prevents sensitive data leaks

---

## [v0.3.0] — 2026-02-26

### Highlights
- **Settings Page**: Per-project PSRI weight configuration with 6 dimension sliders
- **PSRI Radar Chart**: 6-dimension radar visualization on Risk Trends page
- **Enhanced Decision Engine**: 6 new rules including positive feedback and AI-specific recommendations
- **Loading Skeletons**: Polished skeleton states replace raw spinners
- **Toast Notifications**: Real-time feedback for collection/compute actions
- **Performance**: React.memo + useMemo on chart components

### Added
- `Settings` page (`/dashboard/settings`) with 6 PSRI weight sliders and save/recompute
- PSRI radar chart component (`RadarChart`) on Risk Trends page
- `Recent Pull Requests` mini-table on Dashboard overview
- `Refresh Metrics` button on Dashboard
- Toast notification system (`ToastProvider` + `useToast`)
- Loading skeleton components (`Skeleton`, `MetricCardSkeleton`, `ChartSkeleton`, `TableSkeleton`)
- Custom 404 page (`not-found.tsx`)
- Global error boundary (`error.tsx`)
- Seed demo script (`scripts/seed-demo.sh`)
- `AI %` column in hotspot files table
- Effectiveness metrics progress bars on AI Insights page
- Mobile sidebar close button
- `GET /api/v1/metrics/projects/:id/recent-prs` endpoint

### Changed
- Decision engine: 6 new rules (positive feedback for AI >80%, AI >90%, hotspot 3-10/10+, AI adoption >70%, PSRI change >0.4)
- Dashboard: improved empty states with icons and CTA guidance
- Chart components wrapped with `React.memo` + `useMemo` for performance
- README updated with latest features, API endpoints, and route table

### Fixed
- TDI display showing N/A (added `tdiScore` to `MetricSnapshotItem` type)
- Seed data: added 25 realistic PR records (was 0 → AI metrics computed as null)
- Seed data: deterministic PRNG (seed=42) for reproducible data

---

## [v0.2.0] — 2026-02-25

### Highlights
- **Decisions Page**: AI-driven engineering recommendations with Accept/Dismiss
- **AI Insights Page**: Tool effectiveness metrics, usage breakdown, developer activity
- **Health Assessment**: Executive summary banner on Dashboard
- **Backend P0/P1/P2**: Service layer, error handling, PSRI 6-dim, TDI, behaviors

### Added
- `Decisions` page (`/dashboard/decisions`) with rule-based recommendations
- `AI Insights` page (`/dashboard/insights`) with tool effectiveness analytics
- Health Assessment banner on Dashboard overview
- TDI (Technical Debt Index) computation and display
- `AppError` class + global `onError` middleware
- Service layer: `AuthService`, `ProjectService`, `DecisionService`
- PSRI 6-dimension calculation with configurable weights
- `WeightConfig` API (`GET/PUT /api/v1/weights/projects/:id/weights`)
- `Decision` API (`GET/POST /api/v1/decisions/projects/:id/decisions`)
- User behavior tracking API (`POST/GET /api/v1/behaviors/...`)
- AI behavior tracking API (`POST/GET /api/v1/behaviors/...`)
- 4 new Prisma models: `UserBehavior`, `AiBehavior`, `Decision`, `WeightConfig`
- GitHub collector: pagination + incremental collection + rate limit awareness

### Changed
- Routes refactored to use service layer (thin routes, no direct Prisma calls)
- Dashboard redesigned with dark-mode-first premium aesthetic
- ECharts theme: dark backgrounds, gradient fills, clean tooltips

---

## [v0.1.0] — 2026-02-25

### Initial Release — MVP
- **Authentication**: JWT register/login
- **Project Management**: CRUD operations
- **Data Collection**: GitHub PR collector + Local Git collector
- **AI Metrics**: AI Success Rate + AI Stable Rate
- **Risk Analysis**: PSRI (3 dimensions) + Hotspot detection
- **Dashboard**: Overview, Projects, Risk Trends, Collection pages
- **Infrastructure**: pnpm monorepo, Turborepo, Docker Compose, Prisma, BullMQ
- **Testing**: 29 tests (21 server + 8 shared)
