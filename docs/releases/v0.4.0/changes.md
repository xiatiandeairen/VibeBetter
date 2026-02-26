# v0.4.0 全部开发变更

## 前端新增
- PR 列表页 (/dashboard/prs) — 内联展开详情
- 文件浏览器页 (/dashboard/files) — 搜索 + 风险分级 + AI%
- PSRI 下钻页 (/dashboard/drilldown) — 三层面包屑导航
- 趋势对比页 (/dashboard/compare) — 双时段对比
- Dashboard: Export CSV 按钮
- Login: GitHub OAuth 按钮 (条件显示)
- Login: Suspense 边界修复
- Zustand store (持久化项目选择 + 认证状态)
- 侧边栏: 新增 Pull Requests/Files/Drill-down/Compare

## 后端新增
- Webhook 端点 (POST /api/v1/webhooks/github) — PR merge 自动重算
- OAuth 端点 (/api/v1/oauth/github, /callback, /status) — 代码就绪
- Rate Limiting 中间件 (10 req/min auth 路由)
- Pino 结构化日志 (替代 console.log/error)
- CSV 导出端点 (GET /metrics/projects/:id/export?format=csv)
- 全部 PR 列表端点 (GET /metrics/projects/:id/prs)
- files/top 支持 sort 参数 (structural/change/default)
- 项目创建自动触发首次采集

## 后端改进
- CORS 从 origin:'*' → 白名单 (localhost:3000/3001 + CORS_ORIGIN)

## 测试新增
- 16 个集成测试 (Schema 验证 + 工具函数)
- 总计 45 个测试

## Bug 修复
- Login useSearchParams Suspense 边界
