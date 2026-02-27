import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success, warn } from '../utils/display.js';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface ReleaseAssessment {
  overallRisk: RiskLevel;
  score: number;
  factors: Array<{ name: string; risk: RiskLevel; detail: string }>;
}

function assessRelease(overview: Record<string, unknown>): ReleaseAssessment {
  const psri = (overview.psriScore as number) ?? 40;
  const hotspots = (overview.hotspotFiles as number) ?? 5;
  const aiStable = (overview.aiStableRate as number) ?? 80;

  const factors = [
    { name: 'Structural Risk (PSRI)', risk: psri > 60 ? 'high' as RiskLevel : psri > 30 ? 'medium' as RiskLevel : 'low' as RiskLevel, detail: `PSRI score: ${psri}` },
    { name: 'Hotspot Density', risk: hotspots > 10 ? 'high' as RiskLevel : hotspots > 5 ? 'medium' as RiskLevel : 'low' as RiskLevel, detail: `${hotspots} hotspot files` },
    { name: 'AI Stability', risk: aiStable < 70 ? 'high' as RiskLevel : aiStable < 85 ? 'medium' as RiskLevel : 'low' as RiskLevel, detail: `AI stable rate: ${aiStable}%` },
  ];

  const riskScores: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3, critical: 4 };
  const avgScore = factors.reduce((s, f) => s + riskScores[f.risk], 0) / factors.length;
  const score = Math.round(avgScore * 25);
  const overallRisk: RiskLevel = avgScore >= 3 ? 'critical' : avgScore >= 2.5 ? 'high' : avgScore >= 1.5 ? 'medium' : 'low';

  return { overallRisk, score, factors };
}

const riskColor = (r: RiskLevel) =>
  r === 'critical' ? pc.bgRed(pc.white(' CRITICAL ')) : r === 'high' ? pc.red(r) : r === 'medium' ? pc.yellow(r) : pc.green(r);

export const releaseRiskCommand = new Command('release-risk')
  .description('Assess risk level for upcoming release')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Release Risk Assessment');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const assessment = assessRelease(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(assessment, null, 2));
      return;
    }

    console.log();
    console.log(`  ${pc.bold('Overall Risk:')} ${riskColor(assessment.overallRisk)}  (score: ${assessment.score}/100)`);
    console.log();

    for (const factor of assessment.factors) {
      console.log(`  ${pc.dim('•')} ${factor.name.padEnd(25)} ${riskColor(factor.risk).padEnd(18)} ${pc.dim(factor.detail)}`);
    }

    console.log();
    if (assessment.overallRisk === 'high' || assessment.overallRisk === 'critical') {
      warn('Consider additional testing or phased rollout.');
    }
    metric('Risk factors evaluated', String(assessment.factors.length));
    success('Release risk assessment complete.');
  });
