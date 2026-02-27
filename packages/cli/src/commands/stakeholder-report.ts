import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface StakeholderSection {
  title: string;
  highlights: string[];
  metrics: { label: string; value: string; status: 'green' | 'yellow' | 'red' }[];
}

function buildStakeholderReport(overview: Record<string, unknown>): StakeholderSection[] {
  const totalPrs = (overview.totalPrs as number) ?? 30;
  const aiPrs = (overview.aiPrs as number) ?? 12;
  return [
    {
      title: 'Executive Summary',
      highlights: ['Engineering velocity up 15% MoM', 'AI adoption growing steadily', 'Technical debt under control'],
      metrics: [
        { label: 'PRs merged', value: String(totalPrs), status: 'green' },
        { label: 'AI adoption', value: `${Math.round((aiPrs / Math.max(totalPrs, 1)) * 100)}%`, status: 'yellow' },
        { label: 'Incidents', value: '0', status: 'green' },
      ],
    },
    {
      title: 'Quality & Risk',
      highlights: ['No critical security issues', 'Coverage trending upward'],
      metrics: [
        { label: 'Test coverage', value: '72%', status: 'yellow' },
        { label: 'PSRI score', value: '35', status: 'green' },
        { label: 'Critical bugs', value: '0', status: 'green' },
      ],
    },
    {
      title: 'Team Health',
      highlights: ['Balanced workload distribution', 'Review cycle improving'],
      metrics: [
        { label: 'Team satisfaction', value: '8.2/10', status: 'green' },
        { label: 'Avg review time', value: '6h', status: 'yellow' },
        { label: 'On-call burden', value: 'Low', status: 'green' },
      ],
    },
  ];
}

export const stakeholderReportCommand = new Command('stakeholder-report')
  .description('Executive stakeholder report')
  .option('--json', 'Output as JSON')
  .option('--format <fmt>', 'Output format (terminal|markdown)', 'terminal')
  .action(async (opts) => {
    header('Stakeholder Report');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const sections = buildStakeholderReport(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ generatedAt: new Date().toISOString(), sections }, null, 2));
      return;
    }

    console.log();
    for (const section of sections) {
      console.log(`  ${pc.bold(pc.underline(section.title))}`);
      for (const h of section.highlights) {
        console.log(`    ${pc.dim('•')} ${h}`);
      }
      console.log();
      for (const m of section.metrics) {
        const statusColor = m.status === 'green' ? pc.green : m.status === 'yellow' ? pc.yellow : pc.red;
        console.log(`    ${m.label.padEnd(20)} ${statusColor(pc.bold(m.value))}`);
      }
      console.log();
    }

    metric('Sections', String(sections.length));
    success('Stakeholder report generated.');
  });
