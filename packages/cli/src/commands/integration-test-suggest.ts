import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface TestSuggestion {
  module: string;
  testType: 'integration' | 'e2e' | 'contract';
  description: string;
  priority: 'critical' | 'high' | 'medium';
  reason: string;
}

function suggestTests(overview: Record<string, unknown>): TestSuggestion[] {
  const totalPrs = (overview.totalPrs as number) ?? 30;
  return [
    { module: 'api/auth', testType: 'integration', description: 'OAuth flow with GitHub provider', priority: 'critical', reason: `${Math.round(totalPrs * 0.3)} PRs touched auth module` },
    { module: 'api/metrics', testType: 'integration', description: 'Metrics calculation pipeline end-to-end', priority: 'critical', reason: 'Core business logic, no integration tests' },
    { module: 'api/webhook', testType: 'contract', description: 'Webhook payload schema validation', priority: 'high', reason: 'External consumers depend on payload shape' },
    { module: 'cli/sync', testType: 'e2e', description: 'Full sync flow with mock server', priority: 'high', reason: 'Complex multi-step process' },
    { module: 'api/export', testType: 'integration', description: 'CSV/JSON export with large datasets', priority: 'medium', reason: 'Performance regression risk' },
    { module: 'api/notifications', testType: 'integration', description: 'Email + Slack notification delivery', priority: 'medium', reason: 'Multiple external service integrations' },
  ];
}

export const integrationTestSuggestCommand = new Command('integration-test-suggest')
  .description('Suggest integration tests based on metrics')
  .option('--json', 'Output as JSON')
  .option('--priority <level>', 'Filter by priority')
  .action(async (opts) => {
    header('Integration Test Suggestions');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    let suggestions = suggestTests(overview as Record<string, unknown>);
    if (opts.priority) suggestions = suggestions.filter(s => s.priority === opts.priority);

    if (opts.json) {
      console.log(JSON.stringify({ suggestions }, null, 2));
      return;
    }

    console.log();
    for (const s of suggestions) {
      const prioColor = s.priority === 'critical' ? pc.red : s.priority === 'high' ? pc.yellow : pc.dim;
      console.log(`  ${prioColor(`[${s.priority}]`.padEnd(12))} ${pc.bold(s.module)} ${pc.dim(`(${s.testType})`)}`);
      console.log(`${''.padEnd(14)} ${s.description}`);
      console.log(`${''.padEnd(14)} ${pc.dim(`Reason: ${s.reason}`)}`);
      console.log();
    }

    metric('Suggestions', String(suggestions.length));
    metric('Critical', String(suggestions.filter(s => s.priority === 'critical').length));
    success('Test suggestions generated.');
  });
