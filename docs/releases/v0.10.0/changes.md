# v0.10.0 全部开发变更

## 新增页面
- `apps/web/src/app/(dashboard)/dashboard/teams/page.tsx` — 团队对比页面
  - 获取所有项目及其指标概览
  - 表格展示：项目名 | AI 成功率 | PSRI | TDI | AI PRs | 总 PRs | 健康状态
  - 健康状态 badge（绿/黄/红）
  - 底部汇总行（平均值）
  - JSON 导出按钮

## 修改文件
- `apps/web/src/app/(dashboard)/layout.tsx` — 侧边栏新增 Teams 导航项
