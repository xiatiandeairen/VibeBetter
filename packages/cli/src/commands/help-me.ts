import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info, success, warn } from '../utils/display.js';

interface Diagnosis {
  symptom: string;
  advice: string;
  severity: 'low' | 'medium' | 'high';
}

function diagnose(overview: {
  psriScore: number | null;
  tdiScore: number | null;
  aiSuccessRate: number | null;
  hotspotFiles: number;
  totalFiles: number;
}): Diagnosis[] {
  const results: Diagnosis[] = [];
  const psri = overview.psriScore ?? 0;
  const tdi = overview.tdiScore ?? 0;
  const aiRate = overview.aiSuccessRate ?? 0;
  const hotspotRatio = overview.totalFiles > 0 ? overview.hotspotFiles / overview.totalFiles : 0;

  if (psri > 0.6) {
    results.push({ symptom: 'High structural risk (PSRI > 0.6)', advice: 'Run `vibe risk` to identify top risk files, then refactor the highest-scoring modules.', severity: 'high' });
  } else if (psri > 0.3) {
    results.push({ symptom: 'Moderate structural risk', advice: 'Review hotspots with `vibe review` and address top 3 files.', severity: 'medium' });
  }

  if (tdi > 0.6) {
    results.push({ symptom: 'Critical technical debt', advice: 'Use `vibe fix` for actionable suggestions. Prioritize debt paydown this sprint.', severity: 'high' });
  } else if (tdi > 0.3) {
    results.push({ symptom: 'Growing technical debt', advice: 'Schedule a tech-debt sprint. Run `vibe fix` for quick wins.', severity: 'medium' });
  }

  if (aiRate < 0.7 && aiRate > 0) {
    results.push({ symptom: 'Low AI success rate', advice: 'Review AI-generated PRs with `vibe changelog`. Consider adding more context to AI prompts.', severity: 'medium' });
  }

  if (hotspotRatio > 0.2) {
    results.push({ symptom: `${(hotspotRatio * 100).toFixed(0)}% of files are hotspots`, advice: 'Too many hotspots indicate systemic issues. Consider architectural review.', severity: 'high' });
  }

  if (results.length === 0) {
    results.push({ symptom: 'No issues detected', advice: 'Your project metrics look healthy! Keep monitoring with `vibe watch`.', severity: 'low' });
  }

  return results;
}

export const helpMeCommand = new Command('help-me')
  .description('Interactive troubleshooting guide based on current metrics')
  .action(async () => {
    header('Troubleshooting Guide');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const issues = diagnose(overview);

    console.log(pc.bold('  Diagnosis\n'));
    for (const issue of issues) {
      const icon = issue.severity === 'high' ? pc.red('●') : issue.severity === 'medium' ? pc.yellow('●') : pc.green('●');
      console.log(`  ${icon} ${pc.bold(issue.symptom)}`);
      console.log(`    ${pc.dim('→')} ${issue.advice}`);
      console.log();
    }

    const highCount = issues.filter((i) => i.severity === 'high').length;
    if (highCount > 0) warn(`${highCount} high-severity issue(s) need attention`);
    else success('No critical issues found');
    console.log();
  });
