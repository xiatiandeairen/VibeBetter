# v0.7.0 全部开发变更

## 后端重构

- **requireProject 中间件** (`apps/server/src/middleware/require-project.ts`)
  - 替代 25+ 处重复的项目权限检查逻辑
  - 所有 `:id` 路由统一使用 `requireProject()` 中间件
  - 自动从 `c.get('project')` 获取已验证项目
- **metrics.ts 拆分**
  - `metrics.ts` (360 行) → 聚合路由器 + 3 个子模块
  - `metrics/overview.ts` — overview + recent-prs + compute
  - `metrics/files.ts` — files/top + prs + developers + attribution + failed-prs
  - `metrics/export.ts` — export CSV/JSON + snapshots

## 后端测试新增

- `auth.service.test.ts` — 11 个 AuthService 单元测试
- `project.service.test.ts` — 15 个 ProjectService 单元测试
- `decision.service.test.ts` — 10 个 DecisionService 单元测试
- `attribution.service.test.ts` — 6 个 AttributionService 单元测试
- `metrics.service.test.ts` — 21 个 MetricsService 单元测试
- `contracts.test.ts` — 20 个 API 契约测试
- `api.test.ts` — 16 个 API 集成测试
- 后端测试合计: **99 个** (v0.6: 45 → v0.7: 99, +120%)

## 前端测试新增

- `Button.test.tsx` — 按钮组件渲染/点击/禁用/样式测试
- `Input.test.tsx` — 输入组件渲染/值变更/禁用/错误状态测试
- `MetricCard.test.tsx` — 指标卡片渲染/趋势箭头/颜色/空值测试
- `Skeleton.test.tsx` — 骨架屏渲染/自定义 className 测试
- 前端测试合计: **26 个** (v0.6: 0 → v0.7: 26)
- 前端测试配置: Vitest + @testing-library/react + jsdom

## 前端新增

- **Quality Dashboard** (`/dashboard/quality`)
  - Test Health 静态面板 (133 tests, 12 files, 100% pass)
  - Code Complexity Distribution 复杂度分布进度条
  - Hotspot Risk Matrix 热点风险矩阵表格
  - AI Code Quality Summary AI 代码质量摘要
- 侧边栏: 新增 Quality (盾牌勾号图标) 位于 Attribution 之后

## 共享包测试

- `shared` 包测试: **8 个** (类型校验 + 工具函数)

## CI/CD 与规范

- **PR 模板** (`.github/PULL_REQUEST_TEMPLATE.md`)
  - 变更类型复选框
  - 测试检查清单
  - AI 质量检查清单
- **覆盖率配置**: 各包 `vitest.config.ts` 支持 `test:coverage` 脚本
- **CI 工作流**: lint + test + build 流水线

## 文档更新

- AI 代码质量检查清单 (10 个检查要点)
- v0.7.0 质量工程版本规划 (`docs/roadmap/current.md`)
- Release notes + changes + tasks + insights 归档
- CHANGELOG.md 新增 v0.7.0 条目
- project.md 版本表格更新
- README.md 路线图 v0.7.0 完成标记
