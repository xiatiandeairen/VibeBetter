# v0.6.0 全部开发变更

## 前端新增
- Onboarding 页面 (/dashboard/onboarding) — 4 步向导流程
- Report 页面 (/dashboard/report) — AI Coding 健康报告（可打印）
- Projects 页: "Import from GitHub" 按钮
- Settings 页: API Key 管理 (创建/列表/删除) + Webhook 配置 UI
- 侧边栏: 新增 Onboarding (🚀) + Report (📋)
- CSS: @media print 打印样式

## 后端新增
- OpenAPI 文档 (/api/v1/docs) — Swagger UI + openapi.json
- API Key 认证 (X-API-Key header) + CRUD 端点
- ApiKey Prisma 模型
- Redis 缓存层 (getCached/invalidateCache, 5 min TTL)
- Auth 中间件: 支持 JWT + API Key 双模式

## 后端改进
- Metrics overview 路由使用 Redis 缓存
- Compute 路由触发缓存失效

## 共享包新增
- DashboardWidget + DashboardConfig 类型 + DEFAULT_DASHBOARD_CONFIG
- InsightTemplate + MetricDefinition 类型
- AI_CODING_TEMPLATE + CODE_REVIEW_TEMPLATE 模板
- AVAILABLE_TEMPLATES 模板注册

## 基础设施
- Prisma: 生产级迁移策略 (db:push dev / migrate:deploy prod)
- VS Code 扩展骨架 (packages/vscode-extension/)
  - 文件保存/打开追踪
  - 会话时长追踪
  - API Key 认证上报

## 数据库
- 新增 ApiKey 模型 (keyHash 唯一索引)
