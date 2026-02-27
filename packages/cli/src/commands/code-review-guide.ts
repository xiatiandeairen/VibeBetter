import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface GuidelineEntry {
  area: string;
  guideline: string;
  priority: 'must' | 'should' | 'nice';
  automated: boolean;
}

function generateGuidelines(_overview: Record<string, unknown>): GuidelineEntry[] {
  return [
    { area: 'Security', guideline: 'Check for hardcoded credentials or API keys', priority: 'must', automated: true },
    { area: 'Security', guideline: 'Verify input validation on all endpoints', priority: 'must', automated: false },
    { area: 'Performance', guideline: 'No N+1 queries in data fetching', priority: 'must', automated: false },
    { area: 'Performance', guideline: 'Verify pagination on list endpoints', priority: 'should', automated: false },
    { area: 'Quality', guideline: 'New code has corresponding tests', priority: 'must', automated: true },
    { area: 'Quality', guideline: 'No increase in cyclomatic complexity', priority: 'should', automated: true },
    { area: 'Style', guideline: 'Follows project naming conventions', priority: 'should', automated: true },
    { area: 'Style', guideline: 'Comments explain "why" not "what"', priority: 'nice', automated: false },
    { area: 'Architecture', guideline: 'No circular dependencies introduced', priority: 'must', automated: true },
    { area: 'Architecture', guideline: 'Respects module boundary contracts', priority: 'should', automated: false },
    { area: 'Documentation', guideline: 'Public API changes documented', priority: 'must', automated: false },
    { area: 'Documentation', guideline: 'Breaking changes noted in CHANGELOG', priority: 'must', automated: false },
  ];
}

export const codeReviewGuideCommand = new Command('code-review-guide')
  .description('Generate review guidelines from project metrics')
  .option('--json', 'Output as JSON')
  .option('--priority <level>', 'Filter by priority')
  .action(async (opts) => {
    header('Code Review Guide');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    let guidelines = generateGuidelines(overview as Record<string, unknown>);
    if (opts.priority) guidelines = guidelines.filter(g => g.priority === opts.priority);

    if (opts.json) {
      console.log(JSON.stringify({ guidelines }, null, 2));
      return;
    }

    let currentArea = '';
    console.log();
    for (const g of guidelines) {
      if (g.area !== currentArea) {
        currentArea = g.area;
        console.log(`  ${pc.bold(pc.underline(currentArea))}`);
      }
      const prioColor = g.priority === 'must' ? pc.red : g.priority === 'should' ? pc.yellow : pc.dim;
      const autoTag = g.automated ? pc.green(' [auto]') : '';
      console.log(`    ${prioColor(`[${g.priority}]`.padEnd(8))} ${g.guideline}${autoTag}`);
    }

    console.log();
    metric('Total guidelines', String(guidelines.length));
    metric('Automated', String(guidelines.filter(g => g.automated).length));
    success('Review guide generated.');
  });
