import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';

interface FlowStage {
  name: string;
  description: string;
  icon: string;
  metrics: string[];
}

const FLOW_STAGES: FlowStage[] = [
  { name: 'Collect', description: 'Gather data from Git, PRs, and AI tools', icon: '📥', metrics: ['commits', 'pull_requests', 'ai_events'] },
  { name: 'Compute', description: 'Calculate PSRI, TDI, hotspots, and trends', icon: '⚙️', metrics: ['psri_score', 'tdi_score', 'hotspot_count'] },
  { name: 'Decide', description: 'Generate decisions and actionable suggestions', icon: '🎯', metrics: ['decisions', 'suggestions', 'risk_alerts'] },
];

function renderFlowDiagram(): string {
  const lines: string[] = [];
  const width = 50;

  lines.push(pc.bold('  Data Flow Pipeline'));
  lines.push(pc.dim('  ' + '─'.repeat(width)));
  lines.push('');

  for (let i = 0; i < FLOW_STAGES.length; i++) {
    const stage = FLOW_STAGES[i]!;
    const box = `  ${stage.icon}  ${pc.bold(stage.name)}`;
    lines.push(box);
    lines.push(`      ${pc.dim(stage.description)}`);
    lines.push(`      ${pc.dim('Metrics:')} ${stage.metrics.join(', ')}`);

    if (i < FLOW_STAGES.length - 1) {
      lines.push(`      ${pc.cyan('│')}`);
      lines.push(`      ${pc.cyan('▼')}`);
    }
    lines.push('');
  }

  lines.push(pc.dim('  ' + '─'.repeat(width)));
  lines.push(`  ${pc.green('Pipeline: Collect → Compute → Decide')}`);

  return lines.join('\n');
}

export const flowCommand = new Command('flow')
  .description('Visualize the VibeBetter data flow pipeline')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Data Flow');

    if (opts.json) {
      console.log(JSON.stringify({ stages: FLOW_STAGES, pipeline: ['collect', 'compute', 'decide'] }, null, 2));
      return;
    }

    console.log(renderFlowDiagram());
    console.log();
    info('The pipeline runs on every sync: vibe sync');
  });
