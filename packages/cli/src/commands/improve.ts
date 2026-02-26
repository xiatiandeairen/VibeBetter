import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface Improvement {
  file: string;
  risk: number;
  suggestions: string[];
}

function generateSuggestions(file: Record<string, unknown>): string[] {
  const suggestions: string[] = [];
  const complexity = Number(file.complexity ?? 0);
  const churn = Number(file.churnCount ?? 0);
  const risk = Number(file.riskScore ?? 0);

  if (complexity > 30) suggestions.push('Extract complex logic into smaller functions');
  if (complexity > 50) suggestions.push('Consider splitting this file into multiple modules');
  if (churn > 20) suggestions.push('High churn — add integration tests to catch regressions');
  if (churn > 10 && complexity > 20) suggestions.push('Refactor hot path to reduce coupling');
  if (risk > 70) suggestions.push('Critical risk — prioritize code review for all changes');
  if (risk > 50) suggestions.push('Add type guards and validation at module boundaries');
  if (suggestions.length === 0) suggestions.push('Code health looks good — maintain current quality');

  return suggestions;
}

export const improveCommand = new Command('improve')
  .description('Suggest specific code improvements for high-risk files')
  .option('--top <n>', 'Number of files to show', '10')
  .option('--min-risk <score>', 'Minimum risk score threshold', '30')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Code Improvements');

    const config = requireConfig();
    const client = new ApiClient(config);
    const files = await client.getTopFiles(100).catch(() => null);

    if (!files || !Array.isArray(files) || files.length === 0) {
      info('No file data available. Run: vibe sync');
      return;
    }

    const minRisk = Number(opts.minRisk);
    const top = Number(opts.top);

    const improvements: Improvement[] = (files as Array<Record<string, unknown>>)
      .filter((f) => Number(f.riskScore ?? 0) >= minRisk)
      .sort((a, b) => Number(b.riskScore ?? 0) - Number(a.riskScore ?? 0))
      .slice(0, top)
      .map((f) => ({
        file: String(f.filePath ?? f.path ?? ''),
        risk: Number(f.riskScore ?? 0),
        suggestions: generateSuggestions(f),
      }));

    if (opts.json) {
      console.log(JSON.stringify(improvements, null, 2));
      return;
    }

    if (improvements.length === 0) {
      info(`No files with risk >= ${minRisk}. Your codebase is in good shape!`);
      return;
    }

    for (const imp of improvements) {
      const riskColor = imp.risk >= 70 ? pc.red : imp.risk >= 40 ? pc.yellow : pc.green;
      console.log(`\n${pc.bold(imp.file)} ${riskColor(`[risk: ${imp.risk.toFixed(1)}]`)}`);
      for (const s of imp.suggestions) {
        console.log(`  ${pc.dim('→')} ${s}`);
      }
    }

    console.log();
    info(`Showing ${improvements.length} files with risk >= ${minRisk}`);
  });
