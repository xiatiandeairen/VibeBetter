# v0.28.0 全部开发变更

## 新增文件
- `packages/cli/src/commands/health.ts`
  - 新增 `vibe health` 命令
  - 7 维度加权健康评分
  - API 连通性检查（10 分）
  - AI Success Rate（20 分）
  - PSRI 风险（20 分，反向）
  - TDI 技术债（15 分，反向）
  - 热点比率（10 分）
  - 数据新鲜度（10 分）
  - AI 工具健康（15 分）
  - 字母等级输出（A+/A/B/C/D）

## 修改文件
- `packages/cli/src/index.ts`
  - 注册 healthCommand
  - 版本号更新至 0.28.0
- `project.md`
  - 更新综合评分至 9.5/10
  - 新增 v0.28.0 版本记录
