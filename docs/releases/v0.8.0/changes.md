# v0.8.0 全部开发变更

## 新增包
- `packages/cli/` — VibeBetter CLI 工具 (@vibebetter/cli)
  - Commander.js 命令行解析
  - picocolors 终端着色
  - simple-git 本地 Git 分析
  - 原生 fetch API 客户端（API Key 认证）
  - ~/.vibebetter/config.json 配置管理

## 8 个 CLI 命令
- `vibe init` — 初始化配置（API URL + Key + Project ID）
- `vibe status` — 连接状态 + 项目信息 + Git 分支
- `vibe check` — 核心：git diff 文件风险分析 + 行动建议 + --strict 模式
- `vibe risk` — 项目级 PSRI/TDI + 文件级复杂度/变更/风险评分
- `vibe decisions` — 决策建议列表 + --generate 生成新建议
- `vibe insights` — AI Success/Stable Rate + 工具采纳率 + 使用分布
- `vibe report` — 健康报告（markdown/text/json 三种格式）
- `vibe sync` — 触发后端采集 + 指标计算

## 测试
- 5 个 CLI 测试（配置 + 显示工具 + 命令注册）

## 基础设施
- pnpm-workspace.yaml 增加 packages/cli
