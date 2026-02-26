import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface SprintPriority {
  area: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  suggestedAction: string;
}

function urgencyColor(urgency: SprintPriority['urgency']): (s: string) => string {
  switch (urgency) {
    case 'critical': return pc.red;
    case 'high': return pc.yellow;
    case 'medium': return pc.cyan;
    case 'low': return pc.dim;
  }
}

function urgencyIcon(urgency: SprintPriority['urgency']): string {
  switch (urgency) {
    case 'critical': return '🔴';
    case 'high': return '🟡';
    case 'medium': return '🔵';
    case 'low': return '⚪';
  }
}

function derivePriorities(psri: number, tdi: number, aiRate: number, hotspots: number): SprintPriority[] {
  const priorities: SprintPriority[] = [];

  if (psri > 0.7) {
    priorities.push({
      area: 'Structural Risk',
      urgency: 'critical',
      reason: `PSRI at ${psri.toFixed(3)} — above critical threshold`,
      suggestedAction: 'Focus on reducing complexity in top hotspot files',
    });
  } else if (psri > 0.5) {
    priorities.push({
      area: 'Structural Risk',
      urgency: 'high',
      reason: `PSRI at ${psri.toFixed(3)} — elevated risk`,
      suggestedAction: 'Allocate 20% of sprint to risk reduction',
    });
  }

  if (tdi > 0.6) {
    priorities.push({
      area: 'Technical Debt',
      urgency: 'critical',
      reason: `TDI at ${tdi.toFixed(3)} — debt is accumulating`,
      suggestedAction: 'Dedicate a debt-reduction story this sprint',
    });
  } else if (tdi > 0.4) {
    priorities.push({
      area: 'Technical Debt',
      urgency: 'medium',
      reason: `TDI at ${tdi.toFixed(3)} — manageable but growing`,
      suggestedAction: 'Include small refactoring tasks in sprint backlog',
    });
  }

  if (aiRate < 0.5) {
    priorities.push({
      area: 'AI Effectiveness',
      urgency: 'high',
      reason: `AI Success Rate at ${(aiRate * 100).toFixed(0)}% — below target`,
      suggestedAction: 'Review AI tool configuration and team training',
    });
  }

  if (hotspots > 10) {
    priorities.push({
      area: 'Hotspot Files',
      urgency: 'high',
      reason: `${hotspots} hotspot files detected`,
      suggestedAction: 'Split or refactor top 3 hotspot files',
    });
  }

  if (priorities.length === 0) {
    priorities.push({
      area: 'General',
      urgency: 'low',
      reason: 'Metrics are healthy — no urgent priorities',
      suggestedAction: 'Focus on feature delivery and incremental improvements',
    });
  }

  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  priorities.sort((a, b) => (order[a.urgency] ?? 3) - (order[b.urgency] ?? 3));
  return priorities;
}

export const sprintPlanCommand = new Command('sprint-plan')
  .description('Suggest sprint priorities based on risk and decisions')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Sprint Plan');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const psri = overview.psriScore ?? 0;
    const tdi = overview.tdiScore ?? 0;
    const aiRate = overview.aiSuccessRate ?? 0;
    const hotspots = overview.hotspotFiles ?? 0;

    const priorities = derivePriorities(psri, tdi, aiRate, hotspots);

    if (opts.json) {
      console.log(JSON.stringify(priorities, null, 2));
      return;
    }

    console.log(pc.bold('  Sprint Priorities\n'));
    for (const p of priorities) {
      const color = urgencyColor(p.urgency);
      console.log(`  ${urgencyIcon(p.urgency)} ${color(p.urgency.toUpperCase().padEnd(10))} ${pc.bold(p.area)}`);
      console.log(`     ${pc.dim('Reason:')} ${p.reason}`);
      console.log(`     ${pc.dim('Action:')} ${p.suggestedAction}`);
      console.log();
    }
  });
