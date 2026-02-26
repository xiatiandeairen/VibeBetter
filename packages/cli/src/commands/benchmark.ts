import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface BenchmarkEntry {
  metric: string;
  yours: number;
  industry: number;
  delta: number;
  verdict: 'above' | 'at' | 'below';
}

const INDUSTRY_BENCHMARKS: Record<string, { value: number; inverted: boolean; label: string }> = {
  psri: { value: 0.35, inverted: true, label: 'PSRI' },
  tdi: { value: 0.30, inverted: true, label: 'TDI' },
  aiSuccessRate: { value: 0.72, inverted: false, label: 'AI Success Rate' },
  hotspotRatio: { value: 0.05, inverted: true, label: 'Hotspot Ratio' },
};

function compareMetric(metric: string, yours: number, benchmark: number, inverted: boolean): BenchmarkEntry {
  const delta = yours - benchmark;
  let verdict: BenchmarkEntry['verdict'];
  const threshold = benchmark * 0.1;
  if (Math.abs(delta) < threshold) {
    verdict = 'at';
  } else if (inverted) {
    verdict = delta < 0 ? 'above' : 'below';
  } else {
    verdict = delta > 0 ? 'above' : 'below';
  }
  return { metric, yours, industry: benchmark, delta, verdict };
}

function verdictColor(v: BenchmarkEntry['verdict']): (s: string) => string {
  return v === 'above' ? pc.green : v === 'below' ? pc.red : pc.yellow;
}

function verdictIcon(v: BenchmarkEntry['verdict']): string {
  return v === 'above' ? '▲' : v === 'below' ? '▼' : '─';
}

export const benchmarkCommand = new Command('benchmark')
  .description('Compare project metrics against industry benchmarks')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Industry Benchmark');
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
    const totalFiles = overview.totalFiles ?? 1;
    const hotspots = overview.hotspotFiles ?? 0;
    const hotspotRatio = totalFiles > 0 ? hotspots / totalFiles : 0;

    const entries: BenchmarkEntry[] = [
      compareMetric(INDUSTRY_BENCHMARKS.psri!.label, psri, INDUSTRY_BENCHMARKS.psri!.value, INDUSTRY_BENCHMARKS.psri!.inverted),
      compareMetric(INDUSTRY_BENCHMARKS.tdi!.label, tdi, INDUSTRY_BENCHMARKS.tdi!.value, INDUSTRY_BENCHMARKS.tdi!.inverted),
      compareMetric(INDUSTRY_BENCHMARKS.aiSuccessRate!.label, aiRate, INDUSTRY_BENCHMARKS.aiSuccessRate!.value, INDUSTRY_BENCHMARKS.aiSuccessRate!.inverted),
      compareMetric(INDUSTRY_BENCHMARKS.hotspotRatio!.label, hotspotRatio, INDUSTRY_BENCHMARKS.hotspotRatio!.value, INDUSTRY_BENCHMARKS.hotspotRatio!.inverted),
    ];

    if (opts.json) {
      console.log(JSON.stringify(entries, null, 2));
      return;
    }

    console.log(pc.bold('  Metric Benchmark Comparison\n'));
    console.log(`  ${'Metric'.padEnd(20)} ${'Yours'.padEnd(10)} ${'Industry'.padEnd(10)} ${'Delta'.padEnd(10)} Verdict`);
    console.log(`  ${pc.dim('─'.repeat(60))}`);

    for (const e of entries) {
      const color = verdictColor(e.verdict);
      const icon = verdictIcon(e.verdict);
      const deltaStr = (e.delta >= 0 ? '+' : '') + e.delta.toFixed(3);
      console.log(
        `  ${e.metric.padEnd(20)} ${e.yours.toFixed(3).padEnd(10)} ${e.industry.toFixed(3).padEnd(10)} ${deltaStr.padEnd(10)} ${color(icon)} ${color(e.verdict)}`,
      );
    }
    console.log();
  });
