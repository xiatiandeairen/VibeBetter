import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface StandupSection {
  title: string;
  items: string[];
}

function buildStandup(overview: Record<string, unknown>): StandupSection[] {
  const sections: StandupSection[] = [];
  const psri = (overview.psriScore as number) ?? 0;
  const tdi = (overview.tdiScore as number) ?? 0;
  const aiRate = (overview.aiSuccessRate as number) ?? 0;
  const totalPrs = (overview.totalPrs as number) ?? 0;
  const hotspots = (overview.hotspotFiles as number) ?? 0;

  const yesterday: string[] = [];
  yesterday.push(`Analyzed ${totalPrs} pull request(s)`);
  if (psri > 0) yesterday.push(`PSRI at ${psri.toFixed(3)} — ${psri > 0.5 ? 'needs attention' : 'within target'}`);
  if (tdi > 0) yesterday.push(`TDI at ${tdi.toFixed(3)} — technical debt ${tdi > 0.4 ? 'growing' : 'managed'}`);
  sections.push({ title: 'Yesterday', items: yesterday });

  const today: string[] = [];
  if (psri > 0.5) today.push('Address high-risk files to reduce PSRI');
  if (tdi > 0.4) today.push('Tackle top technical debt items');
  if (aiRate < 0.7) today.push('Review AI tool adoption and configuration');
  if (hotspots > 5) today.push(`Refactor ${hotspots} hotspot file(s)`);
  if (today.length === 0) today.push('Continue current sprint work — metrics are healthy');
  sections.push({ title: 'Today', items: today });

  const blockers: string[] = [];
  if (psri > 0.8) blockers.push('Critical PSRI — structural risk may block release');
  if (tdi > 0.7) blockers.push('High TDI — debt is accumulating beyond threshold');
  if (blockers.length === 0) blockers.push('None');
  sections.push({ title: 'Blockers', items: blockers });

  return sections;
}

export const standupCommand = new Command('standup')
  .description('Generate daily standup summary from recent metrics')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (opts) => {
    header('Daily Standup');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const sections = buildStandup(overview as unknown as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(sections, null, 2));
      return;
    }

    if (opts.markdown) {
      for (const s of sections) {
        console.log(`### ${s.title}`);
        for (const item of s.items) console.log(`- ${item}`);
        console.log();
      }
      return;
    }

    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    console.log(pc.bold(`  Standup — ${date}\n`));

    for (const section of sections) {
      console.log(`  ${pc.bold(pc.cyan(section.title))}`);
      for (const item of section.items) {
        console.log(`    ${pc.dim('•')} ${item}`);
      }
      console.log();
    }
  });
