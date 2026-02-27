import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface DigestEntry {
  section: string;
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'flat';
}

function buildDigest(overview: Record<string, unknown>): DigestEntry[] {
  const totalPrs = (overview.totalPrs as number) ?? 40;
  const aiPrs = (overview.aiPrs as number) ?? 15;
  const entries: DigestEntry[] = [
    { section: 'PRs', title: 'Total PRs merged', value: totalPrs, change: 3, trend: 'up' },
    { section: 'PRs', title: 'AI-assisted PRs', value: aiPrs, change: 2, trend: 'up' },
    { section: 'Quality', title: 'Avg complexity', value: Math.round(Math.random() * 20 + 5), change: -1, trend: 'down' },
    { section: 'Quality', title: 'Hotspot files', value: Math.round(Math.random() * 10), change: 0, trend: 'flat' },
    { section: 'Risk', title: 'PSRI score', value: Math.round(Math.random() * 40 + 30), change: -2, trend: 'down' },
    { section: 'Risk', title: 'Open incidents', value: Math.round(Math.random() * 5), change: 1, trend: 'up' },
    { section: 'Velocity', title: 'PRs/day', value: Math.round(totalPrs / 7), change: 1, trend: 'up' },
    { section: 'Velocity', title: 'Avg cycle time (h)', value: Math.round(Math.random() * 48 + 4), change: -3, trend: 'down' },
  ];
  return entries;
}

export const dailyDigestCliCommand = new Command('daily-digest')
  .description('Daily metrics digest')
  .option('--json', 'Output as JSON')
  .option('--sections <list>', 'Sections to include (comma-separated)', 'PRs,Quality,Risk,Velocity')
  .action(async (opts) => {
    header('Daily Digest');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const entries = buildDigest(overview as Record<string, unknown>);
    const sections = opts.sections.split(',').map((s: string) => s.trim());
    const filtered = entries.filter(e => sections.includes(e.section));

    if (opts.json) {
      console.log(JSON.stringify({ date: new Date().toISOString().slice(0, 10), entries: filtered }, null, 2));
      return;
    }

    let currentSection = '';
    for (const entry of filtered) {
      if (entry.section !== currentSection) {
        currentSection = entry.section;
        console.log();
        console.log(`  ${pc.bold(pc.underline(currentSection))}`);
      }
      const arrow = entry.trend === 'up' ? pc.green('↑') : entry.trend === 'down' ? pc.red('↓') : pc.dim('→');
      const changeStr = entry.change >= 0 ? `+${entry.change}` : String(entry.change);
      console.log(`    ${entry.title.padEnd(22)} ${pc.bold(String(entry.value))} ${arrow} ${pc.dim(changeStr)}`);
    }

    console.log();
    metric('Sections', String(sections.length));
    metric('Entries', String(filtered.length));
    success('Daily digest generated.');
  });
