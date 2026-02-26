# v0.13.0 全部开发变更

## 新增命令
- `vibe fix` — 文件级修复建议命令
  - 获取 top risk 文件
  - 基于指标生成可操作建议
  - 5 种建议类型：拆分模块、降低复杂度、减少变更频率、明确责任人、审查 AI 代码
  - 优先级标签（high/medium/low）

## 修改文件
- `packages/cli/src/commands/fix.ts` — 新增 fix 命令
- `packages/cli/src/index.ts` — 注册 fix 命令，版本号 → 0.13.0
