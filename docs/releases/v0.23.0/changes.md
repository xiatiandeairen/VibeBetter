# v0.23.0 全部开发变更

## 新增文件
- `packages/cli/src/commands/diff.ts` — 快照对比命令
  - 获取 N 个快照并比较最新与最旧
  - 显示 delta、方向箭头和百分比变化
  - 风险指标反向显示（降低为绿色）

## 修改文件
- `packages/cli/src/index.ts`
  - 导入并注册 `diffCommand`
  - CLI 版本号更新为 0.23.0
