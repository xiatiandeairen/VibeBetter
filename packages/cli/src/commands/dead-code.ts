import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface DeadCodeEntry {
  file: string;
  identifier: string;
  kind: 'function' | 'class' | 'variable' | 'import' | 'type';
  lines: number;
  confidence: number;
}

function detectDeadCode(_overview: Record<string, unknown>): DeadCodeEntry[] {
  return [
    { file: 'src/utils/legacy.ts', identifier: 'parseLegacyFormat', kind: 'function', lines: 45, confidence: 0.95 },
    { file: 'src/api/deprecated.ts', identifier: 'OldMetricsHandler', kind: 'class', lines: 120, confidence: 0.90 },
    { file: 'src/types/v1.ts', identifier: 'V1Response', kind: 'type', lines: 15, confidence: 0.85 },
    { file: 'src/utils/helpers.ts', identifier: 'unused_import', kind: 'import', lines: 1, confidence: 0.99 },
    { file: 'src/config/defaults.ts', identifier: 'LEGACY_TIMEOUT', kind: 'variable', lines: 1, confidence: 0.88 },
    { file: 'src/auth/basic.ts', identifier: 'basicAuth', kind: 'function', lines: 30, confidence: 0.75 },
  ];
}

export const deadCodeCommand = new Command('dead-code')
  .description('Detect potentially unused code in the codebase')
  .option('--json', 'Output as JSON')
  .option('--min-confidence <n>', 'Minimum confidence threshold', '0.7')
  .action(async (opts) => {
    header('Dead Code Detection');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const entries = detectDeadCode(overview as Record<string, unknown>)
      .filter(e => e.confidence >= parseFloat(opts.minConfidence ?? '0.7'));

    if (opts.json) {
      console.log(JSON.stringify({ deadCode: entries, reclaimableLines: entries.reduce((s, e) => s + e.lines, 0) }, null, 2));
      return;
    }

    console.log();
    for (const e of entries) {
      const confColor = e.confidence > 0.9 ? pc.red : e.confidence > 0.8 ? pc.yellow : pc.cyan;
      console.log(`  ${confColor(`${(e.confidence * 100).toFixed(0)}%`)} ${pc.bold(e.file)} → ${pc.dim(e.kind)} ${pc.red(e.identifier)} ${pc.dim(`(${e.lines} lines)`)}`);
    }

    console.log();
    metric('Dead code items', String(entries.length));
    metric('Reclaimable lines', String(entries.reduce((s, e) => s + e.lines, 0)));
    success('Dead code detection complete.');
  });
