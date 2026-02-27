# v5.0.0 Release Notes — CLI 重新设计：AI Coding 流程伴侣

从 237 个命令看板彻底重构为 8 个流程级命令，解决 AI Coding 的真正痛点。

## 核心命令
- `vibe context <file>` — 生成文件上下文，直接粘贴给 AI
- `vibe prompt <task>` — 生成完整 AI Coding 提示词（含约束、边界条件、质量要求）
- `vibe guard` — 提交前质量守卫（检查 any/console/空 catch/文件长度）
- `vibe rules init|list` — 管理项目编码规则 (.vibe/rules.yaml)
- `vibe flow start|step|done` — AI Coding 工作流管理（6 步流程）
- `vibe boundary <file>` — 边界条件分析（找到 AI 可能遗漏的边界）
- `vibe quality` — 当前变更质量快速检查
- `vibe init` — 连接配置

## 设计原则
1. 流程驱动，不是数据看板
2. 上下文优先，帮 AI 生成更好的代码
3. 低侵入，嵌入 git 工作流
4. 提示词生成是核心能力
