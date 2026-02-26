import { Command } from 'commander';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, success } from '../utils/display.js';

export const reportCommand = new Command('report')
  .description('Generate AI Coding health report')
  .option('--format <fmt>', 'Output format: text, markdown, json', 'markdown')
  .action(async (opts: { format: string }) => {
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview();
    const topFiles = await client.getTopFiles(5);
    const decisions = await client.getDecisions();
    const attribution = await client.getAttribution().catch(() => null);

    const pct = (v: number | null): string => v === null ? 'N/A' : `${(v * 100).toFixed(1)}%`;
    const bm = (metric: string, v: number): string => {
      if (metric === 'psriScore' || metric === 'tdiScore') return v <= 0.3 ? 'Excellent' : v <= 0.6 ? 'Good' : 'Poor';
      return v >= 0.85 ? 'Excellent' : v >= 0.7 ? 'Good' : 'Needs Improvement';
    };

    if (opts.format === 'json') {
      console.log(JSON.stringify({ overview, topFiles, decisions, attribution }, null, 2));
      return;
    }

    if (opts.format === 'markdown') {
      const lines: string[] = [];
      lines.push(`# AI Coding Health Report`);
      lines.push(`Generated: ${new Date().toISOString().split('T')[0]}`);
      lines.push('');
      lines.push('## Key Metrics');
      lines.push('| Metric | Value | Benchmark |');
      lines.push('|--------|-------|-----------|');
      lines.push(`| AI Success Rate | ${pct(overview.aiSuccessRate)} | ${bm('aiSuccessRate', overview.aiSuccessRate ?? 0)} |`);
      lines.push(`| AI Stable Rate | ${pct(overview.aiStableRate)} | ${bm('aiStableRate', overview.aiStableRate ?? 0)} |`);
      lines.push(`| PSRI Score | ${overview.psriScore?.toFixed(3) ?? 'N/A'} | ${bm('psriScore', overview.psriScore ?? 0)} |`);
      lines.push(`| TDI | ${overview.tdiScore?.toFixed(3) ?? 'N/A'} | ${bm('tdiScore', overview.tdiScore ?? 0)} |`);
      lines.push(`| Total PRs | ${overview.totalPrs} | — |`);
      lines.push(`| AI PRs | ${overview.aiPrs} | — |`);

      if (attribution) {
        lines.push('');
        lines.push('## AI Attribution');
        lines.push(`- AI files avg complexity: ${attribution.complexity.aiAvg} (Human: ${attribution.complexity.humanAvg})`);
        lines.push(`- ${attribution.complexity.verdict}`);
        lines.push(`- AI major revision rate: ${(attribution.quality.aiMajorRevisionRate * 100).toFixed(1)}% (Human: ${(attribution.quality.humanMajorRevisionRate * 100).toFixed(1)}%)`);
      }

      if (topFiles.length > 0) {
        lines.push('');
        lines.push('## Top Risk Files');
        lines.push('| File | Complexity | Changes | Risk |');
        lines.push('|------|-----------|---------|------|');
        for (const f of topFiles) {
          const risk = f.riskScore > 200 ? 'HIGH' : f.riskScore > 50 ? 'MEDIUM' : 'LOW';
          lines.push(`| ${f.filePath} | ${f.cyclomaticComplexity} | ${f.changeFrequency90d} | ${risk} |`);
        }
      }

      const pending = decisions.filter(d => d.status === 'PENDING');
      if (pending.length > 0) {
        lines.push('');
        lines.push('## Recommendations');
        for (const d of pending) {
          lines.push(`- **[${d.level}]** ${d.title}: ${d.description}`);
        }
      }

      console.log(lines.join('\n'));
      return;
    }

    header('AI Coding Health Report');
    console.log(`  AI Success Rate:  ${pct(overview.aiSuccessRate)}`);
    console.log(`  AI Stable Rate:   ${pct(overview.aiStableRate)}`);
    console.log(`  PSRI Score:       ${overview.psriScore?.toFixed(3) ?? 'N/A'}`);
    console.log(`  TDI:              ${overview.tdiScore?.toFixed(3) ?? 'N/A'}`);
    console.log(`  Total PRs:        ${overview.totalPrs}`);
    console.log(`  AI PRs:           ${overview.aiPrs}`);
    console.log(`  Hotspot Files:    ${overview.hotspotFiles}`);
  });
