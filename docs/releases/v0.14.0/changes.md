# v0.14.0 全部开发变更

## 新增路由
- `apps/server/src/routes/v1/admin.ts` — Admin 统计路由
  - `GET /api/v1/admin/stats` — 平台使用统计
  - 需要 admin 角色认证
  - 并行查询：用户数、项目数、PR 数、采集任务数

## 修改文件
- `apps/server/src/index.ts` — 注册 admin 路由
