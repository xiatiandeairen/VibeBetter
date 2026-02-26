# v0.20.0 全部开发变更

## 新增文件
- `apps/server/src/middleware/request-logger.ts` — 结构化请求日志中间件
  - 记录 method, path, status, duration, userAgent
  - 使用 pino logger 输出 JSON 格式

## 修改文件
- `apps/server/src/index.ts`
  - 移除 `hono/logger` 导入
  - 替换为自定义 `requestLogger` 中间件
