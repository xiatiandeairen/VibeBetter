import { Command } from 'commander';
import pc from 'picocolors';
import { loadConfig } from '../config.js';
import { header, info } from '../utils/display.js';

interface DashboardPage {
  name: string;
  path: string;
  description: string;
}

const PAGES: DashboardPage[] = [
  { name: 'overview', path: '/', description: 'Main dashboard overview' },
  { name: 'metrics', path: '/metrics', description: 'Detailed metrics view' },
  { name: 'risks', path: '/risks', description: 'Risk analysis dashboard' },
  { name: 'decisions', path: '/decisions', description: 'Decision items list' },
  { name: 'insights', path: '/insights', description: 'AI-generated insights' },
  { name: 'hotspots', path: '/hotspots', description: 'Code hotspot visualization' },
  { name: 'trends', path: '/trends', description: 'Metric trends over time' },
  { name: 'settings', path: '/settings', description: 'Project settings' },
  { name: 'compare', path: '/compare', description: 'Project comparison view' },
  { name: 'ai-compare', path: '/ai-compare', description: 'AI vs Human code comparison' },
  { name: 'changelog', path: '/changelog', description: 'Release changelog' },
  { name: 'goals', path: '/goals', description: 'Metric goals tracking' },
];

export const dashboardUrlCommand = new Command('dashboard-url')
  .description('Output direct URL to a specific dashboard page')
  .argument('[page]', 'Page name (overview, metrics, risks, etc.)')
  .option('--base-url <url>', 'Dashboard base URL', 'http://localhost:3000')
  .option('--list', 'List all available pages')
  .action(async (page: string | undefined, opts) => {
    header('Dashboard URL');

    const config = loadConfig();
    const projectId = config?.projectId ?? 'default';

    if (opts.list) {
      console.log(pc.bold('  Available pages:\n'));
      for (const p of PAGES) {
        console.log(`    ${pc.cyan(p.name.padEnd(14))} ${pc.dim(p.path.padEnd(16))} ${p.description}`);
      }
      console.log();
      info('Usage: vibe dashboard-url <page>');
      return;
    }

    if (!page) {
      page = 'overview';
    }

    const found = PAGES.find((p) => p.name === page);
    if (!found) {
      console.log(pc.red(`  Unknown page: ${page}`));
      console.log(pc.dim(`  Available: ${PAGES.map((p) => p.name).join(', ')}`));
      return;
    }

    const url = `${opts.baseUrl}${found.path}?project=${projectId}`;
    console.log();
    console.log(`  ${pc.bold(found.description)}`);
    console.log(`  ${pc.cyan(url)}`);
    console.log();
    info('Open in browser or use: vibe studio --page ' + found.path);
  });
