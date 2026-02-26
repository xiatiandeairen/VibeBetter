import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info, metric } from '../utils/display.js';

export const reviewCommand = new Command('review')
  .description('Suggest files to review based on risk')
  .option('-n, --count <number>', 'Number of files to suggest', '10')
  .action(async (opts) => {
    header('Review Suggestions');
    const config = requireConfig();
    const client = new ApiClient(config);
    const count = parseInt(opts.count, 10) || 10;

    const files = await client.getTopFiles(count, 'risk').catch(() => null);
    if (!files || files.length === 0) {
      info('No file metrics available. Run: vibe sync');
      return;
    }

    console.log(pc.bold('  Files recommended for review (highest risk first):\n'));
    for (const [i, f] of files.entries()) {
      const risk = f.riskScore > 200 ? pc.red('HIGH') : f.riskScore > 50 ? pc.yellow('MED') : pc.green('LOW');
      console.log(`  ${pc.dim(`${i + 1}.`)} ${f.filePath}`);
      metric('  Risk Score', `${f.riskScore} [${risk}]`);
      metric('  Complexity', String(f.cyclomaticComplexity));
      metric('  Changes (90d)', String(f.changeFrequency90d));
      if (f.aiCodeRatio !== null) metric('  AI Ratio', `${(f.aiCodeRatio * 100).toFixed(0)}%`);
      console.log();
    }
  });
