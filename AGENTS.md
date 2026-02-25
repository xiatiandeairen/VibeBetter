# VibeBetter

## Cursor Cloud specific instructions

This is a **pnpm turborepo monorepo** for the VibeBetter (AEIP) platform.

### Architecture

| Package | Description | Dev command |
|---|---|---|
| `@vibebetter/shared` | Shared types, schemas, constants, utils | `pnpm --filter @vibebetter/shared lint` |
| `@vibebetter/db` | Prisma ORM + schema | `pnpm --filter @vibebetter/db db:generate` |
| `@vibebetter/server` | Hono + Node.js backend API | `pnpm --filter @vibebetter/server dev` |
| `@vibebetter/web` | Next.js frontend | `pnpm --filter @vibebetter/web dev` |

### Services required

- **PostgreSQL** (port 5432) and **Redis** (port 6379) via `docker compose up -d` in the workspace root.
- The server requires `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET` environment variables. Copy `.env.example` to `.env` and adjust if needed.
- Prisma client must be generated before the server can start: `pnpm --filter @vibebetter/db db:generate`.
- To push schema to DB: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vibebetter pnpm --filter @vibebetter/db db:push` (the db package does not read `.env` from root automatically; pass the env var explicitly or run from a shell where it's exported).

### Key commands

See `package.json` scripts. Quick reference:
- **Lint (server):** `pnpm --filter @vibebetter/server lint` (runs `tsc --noEmit`)
- **Test (server):** `pnpm --filter @vibebetter/server test` (runs `vitest run`)
- **Build (server):** `pnpm --filter @vibebetter/server build` (runs `tsc`)
- **Dev (server):** `pnpm --filter @vibebetter/server dev` (runs `tsx watch src/index.ts` on port 3001)
- **Format:** `pnpm format` / `pnpm format:check`

### Gotchas

- The `@vibebetter/db` package has a pre-existing `tsc` error (missing `@types/node`). Its `lint` and `build` scripts fail, but the Prisma client generation and `db:push` work fine.
- `pnpm install` requires `pnpm.onlyBuiltDependencies` in root `package.json` to avoid interactive `pnpm approve-builds` prompts. This is already configured.
- Docker must be installed and running for Postgres/Redis. In Cursor Cloud VMs, use `fuse-overlayfs` storage driver and `iptables-legacy` (see Docker-in-Docker setup in environment docs).
- The server needs env vars set in the shell (or `.env` file in the workspace root). The `env.ts` config validates them at startup with Zod.
