import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';

interface DemoProject {
  name: string;
  aiSuccessRate: number;
  aiStableRate: number;
  psri: number;
  coverage: number;
  hotspots: number;
  tdi: number;
}

const SAMPLE_PROJECTS: DemoProject[] = [
  { name: 'frontend-app', aiSuccessRate: 82, aiStableRate: 90, psri: 35, coverage: 78, hotspots: 3, tdi: 12 },
  { name: 'api-service', aiSuccessRate: 75, aiStableRate: 88, psri: 42, coverage: 65, hotspots: 5, tdi: 18 },
  { name: 'data-pipeline', aiSuccessRate: 68, aiStableRate: 72, psri: 58, coverage: 45, hotspots: 8, tdi: 31 },
];

function printDashboard(projects: DemoProject[]): void {
  console.log();
  console.log(`  ${pc.bold('┌──────────────────────────────────────────────────────────────────────┐')}`);
  console.log(`  ${pc.bold('│')}  ${pc.cyan(pc.bold('VibeBetter Demo Dashboard'))}                                          ${pc.bold('│')}`);
  console.log(`  ${pc.bold('├──────────────────────────────────────────────────────────────────────┤')}`);

  console.log(`  ${pc.bold('│')}  ${'Project'.padEnd(18)} ${'AI Succ'.padEnd(10)} ${'Stable'.padEnd(10)} ${'PSRI'.padEnd(8)} ${'Cover'.padEnd(8)} ${'TDI'.padEnd(6)} ${pc.bold('│')}`);
  console.log(`  ${pc.bold('│')}  ${'─'.repeat(18)} ${'─'.repeat(10)} ${'─'.repeat(10)} ${'─'.repeat(8)} ${'─'.repeat(8)} ${'─'.repeat(6)} ${pc.bold('│')}`);

  for (const p of projects) {
    const sr = p.aiSuccessRate >= 80 ? pc.green(`${p.aiSuccessRate}%`) : pc.yellow(`${p.aiSuccessRate}%`);
    const st = p.aiStableRate >= 85 ? pc.green(`${p.aiStableRate}%`) : pc.yellow(`${p.aiStableRate}%`);
    const psri = p.psri <= 40 ? pc.green(String(p.psri)) : pc.red(String(p.psri));
    const cov = p.coverage >= 70 ? pc.green(`${p.coverage}%`) : pc.yellow(`${p.coverage}%`);
    const tdi = p.tdi <= 15 ? pc.green(String(p.tdi)) : pc.red(String(p.tdi));

    console.log(`  ${pc.bold('│')}  ${p.name.padEnd(18)} ${String(sr).padEnd(10 + 10)} ${String(st).padEnd(10 + 10)} ${String(psri).padEnd(8 + 10)} ${String(cov).padEnd(8 + 10)} ${String(tdi).padEnd(6 + 10)} ${pc.bold('│')}`);
  }

  console.log(`  ${pc.bold('└──────────────────────────────────────────────────────────────────────┘')}`);
}

function printHotspots(): void {
  console.log();
  console.log(`  ${pc.bold(pc.cyan('Top Hotspots (sample data):'))}`);
  const hotspots = [
    { file: 'src/utils/parser.ts', complexity: 85, changes: 42 },
    { file: 'src/core/engine.ts', complexity: 72, changes: 38 },
    { file: 'src/api/handler.ts', complexity: 68, changes: 55 },
  ];
  for (const h of hotspots) {
    const risk = h.complexity > 70 ? pc.red('HIGH') : pc.yellow('MED');
    console.log(`  ${risk}  ${h.file.padEnd(30)} complexity=${h.complexity}  changes=${h.changes}`);
  }
}

export const demoCommand = new Command('demo')
  .description('Run a demo with sample data to showcase VibeBetter features')
  .option('--minimal', 'Show minimal demo output')
  .action(async (opts) => {
    header('VibeBetter Demo');

    console.log(pc.dim('  Using sample data — no real project data is modified.'));

    printDashboard(SAMPLE_PROJECTS);

    if (!opts.minimal) {
      printHotspots();

      console.log();
      console.log(`  ${pc.bold(pc.cyan('AI Effectiveness Score:'))} ${pc.bold('74')} / 100  ${pc.yellow('B')}`);
      console.log(`  ${pc.dim('Components: Success=30% · Stability=25% · Risk=20% · Coverage=15% · Defect=10%')}`);
    }

    console.log();
    info('This is sample data. Run `vibe init` to set up your real project.');
    info('Use `vibe walkthrough` for a guided tour of all commands.');
  });
