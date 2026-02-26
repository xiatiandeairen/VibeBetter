# v0.16.0 Release Notes — Enhanced Health Check (Database + Redis)

Production-grade health endpoint with dependency checks.

- `/health` now checks database (Prisma `SELECT 1`) and Redis (`PING`)
- Returns `healthy` (200) when all checks pass, `degraded` (503) otherwise
- Response includes per-check status for monitoring integration
- Redis connection uses 2s timeout to avoid hanging
