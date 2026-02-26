import { Command } from 'commander';
import pc from 'picocolors';
import { header } from '../utils/display.js';

interface PulseData {
  health: number;
  trend: 'up' | 'down' | 'stable';
  aiSuccessRate: number;
  psri: number;
  openRisks: number;
  lastCommitAge: string;
}

function trendArrow(trend: PulseData['trend']): string {
  switch (trend) {
    case 'up': return pc.green('↑');
    case 'down': return pc.red('↓');
    case 'stable': return pc.yellow('→');
  }
}

function healthColor(score: number): string {
  if (score >= 80) return pc.green(pc.bold(`${score}%`));
  if (score >= 60) return pc.yellow(pc.bold(`${score}%`));
  return pc.red(pc.bold(`${score}%`));
}

function gatherPulse(): PulseData {
  const health = 78;
  const aiSuccessRate = 82;
  const psri = 34;
  const openRisks = 3;
  return {
    health,
    trend: health >= 80 ? 'up' : health >= 60 ? 'stable' : 'down',
    aiSuccessRate,
    psri,
    openRisks,
    lastCommitAge: '2h ago',
  };
}

export const pulseCommand = new Command('pulse')
  .description('Real-time project pulse — quick health + trend in one line')
  .option('--json', 'Output as JSON')
  .option('--project <name>', 'Project name', 'my-project')
  .action(async (opts) => {
    const project = opts.project as string;
    const pulse = gatherPulse();

    if (opts.json) {
      console.log(JSON.stringify({ project, ...pulse }, null, 2));
      return;
    }

    header('Project Pulse');
    console.log();
    console.log(
      `  ${pc.bold(project)}  ` +
      `${healthColor(pulse.health)} ${trendArrow(pulse.trend)}  ` +
      `AI ${pulse.aiSuccessRate}%  ` +
      `PSRI ${pulse.psri}  ` +
      `Risks ${pulse.openRisks}  ` +
      `${pc.dim(pulse.lastCommitAge)}`
    );
    console.log();
  });
