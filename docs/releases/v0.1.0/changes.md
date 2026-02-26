# v0.1.0 全部开发变更

## 基础设施
- pnpm monorepo + Turborepo 构建编排
- Docker Compose (PostgreSQL 16 + Redis 7)
- TypeScript strict mode + ESLint + Prettier
- Prisma Schema (User, Project, PullRequest, FileMetric, MetricSnapshot, CollectionJob)
- 共享包 @vibebetter/shared (types, schemas, constants, utils)

## 后端 (apps/server)
- Hono 框架 + CORS + Logger 中间件
- JWT 认证 (register/login/me)
- 项目 CRUD (list/create/get/update/delete)
- GitHub PR Collector (REST API, AI 标记识别)
- Local Git Collector (simple-git, 文件变更统计)
- MetricsService (AI Success Rate, Stable Rate, PSRI 3 维度)
- BullMQ 任务队列 (采集调度)
- 指标 API (overview/snapshots/files/top/compute)
- 采集 API (collect/jobs)

## 前端 (apps/web)
- Next.js 14+ App Router
- 暗色主题 (dark-mode-first)
- Landing 页 (渐变文字, 特性卡片)
- 登录/注册页 (glassmorphism)
- Dashboard 布局 (SVG 图标侧边栏)
- Overview 页 (指标卡片, ECharts 趋势图)
- Projects 页 (卡片列表, 创建模态框)
- Risk Trends 页 (堆叠面积图, 热点文件表)
- Collection 页 (触发按钮, 任务列表)
- ECharts 组件封装 (LineChart, AreaChart)
- UI 组件 (Button, Input, MetricCard)

## 测试
- MetricsService 12 个单元测试
- Shared utils 8 个单元测试
- 种子数据脚本 (seed/index.ts)
