# VibeBetter

## Cursor Cloud specific instructions

### Overview

VibeBetter (AEIP) is a pnpm monorepo with Turborepo orchestration. Key packages:

| Package | Path | Purpose |
|---------|------|---------|
| `@vibebetter/web` | `apps/web` | Next.js 15 frontend (port 3000) |
| `@vibebetter/server` | `apps/server` | Hono backend (port 3001) |
| `@vibebetter/shared` | `packages/shared` | Shared types, schemas, utils |
| `@vibebetter/db` | `packages/db` | Prisma ORM + schema |

### Commands

Standard commands are in root `package.json` and each package's `package.json`. Key ones:

- **Install deps:** `pnpm install` (from workspace root)
- **Dev (all):** `pnpm dev` (starts web + server via Turborepo)
- **Build (all):** `pnpm build`
- **Lint (all):** `pnpm lint`
- **Test (all):** `pnpm test`
- **Format:** `pnpm format` / `pnpm format:check`

Per-package: `pnpm --filter @vibebetter/web dev`, `pnpm --filter @vibebetter/web build`, etc.

### Gotchas

- The shared package (`packages/shared/src/index.ts`) must use **extensionless** imports (e.g., `./types/index` not `./types/index.js`) for Next.js webpack compatibility via `transpilePackages`.
- The web app requires `@eslint/eslintrc` for its flat ESLint config (`eslint.config.mjs`).
- The backend server requires PostgreSQL and Redis (see `docker-compose.yml`). For the frontend dev server, no external services are needed.
- Environment variables: copy `.env.example` to `.env` before running the backend.
- The web frontend uses `echarts-for-react` for charts; ECharts options use `EChartsOption` type from `echarts`.
