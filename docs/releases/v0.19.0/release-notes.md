# v0.19.0 Release Notes — Metric Alert Configuration API

Threshold-based alerts per project per metric.

- `AlertConfig` Prisma model — project-scoped metric alert definitions
- `GET /api/v1/alerts/projects/:id/alerts` — List alert configs
- `POST /api/v1/alerts/projects/:id/alerts` — Create alert config (metric, operator, threshold, channel)
- `DELETE /api/v1/alerts/projects/:id/alerts/:alertId` — Remove alert config
- Default channel: `in_app`; extensible for email/slack/webhook
