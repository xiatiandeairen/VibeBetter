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
| v0.12.0 | Phase 10    | ✅ 完成    | 错误恢复: CLI 重试 + ErrorBoundary                       |
| v0.13.0 | Phase 11    | ✅ 完成    | 修复建议: vibe fix 可操作建议                             |
| v0.14.0 | Phase 12    | ✅ 完成    | Admin 统计: 平台使用分析端点                              |
| v0.15.0 | Phase 13    | ✅ 完成    | 自定义决策规则: DecisionRule 类型定义                      |
| v0.16.0 | Phase 14    | ✅ 完成    | 健康检查增强: 数据库 + Redis 状态                          |
| v0.17.0 | Phase 15    | ✅ 完成    | CLI 上下文提示: showTip() 3 个命令                         |
| v0.18.0 | Phase 16    | ✅ 完成    | 可配置品牌: 白标环境变量                                    |
| v0.19.0 | Phase 17    | ✅ 完成    | 指标告警: AlertConfig 模型 + CRUD API                       |
| v0.20.0 | Phase 18    | ✅ 完成    | 结构化日志: 自定义请求日志中间件                             |
| v0.21.0 | Phase 19    | ✅ 完成    | PR 风险摘要: vibe pr --markdown                              |
| v0.22.0 | Phase 20    | ✅ 完成    | 透明速率限制头: X-RateLimit-*                                 |
| v0.23.0 | Phase 21    | ✅ 完成    | 快照对比: vibe diff                                           |
| v0.24.0 | Phase 22    | ✅ 完成    | 优雅关闭: SIGTERM/SIGINT 处理                                  |
| v0.25.0 | Phase 23    | ✅ 完成    | 自动检测项目: vibe init --auto                                  |
| v0.26.0 | Phase 24    | ✅ 完成    | HTML 报告导出: vibe report --format html                        |
| v0.27.0 | Phase 25    | ✅ 完成    | 终端仪表盘: vibe dashboard TUI                                   |
| v0.28.0 | Phase 26    | ✅ 完成    | 项目健康评估: vibe health 综合评分                                |
| v0.29.0 | Phase 27    | ✅ 完成    | Admin 项目统计: 按项目 PR 计数端点                                 |
| v0.30.0 | Phase 28    | ✅ 完成    | Changelog 命令: AI 检测提交列表                                    |
| v0.31.0 | Phase 29    | ✅ 完成    | Review 建议: 按风险排序文件审查                                     |
| v0.32.0 | Phase 30    | ✅ 完成    | Request ID 中间件: X-Request-Id 追踪                                |
| v0.33.0 | Phase 31    | ✅ 完成    | CI/CD 集成: JSON 指标输出                                           |
| v0.34.0 | Phase 32    | ✅ 完成    | 定价层级: Free/Pro/Enterprise                                       |
| v0.35.0 | Phase 33    | ✅ 完成    | Watch 模式: 实时指标轮询                                            |
| v0.36.0 | Phase 34    | ✅ 完成    | Config 命令: CLI 配置管理                                           |
| v0.37.0 | Phase 35    | ✅ 完成    | Metrics Collector: 请求计数器                                       |
| v0.38.0 | Phase 36    | ✅ 完成    | Git Hook: pre-commit 安装                                          |
| v0.39.0 | Phase 37    | ✅ 完成    | Subscription 类型: 订阅/计划/用量接口                               |
| v0.40.0 | Phase 38    | ✅ 完成    | Search 命令: 文件名搜索                                             |
| v0.41.0 | Phase 39    | ✅ 完成    | Explain 命令: 指标解释                                              |
| v0.42.0 | Phase 40    | ✅ 完成    | 输入净化: sanitize 工具函数                                         |
| v0.43.0 | Phase 41    | ✅ 完成    | Badge 命令: shields.io 徽章生成                                     |
| v0.44.0 | Phase 42    | ✅ 完成    | 集成注册表: GitHub/GitLab/Jira/Slack                                |
| v0.45.0 | Phase 43    | ✅ 完成    | Summary 命令: 综合检查+洞察+风险                                    |
| v0.46.0 | Phase 44    | ✅ 完成    | History 命令: 指标历史火花图                                        |
| v0.47.0 | Phase 45    | ✅ 完成    | Validators: 通用验证工具函数                                        |
| v0.48.0 | Phase 46    | ✅ 完成    | Export Config: YAML 配置导出                                        |
| v0.49.0 | Phase 47    | ✅ 完成    | Billing Types: 计费事件/发票/支付方式                                |
| v0.50.0 | Phase 48    | ✅ 完成    | Trends: 指标趋势箭头                                                |
| v0.51.0 | Phase 49    | ✅ 完成    | Help Me: 交互式故障排除                                              |
| v0.52.0 | Phase 50    | ✅ 完成    | Redis Rate Limit Store                                              |
| v0.53.0 | Phase 51    | ✅ 完成    | Deploy Check: 部署前风险评估                                         |
| v0.54.0 | Phase 52    | ✅ 完成    | Feature Flags: 功能开关类型                                          |
| v0.55.0 | Phase 53    | ✅ 完成    | Compare Tools: AI 工具对比                                           |
| v0.56.0 | Phase 54    | ✅ 完成    | Onboard: CLI 引导向导                                                |
| v0.57.0 | Phase 55    | ✅ 完成    | Crypto: 哈希/令牌/HMAC 工具                                         |
| v0.58.0 | Phase 56    | ✅ 完成    | Slack Report: Slack Webhook 报告                                     |
| v0.59.0 | Phase 57    | ✅ 完成    | Audit Types: 审计日志接口                                            |
| v0.60.0 | Phase 58    | ✅ 完成    | Hotspots: 热点深度分析                                               |
| v0.61.0 | Phase 59    | ✅ 完成    | What-If: PSRI 权重模拟                                               |
| v0.62.0 | Phase 60    | ✅ 完成    | CORS Config: 集中 CORS 配置                                         |
| v0.63.0 | Phase 61    | ✅ 完成    | Git Stats: 本地 Git 统计                                            |
| v0.64.0 | Phase 62    | ✅ 完成    | Organization Types: 多租户类型                                       |
| v0.65.0 | Phase 63    | ✅ 完成    | Top: 实时风险排行                                                    |
| v0.66.0 | Phase 64    | ✅ 完成    | Why: 风险原因解释                                                    |
| v0.67.0 | Phase 65    | ✅ 完成    | Pagination: 游标分页工具                                             |
| v0.68.0 | Phase 66    | ✅ 完成    | Jira: 风险报告 Jira 集成                                            |
| v0.69.0 | Phase 67    | ✅ 完成    | Webhook Config: 端点/事件/投递类型                                   |
| v0.70.0 | Phase 68    | ✅ 完成    | Profile: 开发者 AI 编码统计                                          |
| v0.71.0 | Phase 69    | ✅ 完成    | Ignore: 分析排除模式管理                                             |
| v0.72.0 | Phase 70    | ✅ 完成    | Response Time: 响应时间百分位追踪                                    |
| v0.73.0 | Phase 71    | ✅ 完成    | GitLab: GitLab CI 集成                                               |
| v0.74.0 | Phase 72    | ✅ 完成    | Notification Types: 通知渠道/规则/日志                                |
| v0.75.0 | Phase 73    | ✅ 完成    | Scorecard: 项目评分卡                                                |
| v0.76.0 | Phase 74    | ✅ 完成    | Suggest: AI 驱动建议                                                 |
| v0.77.0 | Phase 75    | ✅ 完成    | Circuit Breaker: 熔断器                                              |
| v0.78.0 | Phase 76    | ✅ 完成    | GitHub Action: 工作流 YAML 生成                                      |
| v0.79.0 | Phase 77    | ✅ 完成    | Export Types: 导出格式/配置/任务                                      |
| v0.80.0 | Phase 78    | ✅ 完成    | Leaderboard: 团队 AI 效能排行                                        |
| v0.81.0 | Phase 79    | ✅ 完成    | Setup Hooks: Git 钩子一键安装                                        |
| v0.82.0 | Phase 80    | ✅ 完成    | Retry: 指数退避重试工具                                              |
| v0.83.0 | Phase 81    | ✅ 完成    | Docker: Docker 配置生成                                              |
| v0.84.0 | Phase 82    | ✅ 完成    | API Analytics: API 用量/限流/配额                                    |
| v0.85.0 | Phase 83    | ✅ 完成    | Forecast: 指标趋势预测                                               |
| v0.86.0 | Phase 84    | ✅ 完成    | Quick: 单行项目状态                                                  |
| v0.87.0 | Phase 85    | ✅ 完成    | Env Check: 环境变量启动验证                                          |
| v0.88.0 | Phase 86    | ✅ 完成    | Markdown Report: 完整 Markdown 报告                                  |

## 当前综合评分

**9.5/10**（详见 `docs/workflow/scoring-standards.md`）

| 维度         | 分数    |
| ------------ | ------- |
| 功能完成度   | 10/10   |
| 代码质量     | 9.5/10  |
| 架构合理性   | 9.5/10  |
| 用户体验     | 9.5/10  |
| 安全性       | 9/10    |
| 性能         | 9/10    |
| 文档完备度   | 9.5/10  |
| 协作效率     | 9.5/10  |

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
| Iteration-013 | 2026-02-26 | v0.12.0 | CLI 重试逻辑 + React ErrorBoundary |
| Iteration-014 | 2026-02-26 | v0.13.0 | vibe fix 可操作修复建议 |
| Iteration-015 | 2026-02-26 | v0.14.0 | Admin 使用统计端点 |
| Iteration-016 | 2026-02-26 | v0.15.0 | 自定义决策规则类型定义 |
| Iteration-017 | 2026-02-26 | v0.16.0 | 健康检查增强 (DB + Redis) |
| Iteration-018 | 2026-02-26 | v0.17.0 | CLI 上下文提示 (showTip) |
| Iteration-019 | 2026-02-26 | v0.18.0 | 可配置品牌常量 (BRANDING) |
| Iteration-020 | 2026-02-26 | v0.19.0 | 指标告警配置 API |
| Iteration-021 | 2026-02-26 | v0.20.0 | 结构化请求日志中间件 |
| Iteration-022 | 2026-02-26 | v0.21.0 | PR 风险摘要 (vibe pr) |
| Iteration-023 | 2026-02-26 | v0.22.0 | 透明速率限制头 (X-RateLimit-*) |
| Iteration-024 | 2026-02-26 | v0.23.0 | 快照对比 (vibe diff) |
| Iteration-025 | 2026-02-26 | v0.24.0 | 优雅关闭 (SIGTERM/SIGINT) |
| Iteration-026 | 2026-02-26 | v0.25.0 | 自动检测项目 (vibe init --auto) |
| Iteration-027 | 2026-02-26 | v0.26.0 | HTML 报告导出 (vibe report --format html) |
| Iteration-028 | 2026-02-26 | v0.27.0 | 终端仪表盘 (vibe dashboard) |
| Iteration-029 | 2026-02-26 | v0.28.0 | 项目健康评估 (vibe health) |
| Iteration-030 | 2026-02-26 | v0.29.0 | Admin 项目统计端点 |
| Iteration-031 | 2026-02-26 | v0.30.0 | Changelog 命令 (AI 检测) |
| Iteration-032 | 2026-02-26 | v0.31.0 | Review 建议命令 |
| Iteration-033 | 2026-02-26 | v0.32.0 | Request ID 中间件 |
| Iteration-034 | 2026-02-26 | v0.33.0 | CI/CD 集成命令 |
| Iteration-035 | 2026-02-26 | v0.34.0 | 定价层级常量 |
| Iteration-036 | 2026-02-26 | v0.35.0 | Watch 实时轮询 |
| Iteration-037 | 2026-02-26 | v0.36.0 | Config 配置管理 |
| Iteration-038 | 2026-02-26 | v0.37.0 | Metrics Collector 请求计数 |
| Iteration-039 | 2026-02-26 | v0.38.0 | Git Hook 安装 |
| Iteration-040 | 2026-02-26 | v0.39.0 | Subscription 类型定义 |
| Iteration-041 | 2026-02-26 | v0.40.0 | Search 文件搜索 |
| Iteration-042 | 2026-02-26 | v0.41.0 | Explain 指标解释 |
| Iteration-043 | 2026-02-26 | v0.42.0 | Sanitize 输入净化 |
| Iteration-044 | 2026-02-26 | v0.43.0 | Badge 徽章生成 |
| Iteration-045 | 2026-02-26 | v0.44.0 | 集成注册表 |
| Iteration-046 | 2026-02-26 | v0.45.0 | Summary 综合命令 |
| Iteration-047 | 2026-02-26 | v0.46.0 | History 火花图 |
| Iteration-048 | 2026-02-26 | v0.47.0 | Validators 验证工具 |
| Iteration-049 | 2026-02-26 | v0.48.0 | Export Config YAML 导出 |
| Iteration-050 | 2026-02-26 | v0.49.0 | Billing Types 计费接口 |
| Iteration-051 | 2026-02-26 | v0.50.0 | Trends 指标趋势箭头 |
| Iteration-052 | 2026-02-26 | v0.51.0 | Help Me 交互式故障排除 |
| Iteration-053 | 2026-02-26 | v0.52.0 | Redis Rate Limit Store |
| Iteration-054 | 2026-02-26 | v0.53.0 | Deploy Check 部署前风险评估 |
| Iteration-055 | 2026-02-26 | v0.54.0 | Feature Flags 功能开关 |
| Iteration-056 | 2026-02-26 | v0.55.0 | Compare Tools AI 工具对比 |
| Iteration-057 | 2026-02-26 | v0.56.0 | Onboard CLI 引导向导 |
| Iteration-058 | 2026-02-26 | v0.57.0 | Crypto 哈希/令牌/HMAC |
| Iteration-059 | 2026-02-26 | v0.58.0 | Slack Report Webhook 报告 |
| Iteration-060 | 2026-02-26 | v0.59.0 | Audit Types 审计日志 |
| Iteration-061 | 2026-02-26 | v0.60.0 | Hotspots 热点深度分析 |
| Iteration-062 | 2026-02-26 | v0.61.0 | What-If PSRI 权重模拟 |
| Iteration-063 | 2026-02-26 | v0.62.0 | CORS Config 集中配置 |
| Iteration-064 | 2026-02-26 | v0.63.0 | Git Stats 本地统计 |
| Iteration-065 | 2026-02-26 | v0.64.0 | Organization Types 多租户 |
| Iteration-066 | 2026-02-26 | v0.65.0 | Top 实时风险排行 |
| Iteration-067 | 2026-02-26 | v0.66.0 | Why 风险原因解释 |
| Iteration-068 | 2026-02-26 | v0.67.0 | Pagination 游标分页 |
| Iteration-069 | 2026-02-26 | v0.68.0 | Jira 风险报告集成 |
| Iteration-070 | 2026-02-26 | v0.69.0 | Webhook Config 类型 |
| Iteration-071 | 2026-02-26 | v0.70.0 | Profile 开发者统计 |
| Iteration-072 | 2026-02-26 | v0.71.0 | Ignore 排除模式 |
| Iteration-073 | 2026-02-26 | v0.72.0 | Response Time 百分位 |
| Iteration-074 | 2026-02-26 | v0.73.0 | GitLab CI 集成 |
| Iteration-075 | 2026-02-26 | v0.74.0 | Notification 通知类型 |
| Iteration-076 | 2026-02-26 | v0.75.0 | Scorecard 评分卡 |
| Iteration-077 | 2026-02-26 | v0.76.0 | Suggest AI 建议 |
| Iteration-078 | 2026-02-26 | v0.77.0 | Circuit Breaker 熔断器 |
| Iteration-079 | 2026-02-26 | v0.78.0 | GitHub Action 生成 |
| Iteration-080 | 2026-02-26 | v0.79.0 | Export 导出类型 |
| Iteration-081 | 2026-02-26 | v0.80.0 | Leaderboard 排行榜 |
| Iteration-082 | 2026-02-26 | v0.81.0 | Setup Hooks 钩子安装 |
| Iteration-083 | 2026-02-26 | v0.82.0 | Retry 重试工具 |
| Iteration-084 | 2026-02-26 | v0.83.0 | Docker 配置生成 |
| Iteration-085 | 2026-02-26 | v0.84.0 | API Analytics 类型 |
| Iteration-086 | 2026-02-26 | v0.85.0 | Forecast 趋势预测 |
| Iteration-087 | 2026-02-26 | v0.86.0 | Quick 单行状态 |
| Iteration-088 | 2026-02-26 | v0.87.0 | Env Check 环境验证 |
| Iteration-089 | 2026-02-26 | v0.88.0 | Markdown Report 完整报告 |

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
