# CLAUDE.md — AI Agent 协作规则

## 项目上下文

VibeBetter (AEIP) 是一个 AI Coding Insight 平台，用于度量 AI 编码工具的效果、追踪代码结构风险、提供数据驱动的工程决策。

## 技术栈

- **前端**：Next.js 15 + TypeScript + Tailwind CSS + ECharts
- **后端**：Node.js + Hono + Prisma + BullMQ + Zod
- **数据库**：PostgreSQL 16 + Redis 7
- **Monorepo**：pnpm workspaces + Turborepo

## 开发命令

```bash
pnpm dev          # 启动全栈开发
pnpm lint         # lint 全部包
pnpm test         # 运行全部测试
pnpm build        # 构建全部包
pnpm format       # 格式化代码
```

## 编码规范

1. **TypeScript 严格模式** — `strict: true`，禁止 `any`
2. **Zod 校验** — 所有 API 入参使用 Zod Schema 校验
3. **Service 层** — Route → Service → Prisma，Route 层不直接调用数据库
4. **AppError** — 业务错误使用 AppError 类（不用 throw 裸字符串）
5. **命名规范** — 文件 kebab-case，类 PascalCase，函数 camelCase
6. **Commit 格式** — `<type>(<scope>): <subject>`

## API 路由结构

```
/api/v1/auth/*              — 认证
/api/v1/projects/*          — 项目 CRUD
/api/v1/metrics/*           — 指标计算
/api/v1/collectors/*        — 数据采集
/api/v1/weights/*           — 权重配置
/api/v1/decisions/*         — 决策建议
/api/v1/behaviors/*         — 用户/AI 行为
```

## 工作流规则

1. 每个任务开始前阅读 `docs/workflow/README.md`
2. 执行中记录进度、风险、技术决策
3. 结束时更新迭代归档文档
4. 测试必须通过（lint + test + build）后才提交
5. Commit 按功能聚合，不要零碎提交

## 注意事项

- `.env` 文件需要同时复制到 `apps/server/.env` 和 `packages/db/.env`
- Prisma `Json` 类型在 TypeScript 中需要 `as Record<string, unknown>` 断言
- 前端 API 路径必须与后端路由挂载结构对齐（如 `/api/v1/metrics/projects/:id/...`）
- Docker 在此 VM 中需要 `fuse-overlayfs` 存储驱动
- 使用 `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` 环境变量来执行 Prisma 危险操作
