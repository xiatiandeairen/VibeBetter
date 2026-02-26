# v0.29.0 Release Notes — Per-Project PR Stats (Commercial)

Admin endpoint returning per-project pull request counts.

- `GET /api/v1/admin/projects/stats` returns project-level PR counts
- Sorted alphabetically by project name
- Includes total project count in response
- Admin-only access with role check
