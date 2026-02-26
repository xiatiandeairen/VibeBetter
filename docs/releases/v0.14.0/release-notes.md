# v0.14.0 Release Notes — Admin Usage Analytics Endpoint

Platform usage metrics for business intelligence.

- `GET /api/v1/admin/stats` — Admin-only usage analytics endpoint
- Returns: users (total + 7d active), projects (total + active), PRs (total + AI), collections (completed + failed)
- Role-based access: requires `admin` role
- Parallel Prisma queries for performance
