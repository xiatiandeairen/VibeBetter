import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { header, info } from '../utils/display.js';

interface VercelConfig {
  version: number;
  name: string;
  builds: { src: string; use: string }[];
  routes: { src: string; dest: string }[];
  env: Record<string, string>;
  regions: string[];
}

function generateVercelConfig(projectId: string, framework: string, region: string): VercelConfig {
  const config: VercelConfig = {
    version: 2,
    name: `vibebetter-${projectId}`,
    builds: [],
    routes: [],
    env: {
      NODE_ENV: 'production',
      VIBEBETTER_PROJECT_ID: projectId,
    },
    regions: [region],
  };

  if (framework === 'next') {
    config.builds.push({ src: 'apps/web/package.json', use: '@vercel/next' });
    config.routes.push({ src: '/api/(.*)', dest: 'apps/server/$1' });
  } else {
    config.builds.push({ src: 'apps/web/package.json', use: '@vercel/static-build' });
    config.builds.push({ src: 'apps/server/package.json', use: '@vercel/node' });
    config.routes.push({ src: '/api/(.*)', dest: 'apps/server/src/index.ts' });
  }

  config.routes.push({ src: '/(.*)', dest: 'apps/web/$1' });

  return config;
}

export const vercelCommand = new Command('vercel')
  .description('Generate Vercel deployment configuration')
  .option('--framework <type>', 'Framework type (next, static)', 'next')
  .option('--region <region>', 'Deployment region', 'iad1')
  .option('--output <file>', 'Write to file instead of stdout', 'vercel.json')
  .action(async (opts) => {
    header('Vercel Deployment Config');

    const config = requireConfig();
    const projectId = config.projectId ?? 'default';

    const vercelConfig = generateVercelConfig(projectId, opts.framework, opts.region);
    const json = JSON.stringify(vercelConfig, null, 2);

    if (opts.output) {
      const fs = await import('node:fs');
      fs.writeFileSync(opts.output, json, 'utf-8');
      info(`Written to ${pc.bold(opts.output)}`);
    } else {
      console.log(json);
    }

    console.log();
    info(`Framework: ${pc.bold(opts.framework)}`);
    info(`Region: ${pc.bold(opts.region)}`);
    info('Deploy with: vercel --prod');
  });
