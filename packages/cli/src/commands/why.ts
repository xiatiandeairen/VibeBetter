import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info, metric, riskBadge } from '../utils/display.js';

interface RiskDimension {
  name: string;
  value: number;
  weight: number;
  contribution: number;
  explanation: string;
}

function explainRisk(file: {
  filePath: string;
  cyclomaticComplexity: number;
  changeFrequency90d: number;
  linesOfCode: number;
  authorCount: number;
  aiCodeRatio: number | null;
  riskScore: number;
}): RiskDimension[] {
  const dimensions: RiskDimension[] = [];
  const cc = file.cyclomaticComplexity;
  const chg = file.changeFrequency90d;
  const loc = file.linesOfCode;
  const auth = file.authorCount;

  dimensions.push({
    name: 'Complexity',
    value: cc,
    weight: 0.3,
    contribution: Math.min(cc / 50, 1) * 0.3,
    explanation: cc > 30 ? 'Very high cyclomatic complexity — consider splitting' : cc > 15 ? 'Moderate complexity — monitor during reviews' : 'Acceptable complexity',
  });

  dimensions.push({
    name: 'Change Frequency',
    value: chg,
    weight: 0.25,
    contribution: Math.min(chg / 30, 1) * 0.25,
    explanation: chg > 20 ? 'Extremely high churn — likely unstable module' : chg > 10 ? 'Frequent changes — may need stabilization' : 'Normal change rate',
  });

  dimensions.push({
    name: 'File Size',
    value: loc,
    weight: 0.2,
    contribution: Math.min(loc / 1000, 1) * 0.2,
    explanation: loc > 500 ? 'Large file — consider decomposition' : loc > 200 ? 'Medium file — acceptable' : 'Small file — good',
  });

  dimensions.push({
    name: 'Author Spread',
    value: auth,
    weight: 0.15,
    contribution: Math.min(auth / 10, 1) * 0.15,
    explanation: auth > 5 ? 'Many authors — ownership may be unclear' : 'Focused ownership',
  });

  const aiRatio = file.aiCodeRatio ?? 0;
  dimensions.push({
    name: 'AI Code Ratio',
    value: Math.round(aiRatio * 100),
    weight: 0.1,
    contribution: aiRatio * 0.1,
    explanation: aiRatio > 0.5 ? 'Majority AI-generated — verify quality' : 'Acceptable AI contribution',
  });

  return dimensions;
}

export const whyCommand = new Command('why')
  .description('Explain why a file is risky with detailed breakdown')
  .argument('<file>', 'File path to explain')
  .action(async (filePath) => {
    header('Risk Explanation');
    const config = requireConfig();
    const client = new ApiClient(config);

    const files = await client.getTopFiles(100).catch(() => null);
    if (!files) {
      info('No file data available. Run: vibe sync');
      return;
    }

    const file = files.find((f) => f.filePath === filePath || f.filePath.endsWith(filePath));
    if (!file) {
      info(`File not found in metrics: ${filePath}`);
      info('Use `vibe hotspots` to see tracked files');
      return;
    }

    console.log(pc.bold(`\n  ${file.filePath}\n`));
    metric('Risk Score', `${Math.round(file.riskScore)}  ${riskBadge(file.riskScore)}`);
    console.log();

    const dimensions = explainRisk(file);

    console.log(pc.bold('  Risk Breakdown\n'));
    for (const dim of dimensions) {
      const pct = (dim.contribution * 100).toFixed(1);
      const barLen = Math.round(dim.contribution * 40);
      const bar = pc.cyan('█'.repeat(barLen)) + pc.dim('░'.repeat(40 - barLen));
      console.log(`  ${pc.dim(dim.name.padEnd(18))} ${bar} ${pct}%`);
      console.log(`    ${pc.dim(dim.explanation)}`);
    }

    const totalContribution = dimensions.reduce((s, d) => s + d.contribution, 0);
    console.log();
    metric('Weighted Sum', totalContribution.toFixed(3));
    console.log();
  });
