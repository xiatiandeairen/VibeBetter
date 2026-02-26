import { Command } from 'commander';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, success, warn, error, info, riskBadge } from '../utils/display.js';
import { getModifiedFiles } from '../utils/git.js';
import pc from 'picocolors';

export const checkCommand = new Command('check')
  .description('Pre-commit risk check — analyze modified files')
  .option('--strict', 'Exit with error code if HIGH risk files found')
  .action(async (opts: { strict?: boolean }) => {
    header('Pre-commit Check');
    const config = requireConfig();
    const client = new ApiClient(config);

    try {
      const modifiedFiles = await getModifiedFiles();
      if (modifiedFiles.length === 0) {
        success('No modified files');
        return;
      }

      console.log(`  Modified files: ${pc.bold(String(modifiedFiles.length))}`);
      console.log();

      const topFiles = await client.getTopFiles(100);
      const fileRiskMap = new Map(topFiles.map(f => [f.filePath, f]));

      let hasHigh = false;
      let aiFileCount = 0;

      for (const file of modifiedFiles) {
        const known = fileRiskMap.get(file);
        if (known) {
          const risk = known.cyclomaticComplexity * known.changeFrequency90d;
          const badge = riskBadge(risk);
          if (risk > 200) hasHigh = true;
          if ((known.aiCodeRatio ?? 0) > 0.3) aiFileCount++;

          const complexityStr = pc.dim(`cc:${known.cyclomaticComplexity}`);
          const changesStr = pc.dim(`chg:${known.changeFrequency90d}`);
          console.log(`  ${badge.padEnd(20)} ${pc.white(file)}`);
          console.log(`  ${''.padEnd(12)} ${complexityStr} ${changesStr}${known.aiCodeRatio ? pc.dim(` ai:${(known.aiCodeRatio * 100).toFixed(0)}%`) : ''}`);
        } else {
          console.log(`  ${pc.green('LOW'.padEnd(12))} ${pc.dim(file)} ${pc.dim('(new/untracked)')}`);
        }
      }

      console.log();
      if (aiFileCount > 0) {
        info(`AI Impact: ${aiFileCount}/${modifiedFiles.length} files have >30% AI code`);
      }

      if (hasHigh) {
        console.log();
        warn('HIGH risk files detected — review before committing');
        if (opts.strict) {
          error('Strict mode: blocking commit due to HIGH risk files');
          process.exit(1);
        }
      } else {
        console.log();
        success('All changes look safe');
      }
    } catch (err) {
      error(`Check failed: ${err instanceof Error ? err.message : 'Unknown'}`);
      process.exit(1);
    }
  });
