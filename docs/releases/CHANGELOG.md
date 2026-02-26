# Changelog

All notable changes to this project will be documented in this file.

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
