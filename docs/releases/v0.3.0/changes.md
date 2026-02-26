# v0.3.0 全部开发变更

## 前端新增
- Settings 页面 (/dashboard/settings) — 6 个 PSRI 权重滑块
- PSRI 雷达图组件 (RadarChart)
- Toast 通知系统 (ToastProvider + useToast)
- 骨架屏组件 (Skeleton, MetricCardSkeleton, ChartSkeleton, TableSkeleton)
- Dashboard: Recent Pull Requests 迷你表格
- Dashboard: Refresh Metrics 按钮
- AI Insights: 效果度量进度条 (采纳率 + 编辑距离)
- Risk Trends: AI% 列 (文件 AI 代码占比)
- 404 页面 (not-found.tsx)
- 全局错误边界 (error.tsx)
- 移动端侧边栏关闭按钮

## 后端新增
- GET /metrics/projects/:id/recent-prs 端点
- 决策引擎 6 条新规则 (AI >80% 正向反馈, AI >90%, 热点 3-10/10+, AI 采纳 >70%, PSRI change >0.4)

## 前端改进
- Dashboard 空状态增加图标和 CTA 引导
- 图表组件包装 React.memo + useMemo
- README 更新 (功能列表 + API 端点 + 路由表)

## Bug 修复
- TDI 显示 N/A (添加 tdiScore 到 MetricSnapshotItem 类型)

## 工程
- 种子脚本自动化 (scripts/seed-demo.sh)
