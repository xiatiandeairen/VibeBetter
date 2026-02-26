# v0.12.0 全部开发变更

## CLI 错误恢复
- `packages/cli/src/api-client.ts` — 添加重试逻辑
  - 最多 3 次重试，指数退避（1s, 2s, 4s）
  - 仅对网络错误重试（ECONNREFUSED, ETIMEDOUT, fetch 失败）
  - API 错误（4xx/5xx）不重试

## 前端错误边界
- `apps/web/src/lib/error-boundary.tsx` — 可复用 ErrorBoundary 组件
  - 捕获子组件渲染错误
  - 显示错误信息 + "Try again" 重置按钮
  - 支持自定义 fallback
