import { Command } from 'commander';
import simpleGit from 'simple-git';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, success, warn, riskBadge, metric } from '../utils/display.js';

export const prRiskCommand = new Command('pr')
  .description('Analyze risk for current branch/PR')
  .option('--base <branch>', 'Base branch to compare against', 'main')
  .option('--markdown', 'Output as markdown (for PR description)')
  .action(async (opts: { base: string; markdown?: boolean }) => {
    const config = requireConfig();
    const client = new ApiClient(config);
    const git = simpleGit();

    const branch = (await git.branch()).current;
    const diff = await git.diffSummary([opts.base + '...' + branch]);
    const changedFiles = diff.files.map(f => f.file);

    if (opts.markdown) {
      console.log('## VibeBetter Risk Summary');
      console.log(`Branch: \`${branch}\` → \`${opts.base}\``);
      console.log(`Files changed: ${changedFiles.length}`);
      console.log('');

      const topFiles = await client.getTopFiles(100);
      const riskMap = new Map(topFiles.map(f => [f.filePath, f]));

      console.log('| File | Risk | Complexity | Changes |');
      console.log('|------|------|-----------|---------|');
      for (const file of changedFiles) {
        const data = riskMap.get(file);
        if (data) {
          const risk = data.riskScore > 200 ? 'HIGH' : data.riskScore > 50 ? 'MEDIUM' : 'LOW';
          console.log(`| ${file} | ${risk} | ${data.cyclomaticComplexity} | ${data.changeFrequency90d} |`);
        } else {
          console.log(`| ${file} | — | new | — |`);
        }
      }
    } else {
      header(`PR Risk: ${branch}`);
      console.log(`  Base: ${pc.dim(opts.base)}`);
      console.log(`  Files changed: ${pc.bold(String(changedFiles.length))}`);
      console.log();

      const topFiles = await client.getTopFiles(100);
      const riskMap = new Map(topFiles.map(f => [f.filePath, f]));
      let highCount = 0;

      for (const file of changedFiles.slice(0, 15)) {
        const data = riskMap.get(file);
        if (data) {
          const risk = data.cyclomaticComplexity * data.changeFrequency90d;
          if (risk > 200) highCount++;
          console.log(`  ${riskBadge(risk).padEnd(20)} ${pc.white(file)}`);
        } else {
          console.log(`  ${pc.green('NEW'.padEnd(12))} ${pc.dim(file)}`);
        }
      }

      console.log();
      if (highCount > 0) warn(`${highCount} high-risk file(s) in this PR`);
      else success('No high-risk files in this PR');
    }
  });
