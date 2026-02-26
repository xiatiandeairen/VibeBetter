# VibeBetter

## Cursor Cloud specific instructions

### Overview

VibeBetter (AEIP) is a pnpm monorepo with these packages:
- `apps/web` — Next.js 14+ frontend (port 3000)
- `apps/server` — Hono + Node.js backend API (port 3001)
- `packages/shared` — shared TypeScript types, Zod schemas, constants
- `packages/db` — Prisma schema and database client
- `packages/cli` — CLI tool (`vibe` command) for terminal-based AI coding insights; standalone TypeScript package, no Docker/DB needed; lint with `pnpm --filter @vibebetter/cli lint`, test with `pnpm --filter @vibebetter/cli test`

### Prerequisites

Docker must be running to provide PostgreSQL and Redis.

```bash
sudo dockerd &>/dev/null &
sleep 3
sudo chmod 666 /var/run/docker.sock
docker compose up -d
```

### Environment

Copy `.env.example` to `.env` and to `apps/server/.env` and `apps/web/.env.local`:

```bash
cp .env.example .env
cp .env apps/server/.env
cp .env apps/web/.env.local
```

### Database

```bash
cd packages/db
npx prisma generate
npx prisma db push
npx tsx seed/index.ts
```

Demo credentials: `demo@vibebetter.dev` / `password123`

### Running

See `package.json` root scripts. Key commands:
- `pnpm dev` — starts both frontend and backend via Turborepo
- `pnpm lint` — lint all packages
- `pnpm test` — run all tests
- `pnpm build` — build all packages
- `pnpm format` — format all files with Prettier

Individual packages:
- `pnpm --filter @vibebetter/server dev` — backend only (port 3001)
- `pnpm --filter @vibebetter/web dev` — frontend only (port 3000)
- `pnpm --filter @vibebetter/server test` — backend tests (Vitest)

### Gotchas

- The `.env` file must also be copied to `packages/db/.env` for Prisma CLI commands to work.
- When using `prisma migrate reset` or `prisma db push --force-reset` in Cursor, the `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` env var is required.
- The frontend API client paths must match the backend's route mounting structure: metrics are at `/api/v1/metrics/projects/:id/...`, collectors at `/api/v1/collectors/projects/:id/...`, weights at `/api/v1/weights/projects/:id/...`, decisions at `/api/v1/decisions/projects/:id/...`, and behaviors at `/api/v1/behaviors/projects/:id/...`.
- Prisma `Json` fields do not accept `Record<string, unknown>` directly; use `JSON.parse(JSON.stringify(...))` to satisfy the type constraint.
- Docker in this VM requires `fuse-overlayfs` storage driver and `iptables-legacy`. See the Docker setup section above.
- Docker startup: `containerd` must be started **before** `dockerd`. Run `sudo containerd &>/tmp/containerd.log &` then `sleep 3` then `sudo dockerd &>/tmp/dockerd.log &` — otherwise dockerd fails with "timeout waiting for containerd to start".
- If Next.js dev server fails with `EADDRINUSE`, check for stale processes: `netstat -tlnp | grep 3000` and kill the specific PID. Old Next.js processes can survive across sessions.
- The backend server requires env vars at runtime. Turbo's `pnpm dev` from root does **not** automatically load `apps/server/.env`; the server will crash with "Environment validation failed" if DATABASE_URL/REDIS_URL/JWT_SECRET are not in the shell environment. To run the backend: `cd apps/server && env $(cat .env | xargs) npx tsx watch src/index.ts`. The frontend (`apps/web`) picks up `.env.local` automatically via Next.js.
- v0.5.0 added new API routes under metrics: `/api/v1/metrics/projects/:id/attribution`, `/api/v1/metrics/projects/:id/failed-prs`, `/api/v1/metrics/projects/:id/developers`. New frontend pages: `/dashboard/attribution`, `/dashboard/developers`, `/dashboard/org`. Industry benchmarks are in `packages/shared/src/constants/benchmarks.ts`.
- v0.6.0 added: Onboarding wizard (`/dashboard/onboarding`), Report page (`/dashboard/report`), OpenAPI docs (`/api/v1/docs`), API key auth (model `ApiKey`, `X-API-Key` header, routes at `/api/v1/auth/api-keys`), Webhook config UI on Settings page. After modifying the Prisma schema, always run `npx prisma generate` in `packages/db` before linting/building — the server TypeScript will fail without an up-to-date Prisma client.
- Hono sub-router routes get picked up only after a full server restart — `tsx watch` does not always detect new route file additions.
- v0.7.0 added: `requireProject()` middleware (`apps/server/src/middleware/require-project.ts`) replaces repeated ownership checks in route handlers. `metrics.ts` is now an aggregator mounting sub-routers from `metrics/overview.ts`, `metrics/files.ts`, and `metrics/export.ts`. Frontend tests use `@testing-library/react` + jsdom (see `apps/web/vitest.config.ts`); always call `cleanup` in `afterEach` to avoid cross-test DOM pollution. Test coverage scripts available via `pnpm test:coverage` in server/web/shared.
- v0.9.0–v0.14.0 added: `vibe analyze` (offline local git analysis), `/dashboard/teams` page (team comparison), `DigestService` + `GET /projects/:id/digest` + `vibe digest`, CLI retry logic with exponential backoff, `ErrorBoundary` component (`apps/web/src/lib/error-boundary.tsx`), `vibe fix` (actionable suggestions), `GET /api/v1/admin/stats` admin route (`apps/server/src/routes/v1/admin.ts`). CLI now has 11 commands. Prisma `CollectionJob.status` enum values are UPPERCASE (e.g. `'COMPLETED'`, `'FAILED'`).
