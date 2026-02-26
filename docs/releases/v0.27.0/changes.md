# v0.27.0 全部开发变更

## 新增文件
- `packages/cli/src/commands/dashboard.ts`
  - 新增 `vibe dashboard` 命令
  - 格式化 TUI 输出：关键指标一览
  - 集成 overview、aiStats、decisions 数据源
  - 基准色彩编码（green/yellow/red）

## 修改文件
- `packages/cli/src/index.ts`
  - 注册 dashboardCommand
  - 版本号更新至 0.27.0
