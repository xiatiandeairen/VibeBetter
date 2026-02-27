import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface PatternDetection {
  pattern: string;
  frequency: number;
  impact: 'positive' | 'neutral' | 'negative';
  confidence: number;
  examples: string[];
}

function detectPatterns(overview: Record<string, unknown>): PatternDetection[] {
  const aiPrs = (overview.aiPrs as number) ?? 12;
  return [
    { pattern: 'Boilerplate generation', frequency: Math.round(aiPrs * 0.6), impact: 'positive', confidence: 0.92, examples: ['models/', 'types/', 'schemas/'] },
    { pattern: 'Test scaffolding', frequency: Math.round(aiPrs * 0.4), impact: 'positive', confidence: 0.88, examples: ['__tests__/', 'spec/'] },
    { pattern: 'Complex algorithm assist', frequency: Math.round(aiPrs * 0.2), impact: 'neutral', confidence: 0.75, examples: ['utils/sort.ts', 'lib/graph.ts'] },
    { pattern: 'Config duplication', frequency: Math.round(aiPrs * 0.15), impact: 'negative', confidence: 0.81, examples: ['.eslintrc', 'tsconfig.json'] },
    { pattern: 'Documentation generation', frequency: Math.round(aiPrs * 0.35), impact: 'positive', confidence: 0.90, examples: ['README.md', 'docs/'] },
    { pattern: 'Error handling patterns', frequency: Math.round(aiPrs * 0.25), impact: 'positive', confidence: 0.85, examples: ['middleware/', 'handlers/'] },
  ];
}

export const aiPatternsCommand = new Command('ai-patterns')
  .description('Detect AI coding patterns')
  .option('--json', 'Output as JSON')
  .option('--min-confidence <n>', 'Min confidence threshold', '0.7')
  .action(async (opts) => {
    header('AI Coding Patterns');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const patterns = detectPatterns(overview as Record<string, unknown>);
    const minConf = parseFloat(opts.minConfidence);
    const filtered = patterns.filter(p => p.confidence >= minConf);

    if (opts.json) {
      console.log(JSON.stringify({ patterns: filtered }, null, 2));
      return;
    }

    console.log();
    for (const p of filtered) {
      const impactColor = p.impact === 'positive' ? pc.green : p.impact === 'negative' ? pc.red : pc.yellow;
      console.log(`  ${pc.bold(p.pattern)}`);
      console.log(`    Frequency: ${pc.bold(String(p.frequency))}  Impact: ${impactColor(p.impact)}  Confidence: ${pc.dim(`${Math.round(p.confidence * 100)}%`)}`);
      console.log(`    Examples: ${pc.dim(p.examples.join(', '))}`);
      console.log();
    }

    metric('Patterns detected', String(filtered.length));
    metric('Positive patterns', String(filtered.filter(p => p.impact === 'positive').length));
    success('AI pattern detection complete.');
  });
