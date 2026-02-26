# v0.24.0 全部开发变更

## 修改文件
- `apps/server/src/index.ts`
  - 添加 `gracefulShutdown()` 函数
  - 监听 SIGTERM 和 SIGINT 信号
  - 动态导入 scheduler.js 关闭 BullMQ 连接
  - 10 秒超时强制退出作为安全网
