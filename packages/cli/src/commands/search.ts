import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info, metric } from '../utils/display.js';

export const searchCommand = new Command('search')
  .description('Search files by name in project metrics')
  .argument('<query>', 'File name or path fragment to search for')
  .option('-n, --count <number>', 'Max results', '20')
  .action(async (query: string, opts) => {
    header(`Search: "${query}"`);
    const config = requireConfig();
    const client = new ApiClient(config);
    const limit = parseInt(opts.count, 10) || 20;

    const files = await client.getTopFiles(200).catch(() => null);
    if (!files || files.length === 0) {
      info('No file metrics available. Run: vibe sync');
      return;
    }

    const lowerQuery = query.toLowerCase();
    const matches = files
      .filter((f) => f.filePath.toLowerCase().includes(lowerQuery))
      .slice(0, limit);

    if (matches.length === 0) {
      info(`No files matching "${query}" found in metrics.`);
      return;
    }

    console.log(pc.bold(`  Found ${matches.length} file(s):\n`));
    for (const f of matches) {
      console.log(`  ${pc.cyan(f.filePath)}`);
      metric('  Complexity', String(f.cyclomaticComplexity));
      metric('  Risk Score', String(f.riskScore));
      metric('  Lines', String(f.linesOfCode));
      console.log();
    }
  });
