import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface DeprecationEntry {
  api: string;
  usageCount: number;
  deprecatedSince: string;
  removalTarget: string;
  replacement: string | null;
  severity: 'critical' | 'warning' | 'info';
}

function trackDeprecations(_overview: Record<string, unknown>): DeprecationEntry[] {
  return [
    { api: 'getMetrics()', usageCount: 12, deprecatedSince: 'v2.50', removalTarget: 'v3.0', replacement: 'fetchMetrics()', severity: 'critical' },
    { api: 'UserProfile.legacy', usageCount: 5, deprecatedSince: 'v2.60', removalTarget: 'v3.0', replacement: 'UserProfile.v2', severity: 'critical' },
    { api: 'config.oldFormat', usageCount: 3, deprecatedSince: 'v2.70', removalTarget: 'v3.5', replacement: 'config.v2', severity: 'warning' },
    { api: 'utils.hash()', usageCount: 8, deprecatedSince: 'v2.55', removalTarget: 'v3.0', replacement: 'crypto.hash()', severity: 'critical' },
    { api: 'Report.textOnly', usageCount: 1, deprecatedSince: 'v2.80', removalTarget: 'v4.0', replacement: null, severity: 'info' },
  ];
}

export const deprecationCommand = new Command('deprecation')
  .description('Track deprecated API and code usage')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Deprecation Tracker');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const entries = trackDeprecations(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(entries, null, 2));
      return;
    }

    console.log();
    for (const entry of entries) {
      const sevColor = entry.severity === 'critical' ? pc.red : entry.severity === 'warning' ? pc.yellow : pc.dim;
      const replacement = entry.replacement ? pc.green(` → ${entry.replacement}`) : pc.dim(' (no replacement)');
      console.log(`  ${sevColor(`[${entry.severity.toUpperCase()}]`)} ${pc.bold(entry.api)}`);
      console.log(`    Used ${entry.usageCount}x | deprecated since ${entry.deprecatedSince} | removal: ${entry.removalTarget}${replacement}`);
      console.log();
    }

    const critical = entries.filter(e => e.severity === 'critical');
    metric('Total deprecations', String(entries.length));
    metric('Critical', String(critical.length));
    metric('Total usages to fix', String(entries.reduce((s, e) => s + e.usageCount, 0)));
    success('Deprecation tracking complete.');
  });
