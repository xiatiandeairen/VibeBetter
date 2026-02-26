# v0.19.0 全部开发变更

## 新增文件
- `apps/server/src/routes/v1/alerts.ts` — Alert 配置 CRUD 路由
  - GET: 列表查询
  - POST: 创建告警配置
  - DELETE: 删除告警配置

## 修改文件
- `packages/db/prisma/schema.prisma` — 新增 AlertConfig 模型 + Project 关联
- `apps/server/src/index.ts` — 注册 alerts 路由
