# Changelog

All notable changes to this project will be documented in this file.

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
