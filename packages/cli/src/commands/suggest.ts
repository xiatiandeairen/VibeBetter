import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface Suggestion {
  icon: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
}

function generateSuggestions(overview: {
  psriScore: number | null;
  tdiScore: number | null;
  aiSuccessRate: number | null;
  totalPrs: number;
  hotspotFiles: number;
  totalFiles: number;
}): Suggestion[] {
  const suggestions: Suggestion[] = [];

  const psri = overview.psriScore ?? 0;
  if (psri > 0.6) {
    suggestions.push({ icon: '🔴', title: 'Reduce structural risk', detail: `PSRI is ${psri.toFixed(3)} — focus on hotspot files to lower complexity`, priority: 'high' });
  } else if (psri > 0.3) {
    suggestions.push({ icon: '🟡', title: 'Monitor risk trend', detail: `PSRI is ${psri.toFixed(3)} — add tests to trending hotspots`, priority: 'medium' });
  }

  const tdi = overview.tdiScore ?? 0;
  if (tdi > 0.5) {
    suggestions.push({ icon: '🔧', title: 'Address tech debt', detail: `TDI is ${tdi.toFixed(3)} — schedule refactoring sprints`, priority: 'high' });
  }

  const aiRate = overview.aiSuccessRate ?? 0;
  if (aiRate < 0.7) {
    suggestions.push({ icon: '🤖', title: 'Improve AI adoption', detail: `AI success rate is ${(aiRate * 100).toFixed(1)}% — review AI tool configuration`, priority: 'medium' });
  } else if (aiRate >= 0.9) {
    suggestions.push({ icon: '🌟', title: 'AI is working great', detail: `${(aiRate * 100).toFixed(1)}% success rate — consider expanding AI tool usage`, priority: 'low' });
  }

  const hotspotRatio = overview.totalFiles > 0 ? overview.hotspotFiles / overview.totalFiles : 0;
  if (hotspotRatio > 0.15) {
    suggestions.push({ icon: '🔥', title: 'Too many hotspot files', detail: `${overview.hotspotFiles}/${overview.totalFiles} files are hotspots — break up large modules`, priority: 'high' });
  }

  if (suggestions.length === 0) {
    suggestions.push({ icon: '✅', title: 'Project looks healthy', detail: 'All metrics within normal ranges — keep up the good work!', priority: 'low' });
  }

  return suggestions.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

export const suggestCommand = new Command('suggest')
  .description('AI-powered suggestions based on current metrics')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Suggestions');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const suggestions = generateSuggestions(overview);

    if (opts.json) {
      console.log(JSON.stringify(suggestions, null, 2));
      return;
    }

    console.log(pc.bold(`  ${suggestions.length} suggestion(s)\n`));
    for (const s of suggestions) {
      const priorityColor = s.priority === 'high' ? pc.red : s.priority === 'medium' ? pc.yellow : pc.dim;
      console.log(`  ${s.icon} ${pc.bold(s.title)} ${priorityColor(`[${s.priority}]`)}`);
      console.log(`    ${pc.dim(s.detail)}`);
      console.log();
    }
  });
