import { Command } from 'commander';
import simpleGit from 'simple-git';
import pc from 'picocolors';
import { header, success, warn, riskBadge } from '../utils/display.js';

export const analyzeCommand = new Command('analyze')
  .description('Local analysis — no backend required')
  .option('--days <n>', 'Analysis window in days', '90')
  .action(async (opts: { days: string }) => {
    header('Local Analysis (offline)');
    const git = simpleGit();
    const days = parseInt(opts.days);
    const since = new Date();
    since.setDate(since.getDate() - days);

    try {
      const log = await git.log({ '--since': since.toISOString(), '--name-only': null });
      const fileChanges = new Map<string, number>();

      for (const commit of log.all) {
        if (commit.diff?.files) {
          for (const file of commit.diff.files) {
            fileChanges.set(file.file, (fileChanges.get(file.file) || 0) + 1);
          }
        }
      }

      const sorted = Array.from(fileChanges.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

      console.log(`  Analyzed ${log.total} commits over ${days} days`);
      console.log(`  Tracked ${fileChanges.size} files`);
      console.log();

      const hotspots = sorted.filter(([, count]) => count >= 10);
      if (hotspots.length > 0) {
        warn(`${hotspots.length} hotspot file(s) detected:`);
      }

      for (const [file, count] of sorted) {
        const risk = count >= 15 ? 200 + count : count >= 10 ? 100 : count >= 5 ? 30 : 10;
        console.log(`  ${riskBadge(risk).padEnd(20)} ${pc.white(file)} ${pc.dim(`(${count} changes)`)}`);
      }

      console.log();
      success(`Analysis complete. ${hotspots.length} hotspot(s) found.`);
    } catch (err) {
      console.error(`Analysis failed: ${err instanceof Error ? err.message : 'Not a git repository'}`);
      process.exit(1);
    }
  });
