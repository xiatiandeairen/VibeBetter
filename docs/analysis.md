# AEIP 行业专家评审报告

> 以行业专家视角，对当前前端和后端在**产品功能特性**、**架构设计**、**代码质量**三个维度进行评审。

---

## 1. 产品功能特性评审

### 1.1 已实现能力

| 功能域           | 当前状态         | 成熟度  |
| ---------------- | ---------------- | ------- |
| 用户认证         | JWT 注册/登录    | ★★★☆☆  |
| 项目管理         | CRUD             | ★★★☆☆  |
| GitHub 数据采集  | PR 基础数据      | ★★★☆☆  |
| 本地 Git 采集    | 提交历史/文件变更 | ★★☆☆☆  |
| AI 行为识别      | Label/Commit 关键词 | ★★☆☆☆ |
| AI 成果率指标    | Success/Stable Rate | ★★★☆☆ |
| PSRI 风险指数    | 3 维度简化版     | ★★☆☆☆  |
| Dashboard 可视化 | 4 面板 + 趋势图  | ★★★☆☆  |
| 任务队列         | BullMQ 框架搭建  | ★★☆☆☆  |

### 1.2 关键功能缺失

#### P0（阻塞产品可用性）

| 缺失项                             | 影响                                       | 建议                                       |
| ---------------------------------- | ------------------------------------------ | ------------------------------------------ |
| **OAuth SSO 登录**                 | 企业用户不会手动注册，需 GitHub/GitLab SSO  | 接入 NextAuth.js + GitHub/GitLab OAuth      |
| **Webhook 实时数据接入**           | 当前仅有手动触发采集，无法实现 PR 阶段 ≤30s 风险评估 | 添加 GitHub Webhook endpoint + 签名验证 |
| **增量采集**                       | 每次全量拉取 PR，大仓库会触发 Rate Limit    | 实现基于 `since` 参数的增量采集 + etag 缓存 |
| **错误处理用户反馈**               | 采集失败无前端通知，用户不知道发生了什么    | 实现采集任务实时状态推送（SSE 或 WebSocket） |

#### P1（影响产品价值）

| 缺失项                             | 影响                                       | 建议                                       |
| ---------------------------------- | ------------------------------------------ | ------------------------------------------ |
| **PSRI 完整 6 维度计算**           | 当前仅 3 维度，风险评估不完整               | 补充 Architecture Risk、Runtime Risk、Coverage Gap |
| **TDI 技术债指数**                 | spec 中定义但未实现                         | 实现公式计算 + 趋势存储                     |
| **决策建议引擎**                   | 核心差异化功能未实现                        | 实现规则引擎 + 建议生成 + 前端展示          |
| **权重配置 UI**                    | PSRI 权重硬编码在代码中                     | 添加项目级权重配置页面                      |
| **多用户协作**                     | 项目仅关联 owner，无团队概念                | 实现 ProjectMember 邀请 + RBAC 权限检查     |
| **数据导出**                       | 无法导出指标数据用于外部分析                | 添加 CSV/JSON 导出 API                      |

#### P2（提升用户体验）

| 缺失项                             | 影响                                       | 建议                                       |
| ---------------------------------- | ------------------------------------------ | ------------------------------------------ |
| **指标下钻**                       | PSRI → 子维度 → 文件级追溯链路未实现        | 实现三级钻取交互                            |
| **趋势对比**                       | 无法对比不同时间段的指标变化                | 添加时间范围选择器 + 同比/环比              |
| **文件详情页**                     | 点击文件无法查看详细指标和历史               | 添加文件详情路由 + 复杂度变化趋势           |
| **通知/告警**                      | 指标异常无通知                              | 支持阈值告警 + 邮件/Slack 通知              |
| **国际化**                         | 仅英文                                     | 接入 next-intl 支持中英文切换               |

---

## 2. 架构设计评审

### 2.1 整体架构优点

- **Monorepo 结构合理**：packages/shared 实现前后端类型共享，减少接口对齐成本
- **Prisma Schema 设计规范**：使用 `@@map` 保持数据库 snake_case 命名，模型关系清晰
- **Collector 插件化**：`IDataCollector` 接口 + `CollectorRegistry` 注册模式可扩展
- **Zod Schema 前后端复用**：注册/登录/创建项目的校验 Schema 前后端共享

### 2.2 架构设计不足

#### 2.2.1 后端分层不清

**问题**：Routes 中直接混合了业务逻辑和数据访问。

```
现状：Route → 直接调用 Prisma
应该：Route → Service → Repository
```

`routes/v1/metrics.ts` 中直接包含 `prisma.project.findFirst` 等数据库查询，而非委托给 Service 层。仅 `metricsService` 有独立的服务层，其余路由（auth、projects、collectors）均在 Route 中直接操作数据库。

**影响**：违反单一职责；业务逻辑无法被多个路由复用；难以单元测试（需 mock Prisma 而非 mock Service）。

**建议**：为每个领域创建 Service 类（`AuthService`, `ProjectService`, `CollectionService`），Route 层仅负责请求解析和响应序列化。

#### 2.2.2 缺少统一错误处理

**问题**：每个路由中重复 `try/catch + console.error + 500 response` 模式。

**影响**：错误处理逻辑分散；缺少结构化错误日志；无法区分业务错误和系统错误。

**建议**：
- 创建 `AppError` 基类（含 statusCode、errorCode、message）
- 实现 Hono 全局 `onError` 中间件
- 使用结构化日志（pino/winston）替代 `console.error`

#### 2.2.3 认证机制过于简化

**问题**：
- JWT 无刷新机制（Token 过期即需重新登录）
- 密码策略无复杂度校验
- 无 Rate Limiting 防暴力破解
- Token 存储在 localStorage（XSS 风险）

**建议**：
- 实现 Refresh Token 机制（短期 Access Token + 长期 Refresh Token）
- 在 Zod Schema 中增加密码复杂度校验
- 使用 Hono Rate Limiter 中间件
- 考虑 httpOnly Cookie 替代 localStorage

#### 2.2.4 数据采集架构缺陷

**问题**：
- `GitHubCollector.collect()` 是同步全量采集，无分页处理（仅获取第一页 100 条 PR）
- 每次采集为每个 PR 串行调用 `fetchCommitMessages`（N+1 问题）
- 采集失败无断点续采能力
- 无采集频率控制和 Rate Limit 管理

**建议**：
- 实现 GitHub API 分页遍历
- 批量获取 commit messages 或异步并发处理
- 记录采集 cursor/checkpoint
- 实现 Rate Limit 感知的重试策略

#### 2.2.5 前端状态管理不完善

**问题**：
- 用户认证状态依赖 `localStorage.getItem('token')` 的命令式检查
- 无全局 Auth Context，每个页面独立检查 Token
- 项目选择状态通过 `useState` 管理，页面切换会丢失

**建议**：
- 创建 `AuthProvider` Context 管理认证状态
- 使用 Zustand/Jotai 管理全局状态（当前项目选择等）
- Token 刷新逻辑统一在 API 拦截器中处理

#### 2.2.6 缺少 API 版本化策略落地

**问题**：虽然路由挂载在 `/api/v1/` 下，但没有实际的版本协商机制。

**建议**：定义 API 版本策略文档；为 API 添加 OpenAPI/Swagger 文档自动生成。

---

## 3. 代码质量评审

### 3.1 代码优点

- **TypeScript 严格模式**：`strict: true` + `noUncheckedIndexedAccess` 确保类型安全
- **Zod 运行时校验**：环境变量、API 入参均有 Schema 校验
- **关注点分离**：shared 包独立出类型、常量、校验
- **测试覆盖**：MetricsService 有 12 个单元测试，shared utils 有 5 个

### 3.2 代码质量问题

#### 3.2.1 测试覆盖率不足

| 模块                | 当前覆盖  | 目标     | 差距                        |
| ------------------- | --------- | -------- | --------------------------- |
| MetricsService      | ★★★☆☆    | ≥ 80%    | 缺少集成测试和边界用例      |
| Auth Routes         | ☆☆☆☆☆    | ≥ 70%    | 完全无测试                  |
| Project Routes      | ☆☆☆☆☆    | ≥ 70%    | 完全无测试                  |
| Collectors          | ☆☆☆☆☆    | ≥ 60%    | 完全无测试                  |
| 前端组件            | ☆☆☆☆☆    | ≥ 50%    | 完全无测试                  |
| 前端页面            | ☆☆☆☆☆    | ≥ 30%    | 完全无测试                  |

#### 3.2.2 重复代码

1. **项目所有权检查**：每个受保护路由重复 `prisma.project.findFirst({ where: { id, ownerId: userId } })`，应抽取为中间件或 Service 方法。

2. **加载/空状态 UI**：多个页面重复 spinner + dashed-border 空状态组件，应抽取为 `<LoadingState>` 和 `<EmptyState>` 组件。

3. **项目选择器**：Dashboard、Risk、Collection 三个页面重复了完全相同的项目下拉选择逻辑，应抽取为 `<ProjectSelector>` 组件。

#### 3.2.3 安全隐患

| 问题                          | 风险等级 | 说明                                              |
| ----------------------------- | -------- | ------------------------------------------------- |
| JWT 存储在 localStorage       | 中       | XSS 攻击可窃取 Token                              |
| 无 CSRF 防护                  | 中       | 跨站请求伪造风险                                  |
| 密码无复杂度校验              | 低       | 用户可设置弱密码                                  |
| GitHub Token 明文配置         | 中       | 应使用加密的 secret 管理                          |
| CORS 配置为 `origin: '*'`    | 中       | 生产环境应限制为具体域名                          |
| 无请求大小限制                | 低       | 可能被大 Payload 攻击                              |

#### 3.2.4 性能隐患

| 问题                              | 影响                              | 建议                              |
| --------------------------------- | --------------------------------- | --------------------------------- |
| MetricsService 多次查询同一数据   | computeAndSaveSnapshot 中重复查询 | 合并查询，一次加载所有需要的数据  |
| 前端无 API 缓存策略               | React Query 使用默认配置         | 配置 staleTime 和 cacheTime       |
| ECharts 组件无 memo               | 每次父组件渲染都会重新创建 chart | 使用 React.memo + useMemo option  |
| 全量加载 ECharts                  | 打包体积约 300KB+                | 按需导入 ECharts 模块             |
| 无数据库查询索引审查              | 复杂查询可能全表扫描              | 审查并添加复合索引                |

#### 3.2.5 代码规范偏差

| 偏差                                     | 位置                    | 说明                                |
| ---------------------------------------- | ----------------------- | ----------------------------------- |
| Collector category 类型不一致            | base.ts vs github.ts    | 接口定义为 `string`，应为枚举       |
| 魔法数字                                 | metrics.service.ts      | `maxComplexity = 100` 应提取为常量  |
| 未使用的导入                             | 部分文件                | 应由 ESLint 检测并移除              |
| 种子脚本依赖 Math.random                 | seed/index.ts           | 应使用确定性种子数据便于测试        |
| 无 API 请求/响应日志                     | routes                  | 应添加结构化请求日志                |

---

## 4. 改进优先级总览

| 优先级 | 改进项                        | 预估工期 | 影响面     |
| ------ | ----------------------------- | -------- | ---------- |
| P0     | OAuth SSO 登录                | 2d       | 用户获取   |
| P0     | Webhook 实时采集              | 3d       | 核心价值   |
| P0     | 增量采集 + 分页               | 2d       | 可用性     |
| P0     | 统一错误处理中间件            | 1d       | 代码质量   |
| P1     | 完整 PSRI 6 维度              | 2d       | 产品价值   |
| P1     | 决策建议引擎                  | 3d       | 核心差异化 |
| P1     | Auth Provider + 全局状态      | 1d       | 前端架构   |
| P1     | 后端 Service 层抽取           | 2d       | 架构质量   |
| P1     | API 集成测试                  | 2d       | 代码质量   |
| P2     | 指标下钻交互                  | 2d       | 用户体验   |
| P2     | ECharts 按需加载              | 0.5d     | 性能       |
| P2     | 安全加固（CORS/CSRF/Cookie）  | 1d       | 安全       |
| P2     | OpenAPI 文档自动生成          | 1d       | 开发者体验 |
