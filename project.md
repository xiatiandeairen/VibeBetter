# VibeBetter — 项目全景

## 项目定位

VibeBetter (AEIP — AI-Augmented Engineering Insight Platform) 是面向工程团队的 AI Coding 洞察平台，核心解决：

> 「AI 编码工具到底有没有让工程变得更好？如果有，好在哪里？如果没有，问题在哪里？」

## 核心能力

### 1. AI Coding 度量
- **AI Success Rate** — AI 参与 PR 的合并成功率（无重大修改）
- **AI Stable Rate** — AI 参与 PR 的稳定率（无回滚）
- **AI 行为追踪** — 工具使用频率、采纳率、编辑距离

### 2. 结构风险量化
- **PSRI (6 维度)** — 结构复杂度、变更频率、缺陷密度、架构风险、运行期风险、覆盖率缺口
- **TDI** — 技术债指数
- **热点检测** — 高复杂度 × 高变更频率文件

### 3. 决策建议
- 规则引擎驱动的模块级/Sprint 级建议
- 基于指标阈值的自动化建议生成

### 4. 数据采集
- GitHub PR 数据（增量+分页+Rate Limit 感知）
- 本地 Git 仓库分析
- 用户行为事件
- AI 工具行为事件

## 技术架构

```
Next.js 15 ── Hono API ── PostgreSQL
    │              │          │
 ECharts      BullMQ      Prisma
    │              │
 Tailwind      Redis
```

**Monorepo 结构**：
- `apps/web` — 前端 (port 3000)
- `apps/server` — 后端 (port 3001)
- `packages/shared` — 共享类型/Schema
- `packages/db` — Prisma Schema + Client

## 产品状态

| 版本   | 阶段         | 状态      | 说明                                                    |
| ------ | ------------ | --------- | ------------------------------------------------------- |
| v0.1.0 | MVP          | ✅ 完成    | 采集→计算→可视化链路通                                  |
| v0.2.0 | Phase 1a     | ✅ 完成    | PSRI 6 维 + TDI + 决策引擎 + AI 行为分析               |
| v0.3.0 | Phase 1b     | ✅ 完成    | Settings + 雷达图 + Toast + 骨架屏 + 决策正向规则       |
| v0.4.0 | Phase 2      | ✅ 完成    | Webhook + OAuth + 下钻 + 对比 + 安全加固 + 45 测试      |
| v0.5.0 | Phase 3      | ✅ 完成    | AI 归因 + 组织级 + 基准线 + CI + 文档重构               |
| v0.6.0 | Phase 4      | ✅ 完成    | Onboarding + OpenAPI + API Key + Redis + 模板引擎 + VS Code |
| v0.7.0 | Phase 5      | ✅ 完成    | 质量工程: 测试 +196% + 重构 + Quality Dashboard         |
| v0.8.0 | Phase 6      | ✅ 完成    | CLI 场景化落地: vibe check/risk/decisions/report/sync    |
| v0.9.0 | Phase 7      | ✅ 完成    | 本地离线分析: vibe analyze (无需后端)                     |
| v0.10.0 | Phase 8     | ✅ 完成    | 团队对比视图: 跨项目 AI ROI 比较                          |
| v0.11.0 | Phase 9     | ✅ 完成    | 周报摘要: DigestService + vibe digest                    |

## 当前综合评分

**9.3/10**（详见 `docs/workflow/scoring-standards.md`）

| 维度         | 分数    |
| ------------ | ------- |
| 功能完成度   | 9.5/10  |
| 代码质量     | 9/10    |
| 架构合理性   | 9.5/10  |
| 用户体验     | 9/10    |
| 安全性       | 8/10    |
| 性能         | 8.5/10  |
| 文档完备度   | 9/10    |
| 协作效率     | 9/10    |

## 文档导航

| 文档                                            | 说明                   |
| ----------------------------------------------- | ---------------------- |
| [`README.md`](README.md)                       | 项目介绍和快速开始     |
| [`CLAUDE.md`](CLAUDE.md)                       | AI Agent 协作规则      |
| [`docs/product/spec.md`](docs/product/spec.md) | 产品规格说明书         |
| [`docs/releases/`](docs/releases/)             | 版本归档 (编号)        |
| [`docs/roadmap/current.md`](docs/roadmap/current.md) | 当前版本规划     |
| [`docs/process/`](docs/process/)               | 开发流程 + 评分标准    |

## 迭代历史

| 迭代          | 日期       | 版本   | 内容                                          |
| ------------- | ---------- | ------ | --------------------------------------------- |
| Iteration-001 | 2026-02-25 | v0.1.0 | MVP 构建 + UI 重设计 + P0/P1/P2 + 工作流建立 |
| Iteration-002 | 2026-02-25 | v0.2.0 | Decisions + AI Insights 前端 + 种子数据修复   |
| Iteration-003 | 2026-02-25 | v0.2.0 | Health Assessment + TDI + 端到端验证          |
| Iteration-004 | 2026-02-26 | v0.3.0 | 20 轮微循环：Settings + Radar + Toast + Skeleton + 性能优化 |
| Iteration-005 | 2026-02-26 | v0.4.0 | PR/File/Drilldown/Compare 页 + Webhook + OAuth + Security + 45 tests |
| Iteration-006 | 2026-02-26 | v0.5.0 | AI 归因 + 组织级 + 基准线 + CI + 文档重构 + 20 路由 |
| Iteration-007 | 2026-02-26 | v0.6.0 | Onboarding + Report + OpenAPI + API Key + Redis + 模板引擎 |
| Iteration-008 | 2026-02-26 | v0.7.0 | 质量工程: 测试 133 + requireProject + metrics 拆分 + Quality Dashboard |
| Iteration-009 | 2026-02-26 | v0.8.0 | CLI: vibe 命令行工具 8 个命令 + 端到端验证 |
| Iteration-010 | 2026-02-26 | v0.9.0 | 本地离线分析: vibe analyze 命令 |
| Iteration-011 | 2026-02-26 | v0.10.0 | 团队对比视图 + JSON 导出 |
| Iteration-012 | 2026-02-26 | v0.11.0 | DigestService + vibe digest + 周报端点 |

## 协作工作流

```
用户需求 → AI 任务拆分 → 执行记录 → 验收评分 → 反馈优化 → 归档
```

详见 `docs/workflow/README.md`。

## 下一步计划（v0.8.0）

详见 [`docs/roadmap/current.md`](docs/roadmap/current.md)。

**版本主题：从「看板」到「行动」** — CLI 工具嵌入 AI Coding 工作流，让洞察驱动行为。

核心命令：
- `vibe check` — 提交前风险检查（核心场景）
- `vibe decisions` — 终端查看/接受/拒绝决策建议
- `vibe report` — 生成 Markdown 健康报告
- `vibe sync` — 触发采集 + 计算
- `vibe insights` — AI 成果率 + 工具使用摘要
