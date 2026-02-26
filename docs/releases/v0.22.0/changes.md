# v0.22.0 全部开发变更

## 修改文件
- `apps/server/src/middleware/rate-limit.ts`
  - 429 响应时设置 X-RateLimit-* 头
  - 正常响应后设置 X-RateLimit-* 头
  - 修复 entry 变量作用域以支持 header 计算
