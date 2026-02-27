import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface OKREntry {
  objective: string;
  keyResults: { title: string; current: number; target: number }[];
  progress: number;
}

function trackOKRs(overview: Record<string, unknown>): OKREntry[] {
  const totalPrs = (overview.totalPrs as number) ?? 30;
  return [
    {
      objective: 'Improve code quality',
      keyResults: [
        { title: 'Reduce avg complexity', current: 12, target: 8 },
        { title: 'Increase test coverage', current: 72, target: 90 },
        { title: 'Zero critical hotspots', current: 2, target: 0 },
      ],
      progress: 55,
    },
    {
      objective: 'Accelerate delivery',
      keyResults: [
        { title: 'PRs merged/week', current: totalPrs, target: 50 },
        { title: 'Avg review time < 4h', current: 6, target: 4 },
        { title: 'Deploy frequency', current: 3, target: 5 },
      ],
      progress: 60,
    },
    {
      objective: 'Increase AI adoption',
      keyResults: [
        { title: 'AI-assisted PR ratio', current: 40, target: 70 },
        { title: 'AI success rate', current: 85, target: 95 },
        { title: 'Tools adopted', current: 3, target: 5 },
      ],
      progress: 50,
    },
  ];
}

export const okrTrackerCommand = new Command('okr-tracker')
  .description('Track engineering OKRs')
  .option('--json', 'Output as JSON')
  .option('--quarter <q>', 'Quarter to display', 'Q1')
  .action(async (opts) => {
    header('OKR Tracker');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const okrs = trackOKRs(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ quarter: opts.quarter, okrs }, null, 2));
      return;
    }

    console.log();
    console.log(`  Quarter: ${pc.bold(opts.quarter)}`);
    for (const okr of okrs) {
      console.log();
      const color = okr.progress >= 70 ? pc.green : okr.progress >= 40 ? pc.yellow : pc.red;
      const bar = color('█'.repeat(Math.round(okr.progress / 5))) + pc.dim('░'.repeat(20 - Math.round(okr.progress / 5)));
      console.log(`  ${pc.bold(okr.objective)}  ${bar} ${color(`${okr.progress}%`)}`);
      for (const kr of okr.keyResults) {
        const krPct = Math.min(100, Math.round((kr.current / Math.max(kr.target, 1)) * 100));
        console.log(`    ${pc.dim('•')} ${kr.title.padEnd(28)} ${kr.current}/${kr.target} ${pc.dim(`(${krPct}%)`)}`);
      }
    }

    const avgProgress = Math.round(okrs.reduce((s, o) => s + o.progress, 0) / okrs.length);
    console.log();
    metric('Overall progress', `${avgProgress}%`);
    success('OKR tracking complete.');
  });
