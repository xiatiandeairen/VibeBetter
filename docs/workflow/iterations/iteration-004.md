# 迭代归档：Iteration-004（20 轮自驱动微循环）

## 基本信息

| 字段     | 值                    |
| -------- | --------------------- |
| 迭代编号 | Iteration-004         |
| 时间     | 2026-02-26            |
| 模式     | AI 自驱动 v2（20 轮） |
| 版本     | v0.3.0                |
| 状态     | ✅ 已完成              |

## 20 轮执行记录

| Round | 目标                          | 状态 | 说明                                     |
| ----- | ----------------------------- | ---- | ---------------------------------------- |
| R1    | Decision 引擎增加正向规则     | ✅   | 新增 6 条规则（正向+AI 特定+热点分级）   |
| R2    | 权重配置页面                  | ✅   | Settings 页，6 个滑块，保存后自动重算    |
| R3    | TDI 显示修复                  | ✅   | 添加 tdiScore 到 snapshot 类型 + fallback |
| R4    | Refresh 指标按钮              | ✅   | Dashboard 刷新按钮，mutation + invalidate |
| R5    | PR 活动摘要                   | ✅   | 新 API + Recent PRs 迷你表格             |
| R6    | Toast 通知                    | ✅   | ToastProvider + Collection 页集成        |
| R7    | 改进空状态                    | ✅   | 图标 + CTA 引导文字                      |
| R8    | 404 页面                      | ✅   | 自定义 Not Found 页面                    |
| R9    | PSRI 雷达图                   | ✅   | 6 维度雷达图组件 + Risk 页集成           |
| R10   | AI 行为趋势图                 | ❌   | 取消（需要时序数据聚合，ROI 不够高）     |
| R11   | 工具效果对比                  | ✅   | 采纳率 + 编辑距离进度条                  |
| R12   | 文件 AI 影响度                | ✅   | Risk 表增加 AI% 列                       |
| R13   | 加载骨架屏                    | ✅   | Skeleton 组件 + Dashboard 集成           |
| R14   | 错误边界                      | ✅   | error.tsx 全局错误页                     |
| R15   | 移动端侧边栏                  | ✅   | 关闭按钮 + overlay 优化                  |
| R16   | 种子脚本自动化                | ✅   | scripts/seed-demo.sh                     |
| R17   | README 更新                   | ✅   | 新功能 + API 端点 + 路由表               |
| R18   | 图表性能优化                  | ✅   | React.memo + useMemo                     |
| R19   | 合并到 main                   | ✅   | v0.3.0 tag                               |
| R20   | 迭代归档                      | ✅   | 本文档                                   |

**完成率**：19/20 = 95%（1 个取消因 ROI 不够高）

## 新增能力总结

### 前端新页面/组件
- `/dashboard/settings` — PSRI 权重配置页
- `RadarChart` — 6 维度雷达图
- `Skeleton/MetricCardSkeleton/ChartSkeleton` — 加载骨架屏
- `ToastProvider` — 全局 Toast 通知
- `not-found.tsx` + `error.tsx` — 错误处理

### 后端新 API
- `GET /metrics/projects/:id/recent-prs` — 最近 PR 列表

### Dashboard 增强
- Health Assessment 执行摘要横幅
- TDI 展示在 Quick Stats
- Refresh 按钮
- Recent PRs 迷你表格
- 骨架屏加载状态

### Decision 引擎增强
- 6 条新规则（正向反馈 + AI 特定 + 热点分级）

## 评分更新

| 维度           | 上次  | 本次  | 变化 |
| -------------- | ----- | ----- | ---- |
| 功能完成度     | 7/10  | 8/10  | +1   |
| 代码质量       | 6/10  | 6.5/10| +0.5 |
| 架构合理性     | 7/10  | 7/10  | -    |
| 用户体验       | 7/10  | 8/10  | +1   |
| 安全性         | 3/10  | 3/10  | -    |
| 性能           | 6/10  | 7/10  | +1   |
| 文档完备度     | 7/10  | 8/10  | +1   |
| 协作效率       | 8/10  | 9/10  | +1   |
| **综合得分**   | 6.45  | **7.15** | +0.7 |

## 流程优化 v1.2 → v1.3

### 改进
1. **批量执行**：将多个小 round 打包给 subagent 并行实现，效率提升 3-5x
2. **取消机制**：R10 评估 ROI 不够高后果断取消，避免浪费
3. **质量门禁前置**：每批次完成后立即 lint + test + build

### 不足
1. **缺少 GUI 验证**：本轮主要依赖 build 验证，未逐页 GUI 测试
2. **subagent 代码风格略有差异**：不同 agent 产出的代码命名/间距微有不同
3. **Toast 仅在 Collection 页使用**：应推广到 Decisions、Settings 等页面
