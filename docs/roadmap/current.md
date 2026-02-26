# VibeBetter v0.7.0 — 质量工程版本

## 版本主题

> **质量即产品力**：从「功能可用」提升到「工程可信赖」。

---

## 一、质量现状审计

### 1.1 数据摘要

| 维度                  | 当前值               | 行业标准           | 差距     |
| --------------------- | -------------------- | ------------------ | -------- |
| 测试文件数            | 3 个                 | ~1:1 (源文件数)    | 严重不足 |
| 自动测试数            | 45                   | 200+ (同规模项目)  | 不足     |
| 前端测试              | **0**                | ≥ 关键路径覆盖     | 缺失     |
| E2E 测试              | **0**                | ≥ 核心流程覆盖     | 缺失     |
| 代码覆盖率            | **未度量**           | ≥ 80%              | 未知     |
| 最大文件行数          | 360 行 (metrics.ts)  | ≤ 200 行           | 超标     |
| 项目权限检查重复      | 25+ 处               | 1 处 (中间件)      | 严重重复 |
| Pre-commit Hook       | **无**               | lint + test         | 缺失     |
| CI 覆盖率报告         | **无**               | 每 PR 报告         | 缺失     |
| API 契约测试           | **无**               | 全端点覆盖         | 缺失     |
| 变更日志自动化         | **手动**             | conventional-commits | 缺失  |

### 1.2 代码异味热点

| 文件                              | 问题                         | 行数  |
| --------------------------------- | ---------------------------- | ----- |
| `routes/v1/metrics.ts`            | 职责过多 (12 个路由)         | 360   |
| `dashboard/settings/page.tsx`     | 多个独立 Section 合在一个文件 | 354   |
| `dashboard/onboarding/page.tsx`   | 4 步逻辑全在一个组件         | 296   |
| `routes/v1/behaviors.ts`          | 重复项目权限检查 ×4          | 159   |
| 所有 routes                       | 重复 `findFirst + ownerId` 模式 | 25+处 |

---

## 二、质量目标

### 2.1 量化目标

| 指标                    | v0.6 现状 | v0.7 目标     | 提升幅度 |
| ----------------------- | --------- | ------------- | -------- |
| 自动测试数              | 45        | **120+**      | +167%    |
| 测试文件数              | 3         | **15+**       | +400%    |
| 前端组件测试            | 0         | **10+**       | 从无到有 |
| E2E 测试用例            | 0         | **5+**        | 从无到有 |
| 代码覆盖率（后端）      | 未度量    | **≥ 70%**     | 建立基线 |
| 最大文件行数            | 360       | **≤ 200**     | -44%     |
| 重复代码处               | 25+       | **≤ 3**       | -88%     |
| CI 构建时间              | ~30s      | **≤ 45s**     | 含覆盖率 |

### 2.2 定性目标

- **代码质量**：消除所有已知代码异味，建立可持续的质量标准
- **架构质量**：拆分巨型文件，消除路由层重复，建立中间件模式
- **功能质量**：API 契约测试覆盖全部端点，前端关键路径有 E2E
- **CI 规范**：覆盖率门禁 + 变更日志自动化 + Pre-commit Hook
- **AI Coding 规范**：建立 AI 生成代码的质量检查清单
- **变更规范**：conventional-commits 强制 + PR 模板 + 变更分类
- **质量度量**：每个 PR 报告测试覆盖率变化 + 复杂度变化

---

## 三、特性清单

### P0：测试体系建设

| #     | 特性                           | 说明                                                     | 预估 |
| ----- | ------------------------------ | -------------------------------------------------------- | ---- |
| V7-01 | **后端单元测试补全**           | AuthService + ProjectService + DecisionService + AttributionService 单元测试 | 2d   |
| V7-02 | **API 契约测试**               | 用 Hono test client 覆盖全部 25+ 端点的请求/响应契约     | 3d   |
| V7-03 | **前端组件测试**               | Vitest + Testing Library 测试核心组件 (MetricCard, Charts, Button) | 1.5d |
| V7-04 | **覆盖率度量与报告**           | Vitest coverage 配置 + CI 中输出覆盖率报告               | 0.5d |

### P1：代码重构

| #     | 特性                           | 说明                                                     | 预估 |
| ----- | ------------------------------ | -------------------------------------------------------- | ---- |
| V7-05 | **项目权限中间件**             | 抽取 `requireProject` 中间件，消除 25+ 处重复查询        | 1d   |
| V7-06 | **metrics.ts 拆分**            | 拆为 overview.ts + snapshots.ts + files.ts + export.ts    | 1d   |
| V7-07 | **前端大文件拆分**             | Settings → WeightConfig + ApiKeyManager + WebhookConfig 子组件 | 1d   |
| V7-08 | **Onboarding 步骤组件化**      | 每个 Step 独立组件，主页面仅编排                         | 0.5d |

### P2：CI/CD 与自动化

| #     | 特性                           | 说明                                                     | 预估 |
| ----- | ------------------------------ | -------------------------------------------------------- | ---- |
| V7-09 | **CI 覆盖率门禁**              | CI 中检查覆盖率不低于阈值，低于则 PR 失败                | 0.5d |
| V7-10 | **Pre-commit Hook**            | Husky + lint-staged：提交前自动 lint + 受影响文件测试    | 0.5d |
| V7-11 | **Conventional Commits 强制**  | commitlint 校验 commit message 格式                      | 0.5d |
| V7-12 | **PR 模板**                    | `.github/PULL_REQUEST_TEMPLATE.md` 标准化 PR 描述        | 0.5d |

### P3：AI Coding 质量规范

| #     | 特性                           | 说明                                                     | 预估 |
| ----- | ------------------------------ | -------------------------------------------------------- | ---- |
| V7-13 | **AI 代码质量检查清单**        | 文档定义：AI 生成代码 Review 时必须检查的 10 个要点      | 0.5d |
| V7-14 | **质量度量 Dashboard**         | 新增 /dashboard/quality 页面：覆盖率趋势、复杂度分布、测试密度 | 2d   |
| V7-15 | **变更影响分析**               | PR 提交时分析：影响了哪些模块，是否触及高风险文件        | 1.5d |

---

## 四、架构改进详情

### 4.1 消除路由层重复

**现状**（每个路由重复）：
```typescript
const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
if (!project) return c.json({ success: false, data: null, error: 'Not found' }, 404);
```

**目标**（中间件一次处理）：
```typescript
// middleware/require-project.ts
export function requireProject() {
  return async (c, next) => {
    const projectId = c.req.param('id');
    const { userId } = c.get('user');
    const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
    if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
    c.set('project', project);
    await next();
  };
}

// 路由中直接使用
metrics.get('/projects/:id/overview', requireProject(), async (c) => {
  const project = c.get('project'); // 已验证
  // ...业务逻辑
});
```

### 4.2 metrics.ts 拆分计划

```
routes/v1/metrics.ts (360 行)
  ├── routes/v1/metrics/overview.ts     — overview + recent-prs
  ├── routes/v1/metrics/snapshots.ts    — snapshots
  ├── routes/v1/metrics/files.ts        — files/top + prs + developers
  ├── routes/v1/metrics/export.ts       — export CSV/JSON
  └── routes/v1/metrics/attribution.ts  — attribution + failed-prs
```

### 4.3 前端组件拆分计划

```
dashboard/settings/page.tsx (354 行)
  ├── components/settings/weight-config.tsx
  ├── components/settings/api-key-manager.tsx
  └── components/settings/webhook-config.tsx

dashboard/onboarding/page.tsx (296 行)
  ├── components/onboarding/step-connect.tsx
  ├── components/onboarding/step-collect.tsx
  ├── components/onboarding/step-compute.tsx
  └── components/onboarding/step-report.tsx
```

---

## 五、CI/CD 规范

### 5.1 CI Pipeline 增强

```yaml
# .github/workflows/ci.yml 目标流程
jobs:
  quality:
    steps:
      - lint                    # ESLint + TypeScript 检查
      - test --coverage         # 测试 + 覆盖率
      - coverage-check          # 覆盖率 ≥ 70% 门禁
      - build                   # Next.js + Server 编译
      - commitlint              # Commit message 格式检查
```

### 5.2 Pre-commit Hook

```
提交前自动执行：
  1. lint-staged → 只检查变更文件
  2. 受影响模块的测试
  3. TypeScript 类型检查
```

### 5.3 PR 规范

```markdown
## PR 模板
### 变更类型
- [ ] feat: 新功能
- [ ] fix: 修复
- [ ] refactor: 重构
- [ ] test: 测试
- [ ] docs: 文档

### 变更描述
<!-- 简要描述 -->

### 测试
- [ ] 单元测试通过
- [ ] 影响范围已评估
- [ ] 如有 AI 生成代码，已完成 AI 质量检查清单
```

---

## 六、AI Coding 质量规范

### AI 生成代码 Review 检查清单

1. **类型安全**：是否有 `any` 或 `as` 类型断言？
2. **错误处理**：是否有未捕获的 Promise？是否使用 AppError？
3. **边界条件**：空数组、null、0、负数是否处理？
4. **重复逻辑**：是否与现有代码重复？是否应复用/抽取？
5. **命名质量**：变量/函数名是否语义清晰？
6. **测试覆盖**：新代码是否有对应测试？
7. **安全性**：是否有 SQL 注入/XSS/敏感信息泄露？
8. **性能**：是否有 N+1 查询？是否需要缓存？
9. **文件大小**：修改后文件是否超过 200 行？
10. **依赖管理**：是否引入不必要的新依赖？

---

## 七、质量度量体系

### 度量指标定义

| 指标                | 计算方式                           | 目标      |
| ------------------- | ---------------------------------- | --------- |
| 测试密度            | 测试数 / 源文件数                  | ≥ 1.0     |
| 行覆盖率            | 覆盖行 / 总行数                    | ≥ 70%     |
| 分支覆盖率          | 覆盖分支 / 总分支数                | ≥ 60%     |
| 平均文件复杂度      | 总圈复杂度 / 文件数                | ≤ 15      |
| 大文件比例          | >200 行文件数 / 总文件数           | ≤ 10%     |
| 重复代码率          | 重复代码块数 / 总代码块数          | ≤ 3%      |
| 测试通过率          | 通过测试数 / 总测试数              | 100%      |
| CI 构建成功率       | 成功构建 / 总构建                  | ≥ 95%     |

---

## 八、评分目标

| 维度           | v0.6 现状 | v0.7 目标 | 关键路径                           |
| -------------- | --------- | --------- | ---------------------------------- |
| 功能完成度     | 9.5/10    | 9.5/10    | 保持（新增 quality dashboard）     |
| **代码质量**   | 7.5/10    | **9/10**  | 测试 120+ + 覆盖率 70% + 重构     |
| **架构合理性** | 8.5/10    | **9.5/10**| 路由中间件 + 文件拆分 + 组件化    |
| 用户体验       | 9/10      | 9/10      | 保持                               |
| **安全性**     | 7/10      | **8/10**  | Pre-commit + 契约测试              |
| **性能**       | 8/10      | **8.5/10**| 覆盖率不增加构建时间               |
| 文档完备度     | 9/10      | 9/10      | 保持（AI 质量规范）                |
| 协作效率       | 9/10      | 9/10      | 保持                               |
| **综合目标**   | **8.5**   | **9.1+**  |                                    |
