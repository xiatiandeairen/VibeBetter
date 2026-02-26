import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface ModuleInfo {
  name: string;
  path: string;
  files: number;
  riskScore: number;
  hotspots: number;
  avgComplexity: number;
}

function riskBar(score: number): string {
  const filled = Math.round(score * 10);
  const empty = 10 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  if (score >= 0.7) return pc.red(bar);
  if (score >= 0.4) return pc.yellow(bar);
  return pc.green(bar);
}

function riskLabel(score: number): string {
  if (score >= 0.7) return pc.red('HIGH');
  if (score >= 0.4) return pc.yellow('MED');
  return pc.green('LOW');
}

export const modulesCommand = new Command('modules')
  .description('List project modules with per-module risk scores')
  .option('--sort <field>', 'Sort by: risk, files, hotspots, name', 'risk')
  .option('--json', 'Output as JSON')
  .option('--limit <n>', 'Max modules to show', '20')
  .action(async (opts) => {
    header('Project Modules');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const topFiles = await client.getTopFiles(100).catch(() => null);
    const fileList = topFiles ?? [];

    const moduleMap = new Map<string, { files: number; totalRisk: number; hotspots: number; totalComplexity: number }>();
    for (const f of fileList) {
      const parts = f.filePath.split('/');
      const moduleName = parts.length > 1 ? parts.slice(0, 2).join('/') : parts[0] || 'root';
      const entry = moduleMap.get(moduleName) ?? { files: 0, totalRisk: 0, hotspots: 0, totalComplexity: 0 };
      entry.files++;
      entry.totalRisk += f.riskScore;
      entry.totalComplexity += f.cyclomaticComplexity;
      if (f.riskScore > 0.6) entry.hotspots++;
      moduleMap.set(moduleName, entry);
    }

    let modules: ModuleInfo[] = [...moduleMap.entries()].map(([name, data]) => ({
      name,
      path: name,
      files: data.files,
      riskScore: data.files > 0 ? data.totalRisk / data.files : 0,
      hotspots: data.hotspots,
      avgComplexity: data.files > 0 ? Math.round(data.totalComplexity / data.files * 10) / 10 : 0,
    }));

    const sortField = opts.sort as string;
    modules.sort((a, b) => {
      if (sortField === 'name') return a.name.localeCompare(b.name);
      if (sortField === 'files') return b.files - a.files;
      if (sortField === 'hotspots') return b.hotspots - a.hotspots;
      return b.riskScore - a.riskScore;
    });

    modules = modules.slice(0, parseInt(opts.limit, 10));

    if (opts.json) {
      console.log(JSON.stringify(modules, null, 2));
      return;
    }

    console.log(pc.bold(`  ${modules.length} modules found\n`));

    for (const mod of modules) {
      console.log(`  ${riskBar(mod.riskScore)} ${riskLabel(mod.riskScore)} ${pc.bold(mod.name)}`);
      console.log(`    ${pc.dim('Files:')} ${mod.files}  ${pc.dim('Hotspots:')} ${mod.hotspots}  ${pc.dim('Avg complexity:')} ${mod.avgComplexity.toFixed(1)}`);
      console.log();
    }
  });
