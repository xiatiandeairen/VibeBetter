# VibeBetter 文档中心

## 目录结构

```
docs/
├── README.md                      ← 本文件：文档导航
│
├── product/                       # 产品定义（稳定文档）
│   ├── spec.md                    # 产品规格说明书
│   └── research.md                # 技术选型调研
│
├── releases/                      # 版本归档（每版本编号）
│   ├── CHANGELOG.md               # 合并变更日志
│   ├── v0.1.0/
│   │   ├── release-notes.md       # 发布亮点
│   │   ├── changes.md             # 全部开发变更记录
│   │   ├── tasks.md               # AI Coding 任务完成情况
│   │   └── insights.md            # 开发 insight 数据
│   ├── v0.2.0/ ...
│   ├── v0.3.0/ ...
│   └── v0.4.0/ ...
│
├── roadmap/                       # 版本规划
│   ├── current.md                 # 当前版本规划 (v0.5)
│   └── archive/                   # 历史版本规划
│       └── v0.4.md
│
├── process/                       # 开发流程
│   ├── self-driving.md            # 自驱动流程定义
│   ├── scoring.md                 # 多维度评分标准
│   └── templates/                 # 模板
│       ├── task.md
│       └── feedback.md
│
└── screenshots/                   # 截图资源
```

## 文档编号规则

- 版本归档：`docs/releases/vX.Y.Z/` 目录下固定 4 个文件
- 路线图：`docs/roadmap/current.md` 始终指向下一版本
- 问题跟踪：使用 GitHub Issues + Labels（不在 docs 中维护）

## GitHub Issues 标签约定

| 标签            | 用途           |
| --------------- | -------------- |
| `bug`           | Bug 报告       |
| `feature`       | 功能需求       |
| `decision`      | 待决策事项     |
| `risk`          | 风险项         |
| `tech-debt`     | 技术债         |
| `v0.5`          | 版本标记       |
