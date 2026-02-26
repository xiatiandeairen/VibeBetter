import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info, riskBadge } from '../utils/display.js';

function clearScreen(): void {
  process.stdout.write('\x1b[2J\x1b[H');
}

function renderTable(
  files: Array<{
    filePath: string;
    riskScore: number;
    cyclomaticComplexity: number;
    changeFrequency90d: number;
    linesOfCode: number;
    aiCodeRatio: number | null;
  }>,
  iteration: number,
): void {
  clearScreen();
  console.log(pc.bold(pc.cyan(`📊 VibeBetter — Top Files by Risk`)));
  console.log(pc.dim(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
  console.log(pc.dim(`  Refresh #${iteration} | ${new Date().toLocaleTimeString()} | Press Ctrl+C to exit\n`));

  console.log(`  ${'#'.padStart(3)} ${'Risk'.padStart(6)} ${'CC'.padStart(5)} ${'Chg'.padStart(5)} ${'LOC'.padStart(6)} ${'AI%'.padStart(5)} File`);
  console.log(pc.dim(`  ${'─'.repeat(3)} ${'─'.repeat(6)} ${'─'.repeat(5)} ${'─'.repeat(5)} ${'─'.repeat(6)} ${'─'.repeat(5)} ${'─'.repeat(35)}`));

  files.forEach((f, i) => {
    const aiPct = f.aiCodeRatio !== null ? `${(f.aiCodeRatio * 100).toFixed(0)}%` : ' N/A';
    const row = [
      String(i + 1).padStart(3),
      String(Math.round(f.riskScore)).padStart(6),
      String(f.cyclomaticComplexity).padStart(5),
      String(f.changeFrequency90d).padStart(5),
      String(f.linesOfCode).padStart(6),
      aiPct.padStart(5),
    ].join(' ');
    console.log(`  ${row} ${pc.dim(f.filePath)}  ${riskBadge(f.riskScore)}`);
  });

  console.log(pc.dim(`\n  Showing top ${files.length} files sorted by risk score`));
}

export const topCommand = new Command('top')
  .description('Live-updating top files by risk (like unix top)')
  .option('-n, --count <number>', 'Number of files', '15')
  .option('--once', 'Show once and exit')
  .option('-i, --interval <seconds>', 'Refresh interval', '10')
  .action(async (opts) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const limit = parseInt(opts.count, 10) || 15;
    const interval = parseInt(opts.interval, 10) || 10;

    const fetch = async () => {
      const files = await client.getTopFiles(limit).catch(() => null);
      if (!files || files.length === 0) {
        header('Top Files');
        info('No file data available. Run: vibe sync');
        return null;
      }
      return files;
    };

    let iteration = 1;
    const files = await fetch();
    if (!files) return;
    renderTable(files, iteration);

    if (opts.once) return;

    const timer = setInterval(async () => {
      iteration++;
      const updated = await fetch();
      if (updated) renderTable(updated, iteration);
    }, interval * 1000);

    process.on('SIGINT', () => {
      clearInterval(timer);
      console.log(pc.dim('\n  Stopped.'));
      process.exit(0);
    });
  });
