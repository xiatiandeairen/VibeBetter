# VibeBetter CLI 重新设计 — AI Coding 流程伴侣

## 问题诊断

当前 CLI 有 237 个命令，但本质上只是 Web Dashboard 的终端镜像。开发者不会在写代码时运行 `vibe team-velocity` 或 `vibe burndown`。

**真正的 AI Coding 痛点：**

| 痛点                | 表现                                                | 频率       |
| ------------------- | --------------------------------------------------- | ---------- |
| 上下文缺失          | AI 不知道项目约定、相关文件、历史变更，生成的代码不贴合 | 每次 AI 交互 |
| 边界条件遗漏        | AI 生成的代码缺少 null 检查、错误处理、并发保护      | 高频       |
| 约束不够            | AI 不遵守项目命名规范、架构分层、依赖方向            | 高频       |
| 流程不规范          | 没有统一的 AI Coding 步骤：分析→设计→实现→验证      | 每个任务   |
| 质量不可见          | 写完后不知道 AI 代码质量如何，只能靠 Review 后发现   | 每次提交   |

## 新设计原则

1. **流程驱动**：不是看数据，而是推进工作流
2. **上下文优先**：每个命令都围绕「给 AI 提供正确上下文」
3. **低侵入**：嵌入 git 流程，不改变开发习惯
4. **提示词生成**：核心能力是生成高质量 AI Coding 提示词

## 核心命令（仅 8 个）

### `vibe context <file>` — 生成文件上下文

AI Coding 时最大的问题是「AI 不知道项目背景」。这个命令输出文件的完整上下文，直接粘贴到 AI 对话中。

```
$ vibe context src/services/metrics.ts

📋 Context for: src/services/metrics.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## File Profile
- Complexity: 22 (HIGH — 前 10% 的复杂文件)
- Changes: 18 times in 90 days (热点文件)
- Authors: 2
- AI Code Ratio: 17%
- Risk: HIGH (complexity × frequency = 396)

## Dependencies (imports this file)
- @vibebetter/db (Prisma client)
- @vibebetter/shared (safeDiv, PSRI_DEFAULT_WEIGHTS, HOTSPOT_THRESHOLDS)

## Dependents (who imports this file)
- routes/v1/metrics/overview.ts
- routes/v1/metrics/files.ts
- services/decision.service.ts

## Recent Changes (last 5 commits)
- 2026-02-26: refactor: split computeAndSaveSnapshot
- 2026-02-26: feat: add TDI calculation
- 2026-02-25: feat: add PSRI 6 dimensions
- ...

## Project Rules (from .vibe/rules.yaml)
- Max file length: 200 lines (CURRENT: 220 ⚠️)
- Max complexity: 15 (CURRENT: 22 ⚠️)
- Must use AppError for error handling
- Must have unit tests

## Boundary Conditions to Watch
- Empty array: what if no files/PRs exist?
- Division by zero: safeDiv already handles, but check new formulas
- Null metrics: snapshot may have null values
```

→ 这段输出可以直接粘贴给 AI 作为上下文。

### `vibe prompt <task>` — 生成 AI Coding 提示词

基于项目上下文自动生成高质量提示词。

```
$ vibe prompt "add error handling to metrics service"

📝 Generated Prompt (copy to AI):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Task
Add comprehensive error handling to the MetricsService in `src/services/metrics.ts`.

## Project Context
- TypeScript strict mode project with Hono backend
- Uses AppError class (not throw strings) — see `middleware/error-handler.ts`
- Error format: `throw new AppError(statusCode, errorCode, message)`
- Uses Prisma ORM — wrap Prisma errors in AppError

## Current File State
- 220 lines, complexity 22 (already high — don't increase)
- 5 public methods: computeAiSuccessRate, computeAiStableRate, computePsri, computeTdi, computeAndSaveSnapshot
- Each method queries DB but has no try/catch

## Constraints
- Keep file under 200 lines (refactor if needed)
- Use existing AppError pattern from middleware/error-handler.ts
- Don't add new dependencies
- Maintain existing test compatibility (21 tests reference this service)

## Boundary Conditions to Handle
- Empty project (0 PRs, 0 files) — return null, not throw
- Database connection failure — wrap in AppError with 503
- Invalid projectId — throw AppError 404

## Expected Output
- Each public method wrapped in try/catch
- Consistent error code naming: METRICS_COMPUTE_ERROR, etc.
- Unit tests for error paths
```

### `vibe guard` — 提交前质量守卫

不是简单的 lint，而是检查 AI 生成代码是否符合项目约束。

```
$ vibe guard

🛡️ Quality Guard
━━━━━━━━━━━━━━━━━━━━━━
Checking staged files...

src/services/metrics.ts:
  ✓ File length: 195 lines (< 200 limit)
  ✗ Complexity: 22 (> 15 limit) — 建议拆分
  ✓ No `any` types
  ✓ Uses AppError pattern
  ✗ Missing boundary check: computePsri has no empty-array guard
  ✓ Has corresponding test file

src/routes/v1/auth.ts:
  ✓ All checks passed

Summary: 1 file passed, 1 file has 2 issues
Action: Fix complexity and boundary check before committing
```

### `vibe rules` — 管理项目约束规则

```
$ vibe rules init     # 生成 .vibe/rules.yaml
$ vibe rules list     # 查看当前规则
$ vibe rules check    # 检查全部文件是否符合规则
```

规则文件 `.vibe/rules.yaml`:
```yaml
file:
  max_lines: 200
  max_complexity: 15
  naming: kebab-case

code:
  no_any: true
  error_handling: AppError
  require_tests: true

architecture:
  layers: [routes, services, collectors, utils]
  direction: top-down  # routes → services → collectors, not reverse
```

### `vibe flow` — AI Coding 工作流管理

```
$ vibe flow start "implement user preferences API"
  → 创建 .vibe/current-task.json
  → 分析影响范围
  → 输出建议的实现步骤

$ vibe flow step
  → 显示当前步骤 + 该步骤的 AI prompt
  → 步骤完成后自动进入下一步

$ vibe flow quality
  → 检查当前进度的代码质量

$ vibe flow done
  → 最终质量检查
  → 生成 commit message
  → 记录本次 AI Coding session 的 insight
```

### `vibe boundary <file>` — 边界条件分析

```
$ vibe boundary src/services/metrics.ts

🔍 Boundary Analysis: metrics.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Function: computeAiSuccessRate(projectId)
  ⚠ Empty result: aiPrs could be empty array → returns null (OK)
  ⚠ Invalid projectId: no validation → should check

Function: computePsri(projectId)
  ⚠ Division by zero: files.length could be 0
  ⚠ Max values hardcoded: maxComplexity=100, maxChangeFreq=50
  ✓ Weight sum: uses shared constants

Function: computeTdi(projectId)
  ⚠ Empty files: would cause 0/0 in ratios
  ⚠ lowCoverageRatio hardcoded to 0.5
```

### `vibe learn <file>` — 从历史学习模式

```
$ vibe learn src/services/metrics.ts

📚 Learned Patterns: metrics.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Coding Patterns:
  - All methods are async and return Promise
  - Uses Prisma findMany with select for optimization
  - Constants imported from @vibebetter/shared
  - Risk scores computed as multiplication (complexity × frequency)

Change Patterns:
  - Most changes add new compute methods
  - Refactors tend to extract sub-calculations
  - Tests updated in same commit

Common Issues (from git history):
  - PR #4: major revision — missed null handling
  - PR #8: rollback — performance issue with large datasets
```

### `vibe quality` — 当前变更快速质量检查

```
$ vibe quality

📊 Quality Check (staged changes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files changed: 3
New lines: 47, Deleted: 12

Code Quality:
  ✓ No any types introduced
  ✓ All new functions have return types
  ✗ 1 function lacks error handling
  ✓ No console.log statements

AI Code Impact:
  → 2 files in AI-heavy areas (>30% AI code)
  → Avg complexity of changed files: 15 (moderate)
  → Suggestion: add boundary tests for new logic
```
