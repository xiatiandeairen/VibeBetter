import { Command } from 'commander';
import pc from 'picocolors';
import { loadConfig } from '../config.js';
import { header, info } from '../utils/display.js';

export interface ActionableItem {
  type: 'fix' | 'review' | 'refactor' | 'test';
  priority: 'high' | 'medium' | 'low';
  file: string;
  message: string;
}

function filterActionable(items: ActionableItem[], minPriority: string): ActionableItem[] {
  const levels: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const threshold = levels[minPriority] ?? 1;
  return items.filter((item) => (levels[item.priority] ?? 0) >= threshold);
}

function formatItem(item: ActionableItem, idx: number): string {
  const icon =
    item.priority === 'high' ? pc.red('●') : item.priority === 'medium' ? pc.yellow('●') : pc.green('●');

  const typeLabel = pc.bold(`[${item.type.toUpperCase()}]`);
  return `  ${icon} ${idx + 1}. ${typeLabel} ${item.file}\n     ${pc.dim(item.message)}`;
}

export const calmCommand = new Command('calm')
  .description('Show only actionable items, suppress noise')
  .option('--min-priority <level>', 'Minimum priority (high, medium, low)', 'medium')
  .option('--type <type>', 'Filter by type (fix, review, refactor, test)')
  .option('--limit <n>', 'Maximum items to show', '10')
  .action(async (opts) => {
    header('Calm Mode — Actionable Items Only');

    const config = loadConfig();
    const projectId = config?.projectId ?? 'default';

    info(`Project: ${pc.bold(projectId)}`);
    info(`Minimum priority: ${pc.bold(opts.minPriority)}`);
    console.log();

    let items: ActionableItem[] = [
      { type: 'fix', priority: 'high', file: 'src/index.ts', message: 'Missing error handling in main entry' },
      { type: 'review', priority: 'high', file: 'src/utils/parser.ts', message: 'Complex function exceeds 50 lines' },
      { type: 'test', priority: 'medium', file: 'src/services/auth.ts', message: 'No test coverage for auth service' },
      { type: 'refactor', priority: 'medium', file: 'src/handlers/api.ts', message: 'Duplicate code across handlers' },
      { type: 'fix', priority: 'low', file: 'src/config.ts', message: 'Unused import detected' },
    ];

    items = filterActionable(items, opts.minPriority);

    if (opts.type) {
      items = items.filter((i) => i.type === opts.type);
    }

    const limit = parseInt(opts.limit, 10);
    items = items.slice(0, limit);

    if (items.length === 0) {
      console.log(pc.green('  ✓ Nothing actionable — your codebase is calm.'));
    } else {
      console.log(pc.bold(`  ${items.length} actionable item(s):\n`));
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item) console.log(formatItem(item, i));
      }
    }

    console.log();
    info('Use --min-priority low to see all items');
  });
