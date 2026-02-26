import { Command } from 'commander';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, benchmarkColor } from '../utils/display.js';

export const riskCommand = new Command('risk')
  .description('Show project risk score (PSRI)')
  .option('--file <path>', 'Check specific file risk')
  .action(async (opts: { file?: string }) => {
    header('Risk Assessment');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview();
    metric('PSRI Score', overview.psriScore?.toFixed(3) ?? 'N/A', benchmarkColor('psriScore', overview.psriScore ?? 0));
    metric('TDI Score', overview.tdiScore?.toFixed(3) ?? 'N/A', benchmarkColor('tdiScore', overview.tdiScore ?? 0));
    metric('Hotspot Files', overview.hotspotFiles);
    metric('Total Files', overview.totalFiles);

    if (opts.file) {
      const files = await client.getTopFiles(100);
      const match = files.find(f => f.filePath.includes(opts.file!));
      if (match) {
        console.log();
        metric('File', match.filePath);
        metric('Complexity', match.cyclomaticComplexity);
        metric('Changes (90d)', match.changeFrequency90d);
        metric('Risk Score', match.riskScore, match.riskScore > 200 ? 'red' : match.riskScore > 50 ? 'yellow' : 'green');
      } else {
        console.log(`  File not found in metrics: ${opts.file}`);
      }
    }
  });
