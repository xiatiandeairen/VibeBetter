import { Command } from 'commander';
import pc from 'picocolors';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface MetricGoal {
  id: string;
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  target: number;
  label: string;
  createdAt: string;
}

interface GoalStore {
  version: number;
  goals: MetricGoal[];
}

function getStorePath(): string {
  return path.join(process.cwd(), '.vibe', 'goals.json');
}

function loadGoals(): GoalStore {
  const p = getStorePath();
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
  return { version: 1, goals: [] };
}

function saveGoals(store: GoalStore): void {
  const p = getStorePath();
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(store, null, 2));
}

function operatorLabel(op: MetricGoal['operator']): string {
  const map: Record<string, string> = { gt: '>', gte: '≥', lt: '<', lte: '≤', eq: '=' };
  return map[op] ?? op;
}

function evaluate(actual: number, op: MetricGoal['operator'], target: number): boolean {
  switch (op) {
    case 'gt': return actual > target;
    case 'gte': return actual >= target;
    case 'lt': return actual < target;
    case 'lte': return actual <= target;
    case 'eq': return actual === target;
  }
}

export const goalsCommand = new Command('goals')
  .description('Set and track metric goals')
  .option('--set <spec>', 'Set goal: "AI Success Rate > 90"')
  .option('--remove <id>', 'Remove goal by ID')
  .option('--check', 'Check goals against current metrics')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Metric Goals');
    const store = loadGoals();

    if (opts.set) {
      const match = opts.set.match(/^(.+?)\s*(>=|<=|>|<|=)\s*(\d+(?:\.\d+)?)$/);
      if (!match) {
        console.log(pc.red('  Invalid format. Use: "AI Success Rate > 90"'));
        return;
      }
      const [, metric, opStr, targetStr] = match;
      const opMap: Record<string, MetricGoal['operator']> = { '>': 'gt', '>=': 'gte', '<': 'lt', '<=': 'lte', '=': 'eq' };
      const goal: MetricGoal = {
        id: `goal_${Date.now()}`,
        metric: metric!.trim(),
        operator: opMap[opStr!] ?? 'gte',
        target: parseFloat(targetStr!),
        label: opts.set,
        createdAt: new Date().toISOString(),
      };
      store.goals.push(goal);
      saveGoals(store);
      console.log(pc.green(`  ✓ Goal set: ${goal.label}`));
      return;
    }

    if (opts.remove) {
      store.goals = store.goals.filter((g) => g.id !== opts.remove);
      saveGoals(store);
      console.log(pc.green(`  ✓ Goal removed`));
      return;
    }

    if (store.goals.length === 0) {
      info('No goals set. Use: vibe goals --set "AI Success Rate > 90"');
      return;
    }

    if (opts.check) {
      const config = requireConfig();
      const client = new ApiClient(config);
      const overview = await client.getOverview().catch(() => null);

      const metricValues: Record<string, number> = {};
      if (overview) {
        metricValues['PSRI'] = overview.psriScore ?? 0;
        metricValues['TDI'] = overview.tdiScore ?? 0;
        metricValues['AI Success Rate'] = (overview.aiSuccessRate ?? 0) * 100;
      }

      const results = store.goals.map((g) => {
        const actual = metricValues[g.metric];
        const met = actual !== undefined ? evaluate(actual, g.operator, g.target) : null;
        return { ...g, actual: actual ?? null, met };
      });

      if (opts.json) {
        console.log(JSON.stringify(results, null, 2));
        return;
      }

      console.log(pc.bold('  Goal Status\n'));
      for (const r of results) {
        const icon = r.met === true ? pc.green('✓') : r.met === false ? pc.red('✗') : pc.dim('?');
        const actualStr = r.actual !== null ? r.actual.toFixed(1) : 'N/A';
        console.log(`  ${icon} ${r.metric} ${operatorLabel(r.operator)} ${r.target} — actual: ${actualStr}`);
      }
      console.log();
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(store.goals, null, 2));
      return;
    }

    console.log(pc.bold('  Configured Goals\n'));
    for (const g of store.goals) {
      console.log(`  ${pc.dim(g.id)} ${g.metric} ${operatorLabel(g.operator)} ${g.target}`);
    }
    console.log();
  });
