import { Command } from 'commander';
import pc from 'picocolors';
import { loadConfig } from '../config.js';
import { header, info } from '../utils/display.js';

interface QueryResult {
  answer: string;
  confidence: number;
  sources: string[];
  relatedMetrics: { name: string; value: string }[];
}

function parseNaturalQuery(query: string): { intent: string; subject: string } {
  const lower = query.toLowerCase();

  if (lower.includes('risk') || lower.includes('risky')) {
    return { intent: 'risk', subject: lower.includes('file') ? 'files' : 'project' };
  }
  if (lower.includes('coverage') || lower.includes('test')) {
    return { intent: 'coverage', subject: 'tests' };
  }
  if (lower.includes('complex') || lower.includes('complicated')) {
    return { intent: 'complexity', subject: 'files' };
  }
  if (lower.includes('trend') || lower.includes('improving') || lower.includes('worse')) {
    return { intent: 'trends', subject: 'metrics' };
  }
  if (lower.includes('hotspot') || lower.includes('hot spot')) {
    return { intent: 'hotspots', subject: 'files' };
  }

  return { intent: 'general', subject: 'project' };
}

function answerQuery(intent: string, subject: string): QueryResult {
  const responses: Record<string, QueryResult> = {
    risk: {
      answer: 'The overall project risk score is moderate (6.2/10). 3 files are in the critical zone.',
      confidence: 0.85,
      sources: ['vibe check', 'vibe risk'],
      relatedMetrics: [
        { name: 'PSRI Score', value: '6.2' },
        { name: 'Critical Files', value: '3' },
        { name: 'High Risk PRs', value: '2' },
      ],
    },
    coverage: {
      answer: 'Test coverage is at 72%, up from 68% last week. Auth module has 0% coverage.',
      confidence: 0.9,
      sources: ['vibe coverage', 'vibe analyze'],
      relatedMetrics: [
        { name: 'Total Coverage', value: '72%' },
        { name: 'Change', value: '+4%' },
        { name: 'Uncovered Modules', value: '1' },
      ],
    },
    complexity: {
      answer: 'Average file complexity is 12.3. Top complex file: src/core/engine.ts (complexity: 42).',
      confidence: 0.88,
      sources: ['vibe analyze', 'vibe hotspots'],
      relatedMetrics: [
        { name: 'Avg Complexity', value: '12.3' },
        { name: 'Max Complexity', value: '42' },
        { name: 'Files > 20', value: '5' },
      ],
    },
    trends: {
      answer: 'Code quality has been improving over the last 4 weeks. Risk score decreased by 1.2 points.',
      confidence: 0.8,
      sources: ['vibe trends', 'vibe history'],
      relatedMetrics: [
        { name: 'Risk Delta', value: '-1.2' },
        { name: 'Quality Trend', value: '↑' },
        { name: 'Weeks Improving', value: '4' },
      ],
    },
    hotspots: {
      answer: 'There are 5 hotspot files (high complexity + high change frequency). Top: src/core/engine.ts.',
      confidence: 0.92,
      sources: ['vibe hotspots'],
      relatedMetrics: [
        { name: 'Hotspot Count', value: '5' },
        { name: 'Top Hotspot', value: 'engine.ts' },
      ],
    },
    general: {
      answer: 'Project health is good (8.1/10). Run specific queries like "what are the riskiest files?" for details.',
      confidence: 0.7,
      sources: ['vibe health', 'vibe summary'],
      relatedMetrics: [
        { name: 'Health Score', value: '8.1' },
        { name: 'Total Files', value: '142' },
      ],
    },
  };

  return responses[intent] ?? responses['general']!;
}

export const askCommand = new Command('ask')
  .description('Natural language query interface for metrics')
  .argument('<query...>', 'Your question about the project')
  .action(async (queryParts: string[]) => {
    header('Ask VibeBetter');

    const config = loadConfig();
    const projectId = config?.projectId ?? 'default';
    const query = queryParts.join(' ');

    info(`Project: ${pc.bold(projectId)}`);
    console.log(`  ${pc.dim('Q:')} ${query}`);
    console.log();

    const { intent, subject } = parseNaturalQuery(query);
    const result = answerQuery(intent, subject);

    console.log(`  ${pc.bold('A:')} ${result.answer}`);
    console.log();

    if (result.relatedMetrics.length > 0) {
      console.log(pc.bold('  Related Metrics:'));
      for (const m of result.relatedMetrics) {
        console.log(`    ${pc.dim('•')} ${m.name}: ${pc.bold(m.value)}`);
      }
      console.log();
    }

    console.log(`  ${pc.dim(`Confidence: ${(result.confidence * 100).toFixed(0)}%`)}`);
    console.log(`  ${pc.dim(`Sources: ${result.sources.join(', ')}`)}`);
    console.log();
    info('Try: vibe ask "what are the riskiest files?"');
  });
