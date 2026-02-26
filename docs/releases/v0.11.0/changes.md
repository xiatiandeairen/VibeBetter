# v0.11.0 全部开发变更

## 新增服务
- `apps/server/src/services/digest.service.ts` — 周报摘要服务
  - 查询最近 7 天 metric snapshots
  - 计算 PSRI/TDI 趋势变化
  - 统计周内 PR 数量（总计 + AI）

## 新增端点
- `GET /api/v1/metrics/projects/:id/digest` — 周报摘要 API

## 新增 CLI 命令
- `vibe digest` — 终端查看周报摘要

## 修改文件
- `apps/server/src/routes/v1/metrics/overview.ts` — 新增 digest 路由
- `packages/cli/src/api-client.ts` — 新增 getDigest 方法
- `packages/cli/src/index.ts` — 注册 digest 命令，版本号 → 0.11.0
