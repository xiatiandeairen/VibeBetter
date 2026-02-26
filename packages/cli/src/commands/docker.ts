import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { header, info, success } from '../utils/display.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DOCKERFILE = `FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["node", "dist/index.js"]
`;

const COMPOSE_FILE = `version: "3.9"

services:
  vibebetter-server:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/vibebetter
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: vibebetter
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
`;

const DOCKERIGNORE = `node_modules
.git
.env
*.md
dist
coverage
.turbo
`;

export const dockerCommand = new Command('docker')
  .description('Generate Docker setup for VibeBetter server')
  .option('--stdout', 'Print files to stdout')
  .option('--dir <path>', 'Output directory', '.')
  .action(async (opts) => {
    header('Docker Generator');
    requireConfig();

    const files: Array<{ name: string; content: string }> = [
      { name: 'Dockerfile.vibebetter', content: DOCKERFILE },
      { name: 'docker-compose.vibebetter.yml', content: COMPOSE_FILE },
      { name: '.dockerignore', content: DOCKERIGNORE },
    ];

    if (opts.stdout) {
      for (const f of files) {
        console.log(pc.bold(`--- ${f.name} ---`));
        console.log(f.content);
      }
      return;
    }

    const dir = path.resolve(process.cwd(), opts.dir);
    let written = 0;
    for (const f of files) {
      const filePath = path.join(dir, f.name);
      if (fs.existsSync(filePath)) {
        info(`Skipping ${f.name} (already exists)`);
      } else {
        fs.writeFileSync(filePath, f.content, 'utf-8');
        success(`Wrote ${f.name}`);
        written++;
      }
    }

    console.log();
    if (written > 0) {
      info('Start with: docker compose -f docker-compose.vibebetter.yml up --build');
    }
    console.log();
  });
