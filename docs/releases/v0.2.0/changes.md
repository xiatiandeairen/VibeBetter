# v0.2.0 全部开发变更

## 后端新增
- AppError 类 + 全局 onError 中间件
- Service 层: AuthService, ProjectService, DecisionService
- PSRI 6 维度计算 (structural/change/defect/architecture/runtime/coverage)
- TDI 技术债指数计算
- 决策建议引擎 (5 条规则)
- 权重配置 API (WeightConfig CRUD)
- 用户行为追踪 API (UserBehavior)
- AI 行为追踪 API (AiBehavior)
- GitHub Collector: 分页 + 增量 + Rate Limit 感知
- 4 个新 Prisma 模型

## 后端重构
- Routes 重构使用 Service 层 (auth/projects 不再直接调用 Prisma)

## 前端新增
- Decisions 页面 (决策卡片 + 生成/接受/拒绝)
- AI Insights 页面 (工具效果 + 使用分布 + 开发者活动)
- Dashboard Health Assessment 执行摘要横幅
- TDI 展示在 Quick Stats
- API 客户端新增 8 个方法

## Bug 修复
- 种子数据: 0 PR → 25 PR (AI 成果率从 N/A → 84.2%)
- 确定性 PRNG (seed=42) 种子数据
- 前后端 API 路径对齐
- MetricSnapshot 类型添加 tdiScore
