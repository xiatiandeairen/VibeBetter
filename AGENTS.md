# VibeBetter

## Cursor Cloud specific instructions

### Overview

VibeBetter (AEIP) is a pnpm monorepo with three main packages:
- `apps/web` — Next.js 14+ frontend (port 3000)
- `apps/server` — Hono + Node.js backend API (port 3001)
- `packages/shared` — shared TypeScript types, Zod schemas, constants
- `packages/db` — Prisma schema and database client

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
- When running the backend server standalone (not via `pnpm dev` from root), you must load the `.env` file manually, e.g.: `cd apps/server && env $(cat .env | xargs) npx tsx watch src/index.ts`. Turbo's `pnpm dev` from root handles env loading automatically via dotenv built into the turbo pipeline, but running `pnpm --filter @vibebetter/server dev` alone does not.
