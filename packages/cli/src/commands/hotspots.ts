import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info, riskBadge } from '../utils/display.js';

export const hotspotsCommand = new Command('hotspots')
  .description('Dedicated hotspot analysis with drill-down')
  .option('-n, --limit <number>', 'Number of files to show', '15')
  .option('--min-risk <n>', 'Minimum risk score', '50')
  .action(async (opts) => {
    header('Hotspot Analysis');
    const config = requireConfig();
    const client = new ApiClient(config);

    const limit = parseInt(opts.limit, 10) || 15;
    const minRisk = parseInt(opts.minRisk, 10) || 50;

    const files = await client.getTopFiles(limit, 'default').catch(() => null);
    if (!files || files.length === 0) {
      info('No file data available. Run: vibe sync');
      return;
    }

    const hotspots = files.filter((f) => f.riskScore >= minRisk);
    if (hotspots.length === 0) {
      info(`No files with risk score >= ${minRisk}`);
      return;
    }

    console.log(pc.bold(`  Hotspot Files (risk >= ${minRisk})\n`));
    console.log(`  ${'#'.padStart(3)} ${'Risk'.padStart(6)} ${'CC'.padStart(5)} ${'Chg'.padStart(5)} ${'LOC'.padStart(6)} ${'Auth'.padStart(5)} File`);
    console.log(pc.dim(`  ${'─'.repeat(3)} ${'─'.repeat(6)} ${'─'.repeat(5)} ${'─'.repeat(5)} ${'─'.repeat(6)} ${'─'.repeat(5)} ${'─'.repeat(30)}`));

    hotspots.forEach((f, i) => {
      const risk = riskBadge(f.riskScore);
      const row = [
        String(i + 1).padStart(3),
        String(Math.round(f.riskScore)).padStart(6),
        String(f.cyclomaticComplexity).padStart(5),
        String(f.changeFrequency90d).padStart(5),
        String(f.linesOfCode).padStart(6),
        String(f.authorCount).padStart(5),
      ].join(' ');
      console.log(`  ${row} ${pc.dim(f.filePath)}  ${risk}`);
    });

    console.log();
    const avgRisk = hotspots.reduce((s, f) => s + f.riskScore, 0) / hotspots.length;
    console.log(pc.dim(`  ${hotspots.length} hotspot(s) | avg risk: ${avgRisk.toFixed(1)}`));

    if (hotspots.length >= 5) {
      console.log();
      console.log(pc.yellow('  ⚠ Consider refactoring top hotspots to reduce risk'));
    }
    console.log();
  });
