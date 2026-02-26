# v0.9.0 全部开发变更

## 新增命令
- `vibe analyze` — 本地离线分析命令
  - 读取 git log（默认 90 天窗口）
  - 统计文件变更频率
  - 标记热点文件（≥10 次变更）
  - 输出风险摘要（HIGH/MEDIUM/LOW badges）
  - 不需要后端连接

## 修改文件
- `packages/cli/src/commands/analyze.ts` — 新增分析命令
- `packages/cli/src/index.ts` — 注册 analyze 命令，版本号 → 0.9.0
