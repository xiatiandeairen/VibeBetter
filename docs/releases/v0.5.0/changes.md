# v0.5.0 全部开发变更

## 后端新增
- AttributionService (AI vs Human 代码质量对比)
- GET /metrics/projects/:id/attribution — AI 归因分析
- GET /metrics/projects/:id/failed-prs — 失败 PR 归因
- GET /metrics/projects/:id/developers — 开发者效能统计

## 前端新增
- Attribution 页面 (/dashboard/attribution) — AI vs Human 对比条形图 + 失败归因
- Organization 页面 (/dashboard/org) — 多项目健康对比表 (可排序)
- Developers 页面 (/dashboard/developers) — 开发者 AI 使用排行
- Dashboard 指标卡片: 行业基准线标签 (Excellent/Good/Average/Poor)
- 侧边栏新增: Attribution + Developers + Organization

## 共享包
- benchmarks.ts — 行业基准线常量 + getBenchmarkLevel 函数

## 基础设施
- .github/workflows/ci.yml — GitHub Actions CI (lint + test + build)

## 文档
- 文档目录重构: product/ releases/ roadmap/ process/
- v0.1.0~v0.4.0 编号归档 (release-notes + changes + tasks + insights)
- 移除冗余文件 (plan.md, analysis.md, workflow/)
- 决策/风险追踪迁移到 GitHub Issues
