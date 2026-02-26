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
| v0.89.0 | Phase 87    | ✅ 完成    | SSO Types: SAML + OIDC 单点登录类型                                  |
| v0.90.0 | Phase 88    | ✅ 完成    | Sprint Plan: 冲刺优先级建议                                          |
| v0.91.0 | Phase 89    | ✅ 完成    | Annotate: 文件注释管理                                               |
| v0.92.0 | Phase 90    | ✅ 完成    | Graceful Error: 异步路由错误转发                                     |
| v0.93.0 | Phase 91    | ✅ 完成    | Pre-Review: 变更文件审查清单                                         |
| v0.94.0 | Phase 92    | ✅ 完成    | Report Types: 报告模板/调度/投递                                     |
| v0.95.0 | Phase 93    | ✅ 完成    | Goals: 指标目标设定追踪                                              |
| v0.96.0 | Phase 94    | ✅ 完成    | Alias: 自定义命令别名                                                |
| v0.97.0 | Phase 95    | ✅ 完成    | DB Health: 数据库连接池监控                                          |
| v0.98.0 | Phase 96    | ✅ 完成    | Standup: 每日站会摘要                                                |
| v0.99.0 | Phase 97    | ✅ 完成    | Marketplace Types: 插件市场类型                                      |
| v1.0.0  | Phase 98    | ✅ 完成    | Version Info: 全包版本信息                                           |
| v1.1.0  | Phase 99    | ✅ 完成    | Interactive: 交互式菜单模式                                          |
| v1.2.0  | Phase 100   | ✅ 完成    | Startup Checks: 全面启动验证                                        |
| v1.3.0  | Phase 101   | ✅ 完成    | Retro: 冲刺回顾数据                                                 |
| v1.4.0  | Phase 102   | ✅ 完成    | Custom Metrics: 自定义指标类型                                       |
| v1.5.0  | Phase 103   | ✅ 完成    | Benchmark: 行业基准对比                                              |
| v1.6.0  | Phase 104   | ✅ 完成    | Notify: 指标告警通知                                                 |
| v1.7.0  | Phase 105   | ✅ 完成    | Migration Helper: 安全迁移助手                                       |
| v1.8.0  | Phase 106   | ✅ 完成    | Compliance: 合规阈值检查                                             |
| v1.9.0  | Phase 107   | ✅ 完成    | API Versioning: 版本协商/废弃通知类型                                |
| v1.10.0 | Phase 108   | ✅ 完成    | Flow: 数据流可视化                                                   |
| v1.11.0 | Phase 109   | ✅ 完成    | Tutorial: CLI 新手教程                                               |
| v1.12.0 | Phase 110   | ✅ 完成    | Query Timer: 慢查询检测装饰器                                        |
| v1.13.0 | Phase 111   | ✅ 完成    | GitLab CI: .gitlab-ci.yml 生成                                       |
| v1.14.0 | Phase 112   | ✅ 完成    | Tenant: 多租户 SaaS 类型                                             |
| v1.15.0 | Phase 113   | ✅ 完成    | Modules: 模块风险评分                                                |
| v1.16.0 | Phase 114   | ✅ 完成    | Pin: 文件书签追踪                                                    |
| v1.17.0 | Phase 115   | ✅ 完成    | Feature Toggle: 环境变量功能开关                                     |
| v1.18.0 | Phase 116   | ✅ 完成    | Pre-Merge: 合并前综合检查                                            |
| v1.19.0 | Phase 117   | ✅ 完成    | Data Retention: 数据保留策略类型                                     |
| v1.20.0 | Phase 118   | ✅ 完成    | Timeline: ASCII 指标时间线图表                                       |
| v1.21.0 | Phase 119   | ✅ 完成    | Focus: 文件/目录过滤仪表盘                                          |
| v1.22.0 | Phase 120   | ✅ 完成    | Idempotency: POST 请求幂等键处理                                     |
| v1.23.0 | Phase 121   | ✅ 完成    | Bitbucket: Bitbucket 集成输出                                        |
| v1.24.0 | Phase 122   | ✅ 完成    | SLA: SLA/SLO/SLI 可靠性定义                                         |
| v1.25.0 | Phase 123   | ✅ 完成    | Contributors: 贡献者 AI 使用统计                                     |
| v1.26.0 | Phase 124   | ✅ 完成    | Preferences: 用户偏好管理                                            |
| v1.27.0 | Phase 125   | ✅ 完成    | Cache Strategy: 缓存键构建器                                         |
| v1.28.0 | Phase 126   | ✅ 完成    | Azure: Azure DevOps 集成                                             |
| v1.29.0 | Phase 127   | ✅ 完成    | Access Control: ABAC 权限模型                                        |
| v1.30.0 | Phase 128   | ✅ 完成    | Changelog Dashboard: 变更历史页面                                    |
| v1.31.0 | Phase 129   | ✅ 完成    | Doctor: 环境诊断命令                                                 |
| v1.32.0 | Phase 130   | ✅ 完成    | Event Bus: 进程内事件总线                                            |
| v1.33.0 | Phase 131   | ✅ 完成    | Notebook: Jupyter 风格导出                                           |
| v1.34.0 | Phase 132   | ✅ 完成    | Usage Tracking: 用量追踪类型                                        |
| v1.35.0 | Phase 133   | ✅ 完成    | Timeline Dashboard: 指标历史时间线                                   |
| v1.36.0 | Phase 134   | ✅ 完成    | Feedback: CLI 反馈提交                                               |
| v1.37.0 | Phase 135   | ✅ 完成    | JSON Schema: API 请求验证                                            |
| v1.38.0 | Phase 136   | ✅ 完成    | SonarQube: 指标格式化集成                                            |
| v1.39.0 | Phase 137   | ✅ 完成    | White Label: 白标配置类型                                            |
| v1.40.0 | Phase 138   | ✅ 完成    | Goals Dashboard: 指标目标追踪                                        |
| v1.41.0 | Phase 139   | ✅ 完成    | Shortcuts: 命令快捷方式列表                                          |
| v1.42.0 | Phase 140   | ✅ 完成    | Concurrency: 信号量/互斥锁                                          |
| v1.43.0 | Phase 141   | ✅ 完成    | Datadog: 自定义指标集成                                              |
| v1.44.0 | Phase 142   | ✅ 完成    | Compliance: 合规框架类型                                             |
| v1.45.0 | Phase 143   | ✅ 完成    | Digest Dashboard: 周报摘要页面                                       |
| v1.46.0 | Phase 144   | ✅ 完成    | Reset: CLI 配置/缓存重置                                             |
| v1.47.0 | Phase 145   | ✅ 完成    | Compression: 响应压缩中间件                                          |
| v1.48.0 | Phase 146   | ✅ 完成    | Prometheus: 指标 Prometheus 格式                                     |
| v1.49.0 | Phase 147   | ✅ 完成    | Migration: 数据迁移类型                                              |
| v1.50.0 | Phase 148   | ✅ 完成    | Modules Dashboard: 模块风险聚合                                      |
| v1.51.0 | Phase 149   | ✅ 完成    | Improve: 代码改进建议                                                |
| v1.52.0 | Phase 150   | ✅ 完成    | Batch Processor: 批处理工具                                          |
| v1.53.0 | Phase 151   | ✅ 完成    | Terraform: 基础设施配置生成                                          |
| v1.54.0 | Phase 152   | ✅ 完成    | Analytics Event: 分析事件类型                                        |
| v1.55.0 | Phase 153   | ✅ 完成    | Trends Detail: 详细趋势分析                                          |
| v1.56.0 | Phase 154   | ✅ 完成    | Compare Branches: 分支对比                                           |
| v1.57.0 | Phase 155   | ✅ 完成    | Connection Pool: 连接池管理                                          |
| v1.58.0 | Phase 156   | ✅ 完成    | Email Report: HTML 邮件报告                                          |
| v1.59.0 | Phase 157   | ✅ 完成    | RBAC: 细粒度权限模型                                                 |
| v1.60.0 | Phase 158   | ✅ 完成    | Activity Dashboard: 活动动态流                                       |
| v1.61.0 | Phase 159   | ✅ 完成    | Clean: 旧数据清理                                                    |
| v1.62.0 | Phase 160   | ✅ 完成    | Timeout: 请求超时包装器                                              |
| v1.63.0 | Phase 161   | ✅ 完成    | CSV: 指标表 CSV 导出                                                 |
| v1.64.0 | Phase 162   | ✅ 完成    | API Key Scope: 细粒度 API 密钥                                      |
| v1.65.0 | Phase 163   | ✅ 完成    | AI Compare: AI vs Human 对比                                        |
| v1.66.0 | Phase 164   | ✅ 完成    | Undo: 操作撤销                                                      |
| v1.67.0 | Phase 165   | ✅ 完成    | Structured Error: 结构化错误类型                                     |
| v1.68.0 | Phase 166   | ✅ 完成    | OpenTelemetry: 指标 OTLP 导出                                       |
| v1.69.0 | Phase 167   | ✅ 完成    | Partner: 合作伙伴集成类型                                           |
| v1.70.0 | Phase 168   | ✅ 完成    | Diff Files: 文件级风险对比                                          |
| v1.71.0 | Phase 169   | ✅ 完成    | Bookmarks: 文件书签快速访问                                         |
| v1.72.0 | Phase 170   | ✅ 完成    | Health Aggregator: 子系统健康聚合                                   |
| v1.73.0 | Phase 171   | ✅ 完成    | Jenkins: Jenkins 流水线生成                                         |
| v1.74.0 | Phase 172   | ✅ 完成    | License: 许可证密钥/层级/验证                                       |
| v1.75.0 | Phase 173   | ✅ 完成    | Deps: 文件依赖分析                                                  |
| v1.76.0 | Phase 174   | ✅ 完成    | Remind: 指标提醒设置                                                |
| v1.77.0 | Phase 175   | ✅ 完成    | Config Validator: 启动配置验证                                      |
| v1.78.0 | Phase 176   | ✅ 完成    | K8s: Kubernetes 部署清单                                            |
| v1.79.0 | Phase 177   | ✅ 完成    | Entitlements: 权益/功能门控/用量限制                                |
| v1.80.0 | Phase 178   | ✅ 完成    | Coverage: 测试覆盖率展示                                            |
| v1.81.0 | Phase 179   | ✅ 完成    | Journal: 每日 AI 编码日志                                           |
| v1.82.0 | Phase 180   | ✅ 完成    | Shutdown Manager: 有序关闭管理                                      |
| v1.83.0 | Phase 181   | ✅ 完成    | Backstage: Backstage 目录生成                                       |
| v1.84.0 | Phase 182   | ✅ 完成    | Invoice: 发票/支付/账单周期                                         |
| v1.85.0 | Phase 183   | ✅ 完成    | Velocity: 团队速度指标                                              |
| v1.86.0 | Phase 184   | ✅ 完成    | Cheatsheet: CLI 速查表                                              |
| v1.87.0 | Phase 185   | ✅ 完成    | Data Cleanup: 自动数据清理                                          |
| v1.88.0 | Phase 186   | ✅ 完成    | ArgoCD: ArgoCD 应用清单生成                                         |
| v1.89.0 | Phase 187   | ✅ 完成    | Onboarding Flow: 引导流程类型                                       |
| v1.90.0 | Phase 188   | ✅ 完成    | Graph: 依赖图 DOT 生成                                              |
| v1.91.0 | Phase 189   | ✅ 完成    | Calm: 仅显示可操作项                                                |
| v1.92.0 | Phase 190   | ✅ 完成    | Telemetry: 使用分析遥测                                             |
| v1.93.0 | Phase 191   | ✅ 完成    | Vercel: Vercel 部署配置                                             |
| v1.94.0 | Phase 192   | ✅ 完成    | Support: 工单/知识库类型                                            |
| v1.95.0 | Phase 193   | ✅ 完成    | Matrix: 风险矩阵可视化                                             |
| v1.96.0 | Phase 194   | ✅ 完成    | Autofix: 自动修复建议                                               |
| v1.97.0 | Phase 195   | ✅ 完成    | API Versioning: 版本协商中间件                                      |
| v1.98.0 | Phase 196   | ✅ 完成    | Helm: Helm Chart 值生成                                             |
| v1.99.0 | Phase 197   | ✅ 完成    | Changelog Config: 变更日志配置类型                                  |
| v2.0.0  | Phase 198   | ✅ 完成    | Studio: CLI 打开 Web 仪表盘                                        |
| v2.1.0  | Phase 199   | ✅ 完成    | Ask: 自然语言指标查询                                               |
| v2.2.0  | Phase 200   | ✅ 完成    | Database Monitor: 数据库查询监控                                    |
| v2.3.0  | Phase 201   | ✅ 完成    | Compose: Docker Compose 全栈生成                                    |
| v2.4.0  | Phase 202   | ✅ 完成    | Marketplace Plugin: 插件市场类型                                    |
| v2.5.0  | Phase 203   | ✅ 完成    | Dashboard URL: 仪表盘直链                                          |
| v2.6.0  | Phase 204   | ✅ 完成    | Offline: 离线缓存指标                                               |
| v2.7.0  | Phase 205   | ✅ 完成    | Security Headers: 安全响应头中间件                                  |
| v2.8.0  | Phase 206   | ✅ 完成    | Ansible: Ansible Playbook 生成                                      |
| v2.9.0  | Phase 207   | ✅ 完成    | Enterprise: SSO/Audit/DataRegion 类型                               |
| v2.10.0 | Phase 208   | ✅ 完成    | AI Score: 单一 AI 效能评分                                          |
| v2.11.0 | Phase 209   | ✅ 完成    | Walkthrough: 功能导览                                               |
| v2.12.0 | Phase 210   | ✅ 完成    | Error Catalog: 错误码目录                                           |
| v2.13.0 | Phase 211   | ✅ 完成    | Pulumi: 基础设施代码生成                                            |
| v2.14.0 | Phase 212   | ✅ 完成    | Contract: 服务合同/SLA 类型                                         |
| v2.15.0 | Phase 213   | ✅ 完成    | Radar: PSRI 雷达图                                                  |
| v2.16.0 | Phase 214   | ✅ 完成    | FAQ: 常见问题                                                       |
| v2.17.0 | Phase 215   | ✅ 完成    | Performance Monitor: 性能监控                                       |
| v2.18.0 | Phase 216   | ✅ 完成    | Chromatic: 视觉回归配置                                             |
| v2.19.0 | Phase 217   | ✅ 完成    | Channel: 分销渠道类型                                               |
| v2.20.0 | Phase 218   | ✅ 完成    | Predict: 趋势预测                                                   |
| v2.21.0 | Phase 219   | ✅ 完成    | Demo: 示例数据演示                                                  |
| v2.22.0 | Phase 220   | ✅ 完成    | Tracing: 请求追踪                                                   |
| v2.23.0 | Phase 221   | ✅ 完成    | Playwright: E2E 测试生成                                            |
| v2.24.0 | Phase 222   | ✅ 完成    | Growth: 增长指标类型                                                |
| v2.25.0 | Phase 223   | ✅ 完成    | Release Notes: 自动发布说明                                         |
| v2.26.0 | Phase 224   | ✅ 完成    | Celebrate: 成就庆祝                                                 |
| v2.27.0 | Phase 225   | ✅ 完成    | Backup: 数据库备份工具                                              |
| v2.28.0 | Phase 226   | ✅ 完成    | Ecosystem: 生态系统集成总览 — 200-round sprint complete 🏁          |

## 当前综合评分

**9.8/10**（详见 `docs/workflow/scoring-standards.md`）— v2.28 200-round sprint complete 🏁

| 维度         | 分数    |
| ------------ | ------- |
| 功能完成度   | 10/10   |
| 代码质量     | 9.8/10  |
| 架构合理性   | 9.8/10  |
| 用户体验     | 9.8/10  |
| 安全性       | 9.5/10  |
| 性能         | 9.5/10  |
| 文档完备度   | 10/10   |
| 协作效率     | 10/10   |

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
| Iteration-090 | 2026-02-26 | v0.89.0 | SSO Types SAML+OIDC |
| Iteration-091 | 2026-02-26 | v0.90.0 | Sprint Plan 冲刺优先级 |
| Iteration-092 | 2026-02-26 | v0.91.0 | Annotate 文件注释 |
| Iteration-093 | 2026-02-26 | v0.92.0 | Graceful Error 错误转发 |
| Iteration-094 | 2026-02-26 | v0.93.0 | Pre-Review 审查清单 |
| Iteration-095 | 2026-02-26 | v0.94.0 | Report Types 报告类型 |
| Iteration-096 | 2026-02-26 | v0.95.0 | Goals 指标目标 |
| Iteration-097 | 2026-02-26 | v0.96.0 | Alias 命令别名 |
| Iteration-098 | 2026-02-26 | v0.97.0 | DB Health 数据库健康 |
| Iteration-099 | 2026-02-26 | v0.98.0 | Standup 站会摘要 |
| Iteration-100 | 2026-02-26 | v0.99.0 | Marketplace 插件市场 |
| Iteration-101 | 2026-02-26 | v1.0.0  | Version Info 版本信息 |
| Iteration-102 | 2026-02-26 | v1.1.0  | Interactive 交互模式 |
| Iteration-103 | 2026-02-26 | v1.2.0  | Startup Checks 启动验证 |
| Iteration-104 | 2026-02-26 | v1.3.0  | Retro 冲刺回顾 |
| Iteration-105 | 2026-02-26 | v1.4.0  | Custom Metrics 自定义指标 |
| Iteration-106 | 2026-02-26 | v1.5.0  | Benchmark 行业基准 |
| Iteration-107 | 2026-02-26 | v1.6.0  | Notify 告警通知 |
| Iteration-108 | 2026-02-26 | v1.7.0  | Migration Helper 迁移助手 |
| Iteration-109 | 2026-02-26 | v1.8.0  | Compliance 合规检查 |
| Iteration-110 | 2026-02-26 | v1.9.0  | API Versioning 版本协商类型 |
| Iteration-111 | 2026-02-26 | v1.10.0 | Flow 数据流可视化 |
| Iteration-112 | 2026-02-26 | v1.11.0 | Tutorial CLI 教程 |
| Iteration-113 | 2026-02-26 | v1.12.0 | Query Timer 慢查询检测 |
| Iteration-114 | 2026-02-26 | v1.13.0 | GitLab CI 配置生成 |
| Iteration-115 | 2026-02-26 | v1.14.0 | Tenant 多租户类型 |
| Iteration-116 | 2026-02-26 | v1.15.0 | Modules 模块风险 |
| Iteration-117 | 2026-02-26 | v1.16.0 | Pin 文件书签 |
| Iteration-118 | 2026-02-26 | v1.17.0 | Feature Toggle 功能开关 |
| Iteration-119 | 2026-02-26 | v1.18.0 | Pre-Merge 合并前检查 |
| Iteration-120 | 2026-02-26 | v1.19.0 | Data Retention 数据保留 |
| Iteration-121 | 2026-02-26 | v1.20.0 | Timeline 时间线图表 |
| Iteration-122 | 2026-02-26 | v1.21.0 | Focus 过滤仪表盘 |
| Iteration-123 | 2026-02-26 | v1.22.0 | Idempotency 幂等键 |
| Iteration-124 | 2026-02-26 | v1.23.0 | Bitbucket 集成 |
| Iteration-125 | 2026-02-26 | v1.24.0 | SLA 可靠性定义 |
| Iteration-126 | 2026-02-26 | v1.25.0 | Contributors 贡献者统计 |
| Iteration-127 | 2026-02-26 | v1.26.0 | Preferences 用户偏好 |
| Iteration-128 | 2026-02-26 | v1.27.0 | Cache Strategy 缓存策略 |
| Iteration-129 | 2026-02-26 | v1.28.0 | Azure DevOps 集成 |
| Iteration-130 | 2026-02-26 | v1.29.0 | Access Control ABAC |
| Iteration-131 | 2026-02-26 | v1.30.0 | Changelog Dashboard |
| Iteration-132 | 2026-02-26 | v1.31.0 | Doctor 环境诊断 |
| Iteration-133 | 2026-02-26 | v1.32.0 | Event Bus 事件总线 |
| Iteration-134 | 2026-02-26 | v1.33.0 | Notebook 导出 |
| Iteration-135 | 2026-02-26 | v1.34.0 | Usage Tracking 用量 |
| Iteration-136 | 2026-02-26 | v1.35.0 | Timeline Dashboard |
| Iteration-137 | 2026-02-26 | v1.36.0 | Feedback 反馈 |
| Iteration-138 | 2026-02-26 | v1.37.0 | JSON Schema 验证 |
| Iteration-139 | 2026-02-26 | v1.38.0 | SonarQube 集成 |
| Iteration-140 | 2026-02-26 | v1.39.0 | White Label 白标 |
| Iteration-141 | 2026-02-26 | v1.40.0 | Goals Dashboard |
| Iteration-142 | 2026-02-26 | v1.41.0 | Shortcuts 快捷方式 |
| Iteration-143 | 2026-02-26 | v1.42.0 | Concurrency 并发控制 |
| Iteration-144 | 2026-02-26 | v1.43.0 | Datadog 集成 |
| Iteration-145 | 2026-02-26 | v1.44.0 | Compliance 合规 |
| Iteration-146 | 2026-02-26 | v1.45.0 | Digest Dashboard |
| Iteration-147 | 2026-02-26 | v1.46.0 | Reset 重置 |
| Iteration-148 | 2026-02-26 | v1.47.0 | Compression 压缩 |
| Iteration-149 | 2026-02-26 | v1.48.0 | Prometheus 指标 |
| Iteration-150 | 2026-02-26 | v1.49.0 | Migration 数据迁移类型 |
| Iteration-151 | 2026-02-26 | v1.50.0 | Modules Dashboard 模块风险 |
| Iteration-152 | 2026-02-26 | v1.51.0 | Improve 代码改进建议 |
| Iteration-153 | 2026-02-26 | v1.52.0 | Batch Processor 批处理 |
| Iteration-154 | 2026-02-26 | v1.53.0 | Terraform 基础设施配置 |
| Iteration-155 | 2026-02-26 | v1.54.0 | Analytics Event 分析事件 |
| Iteration-156 | 2026-02-26 | v1.55.0 | Trends Detail 详细趋势 |
| Iteration-157 | 2026-02-26 | v1.56.0 | Compare Branches 分支对比 |
| Iteration-158 | 2026-02-26 | v1.57.0 | Connection Pool 连接池 |
| Iteration-159 | 2026-02-26 | v1.58.0 | Email Report 邮件报告 |
| Iteration-160 | 2026-02-26 | v1.59.0 | RBAC 细粒度权限 |
| Iteration-161 | 2026-02-26 | v1.60.0 | Activity Dashboard 活动流 |
| Iteration-162 | 2026-02-26 | v1.61.0 | Clean 数据清理 |
| Iteration-163 | 2026-02-26 | v1.62.0 | Timeout 请求超时 |
| Iteration-164 | 2026-02-26 | v1.63.0 | CSV 导出 |
| Iteration-165 | 2026-02-26 | v1.64.0 | API Key Scope 密钥范围 |
| Iteration-166 | 2026-02-26 | v1.65.0 | AI Compare AI对比 |
| Iteration-167 | 2026-02-26 | v1.66.0 | Undo 操作撤销 |
| Iteration-168 | 2026-02-26 | v1.67.0 | Structured Error 结构化错误 |
| Iteration-169 | 2026-02-26 | v1.68.0 | OpenTelemetry OTLP 导出 |
| Iteration-170 | 2026-02-26 | v1.69.0 | Partner 合作伙伴类型 |
| Iteration-171 | 2026-02-26 | v1.70.0 | Diff Files 文件风险对比 |
| Iteration-172 | 2026-02-26 | v1.71.0 | Bookmarks 文件书签 |
| Iteration-173 | 2026-02-26 | v1.72.0 | Health Aggregator 健康聚合 |
| Iteration-174 | 2026-02-26 | v1.73.0 | Jenkins 流水线生成 |
| Iteration-175 | 2026-02-26 | v1.74.0 | License 许可证类型 |
| Iteration-176 | 2026-02-26 | v1.75.0 | Deps 依赖分析 |
| Iteration-177 | 2026-02-26 | v1.76.0 | Remind 指标提醒 |
| Iteration-178 | 2026-02-26 | v1.77.0 | Config Validator 配置验证 |
| Iteration-179 | 2026-02-26 | v1.78.0 | K8s Kubernetes 部署 |
| Iteration-180 | 2026-02-26 | v1.79.0 | Entitlements 权益类型 |
| Iteration-181 | 2026-02-26 | v1.80.0 | Coverage 覆盖率 |
| Iteration-182 | 2026-02-26 | v1.81.0 | Journal 编码日志 |
| Iteration-183 | 2026-02-26 | v1.82.0 | Shutdown Manager 关闭管理 |
| Iteration-184 | 2026-02-26 | v1.83.0 | Backstage 目录生成 |
| Iteration-185 | 2026-02-26 | v1.84.0 | Invoice 发票类型 |
| Iteration-186 | 2026-02-26 | v1.85.0 | Velocity 团队速度 |
| Iteration-187 | 2026-02-26 | v1.86.0 | Cheatsheet 速查表 |
| Iteration-188 | 2026-02-26 | v1.87.0 | Data Cleanup 数据清理 |
| Iteration-189 | 2026-02-26 | v1.88.0 | ArgoCD 应用清单 |
| Iteration-190 | 2026-02-26 | v1.89.0 | Onboarding Flow 引导流程 |
| Iteration-191 | 2026-02-26 | v1.90.0 | Graph 依赖图 DOT |
| Iteration-192 | 2026-02-26 | v1.91.0 | Calm 仅可操作项 |
| Iteration-193 | 2026-02-26 | v1.92.0 | Telemetry 使用分析 |
| Iteration-194 | 2026-02-26 | v1.93.0 | Vercel 部署配置 |
| Iteration-195 | 2026-02-26 | v1.94.0 | Support 工单类型 |
| Iteration-196 | 2026-02-26 | v1.95.0 | Matrix 风险矩阵 |
| Iteration-197 | 2026-02-26 | v1.96.0 | Autofix 自动修复 |
| Iteration-198 | 2026-02-26 | v1.97.0 | API Versioning 中间件 |
| Iteration-199 | 2026-02-26 | v1.98.0 | Helm Chart 值生成 |
| Iteration-200 | 2026-02-26 | v2.28.0 | **200-round sprint complete** — final batch v2.9–v2.28 |

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
