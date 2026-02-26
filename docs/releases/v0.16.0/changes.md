# v0.16.0 全部开发变更

## 修改文件
- `apps/server/src/index.ts`
  - 添加 `prisma` 直接导入
  - 重写 `/health` 端点：数据库 + Redis 健康检查
  - 返回 checks 详情对象
  - 健康 → 200, 降级 → 503
