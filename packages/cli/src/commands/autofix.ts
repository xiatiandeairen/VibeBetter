import { Command } from 'commander';
import pc from 'picocolors';
import { loadConfig } from '../config.js';
import { header, info } from '../utils/display.js';

export type FixType = 'add-test' | 'split-file' | 'extract-function' | 'add-types' | 'remove-dead-code';
export type FixConfidence = 'high' | 'medium' | 'low';

export interface AutofixSuggestion {
  id: number;
  type: FixType;
  confidence: FixConfidence;
  file: string;
  description: string;
  estimatedMinutes: number;
}

function generateSuggestions(): AutofixSuggestion[] {
  return [
    { id: 1, type: 'add-test', confidence: 'high', file: 'src/services/auth.ts', description: 'Add unit tests for authentication service — 0% coverage', estimatedMinutes: 15 },
    { id: 2, type: 'split-file', confidence: 'high', file: 'src/handlers/api.ts', description: 'Split into route-specific handlers — file exceeds 500 lines', estimatedMinutes: 20 },
    { id: 3, type: 'extract-function', confidence: 'medium', file: 'src/core/engine.ts', description: 'Extract calculateMetrics into separate utility', estimatedMinutes: 10 },
    { id: 4, type: 'add-types', confidence: 'medium', file: 'src/utils/parser.ts', description: 'Add explicit return types to exported functions', estimatedMinutes: 8 },
    { id: 5, type: 'remove-dead-code', confidence: 'low', file: 'src/legacy/compat.ts', description: 'Remove unused compatibility shims', estimatedMinutes: 5 },
  ];
}

function formatSuggestion(s: AutofixSuggestion): string {
  const icon =
    s.confidence === 'high' ? pc.green('✓') : s.confidence === 'medium' ? pc.yellow('~') : pc.dim('?');
  const typeLabel = pc.bold(`[${s.type}]`);
  const time = pc.dim(`~${s.estimatedMinutes}min`);
  return `  ${icon} #${s.id} ${typeLabel} ${s.file} ${time}\n     ${pc.dim(s.description)}`;
}

export const autofixCommand = new Command('autofix')
  .description('Suggest automated fixes (add tests, split files, etc.)')
  .option('--type <type>', 'Filter by fix type')
  .option('--min-confidence <level>', 'Minimum confidence (high, medium, low)', 'low')
  .option('--limit <n>', 'Maximum suggestions', '10')
  .action(async (opts) => {
    header('Autofix Suggestions');

    const config = loadConfig();
    const projectId = config?.projectId ?? 'default';
    info(`Project: ${pc.bold(projectId)}`);
    console.log();

    let suggestions = generateSuggestions();

    if (opts.type) {
      suggestions = suggestions.filter((s) => s.type === opts.type);
    }

    const levels: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const threshold = levels[opts.minConfidence] ?? 1;
    suggestions = suggestions.filter((s) => (levels[s.confidence] ?? 0) >= threshold);
    suggestions = suggestions.slice(0, parseInt(opts.limit, 10));

    if (suggestions.length === 0) {
      console.log(pc.green('  ✓ No automated fixes suggested — code looks clean!'));
    } else {
      const totalMinutes = suggestions.reduce((sum, s) => sum + s.estimatedMinutes, 0);
      console.log(pc.bold(`  ${suggestions.length} suggestion(s) — estimated ${totalMinutes} min total\n`));
      for (const s of suggestions) {
        console.log(formatSuggestion(s));
      }
    }

    console.log();
    info('These are suggestions — review before applying');
  });
