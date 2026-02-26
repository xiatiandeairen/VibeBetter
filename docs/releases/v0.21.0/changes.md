# v0.21.0 全部开发变更

## 新增文件
- `packages/cli/src/commands/pr-risk.ts` — PR 风险摘要命令
  - 获取当前分支名称 (simple-git)
  - 计算与 base 分支的 diff
  - 根据 API 数据展示文件级风险
  - `--markdown` 输出 Markdown 表格

## 修改文件
- `packages/cli/src/index.ts`
  - 导入并注册 `prRiskCommand`
  - CLI 版本号更新为 0.21.0
