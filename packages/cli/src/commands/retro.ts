import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface RetroSection {
  title: string;
  emoji: string;
  items: string[];
}

function buildRetro(overview: Record<string, unknown>): RetroSection[] {
  const psri = (overview.psriScore as number) ?? 0;
  const tdi = (overview.tdiScore as number) ?? 0;
  const aiRate = (overview.aiSuccessRate as number) ?? 0;
  const totalPrs = (overview.totalPrs as number) ?? 0;
  const hotspots = (overview.hotspotFiles as number) ?? 0;

  const wentWell: string[] = [];
  const improve: string[] = [];
  const actionItems: string[] = [];

  if (aiRate > 0.7) wentWell.push(`AI Success Rate at ${(aiRate * 100).toFixed(0)}% — strong adoption`);
  if (psri < 0.4) wentWell.push(`PSRI at ${psri.toFixed(3)} — low structural risk`);
  if (tdi < 0.3) wentWell.push(`TDI at ${tdi.toFixed(3)} — debt under control`);
  if (totalPrs > 0) wentWell.push(`${totalPrs} PR(s) analyzed this period`);
  if (wentWell.length === 0) wentWell.push('Team delivered working software');

  if (psri > 0.5) {
    improve.push(`PSRI at ${psri.toFixed(3)} — structural risk elevated`);
    actionItems.push('Allocate time for risk reduction in next sprint');
  }
  if (tdi > 0.4) {
    improve.push(`TDI at ${tdi.toFixed(3)} — tech debt growing`);
    actionItems.push('Create dedicated debt stories in backlog');
  }
  if (aiRate < 0.5) {
    improve.push(`AI Success Rate at ${(aiRate * 100).toFixed(0)}% — needs improvement`);
    actionItems.push('Review AI tool setup and provide team training');
  }
  if (hotspots > 5) {
    improve.push(`${hotspots} hotspot file(s) need attention`);
    actionItems.push('Schedule refactoring sessions for top hotspots');
  }
  if (improve.length === 0) improve.push('Continue improving test coverage');
  if (actionItems.length === 0) actionItems.push('Maintain current velocity and quality metrics');

  return [
    { title: 'What Went Well', emoji: '🟢', items: wentWell },
    { title: 'What to Improve', emoji: '🟡', items: improve },
    { title: 'Action Items', emoji: '🔵', items: actionItems },
  ];
}

export const retroCommand = new Command('retro')
  .description('Generate retrospective data for sprint review')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .action(async (opts) => {
    header('Sprint Retrospective');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const sections = buildRetro(overview as unknown as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(sections, null, 2));
      return;
    }

    if (opts.markdown) {
      console.log('# Sprint Retrospective\n');
      for (const s of sections) {
        console.log(`## ${s.emoji} ${s.title}\n`);
        for (const item of s.items) console.log(`- ${item}`);
        console.log();
      }
      return;
    }

    console.log(pc.bold('  Sprint Retrospective\n'));
    for (const section of sections) {
      console.log(`  ${section.emoji} ${pc.bold(section.title)}`);
      for (const item of section.items) {
        console.log(`    ${pc.dim('•')} ${item}`);
      }
      console.log();
    }
  });
