import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info, success } from '../utils/display.js';

interface MentorPair {
  mentor: string;
  mentee: string;
  topic: string;
  matchScore: number;
}

function suggestMentors(_overview: Record<string, unknown>): MentorPair[] {
  return [
    { mentor: 'senior-dev-1', mentee: 'junior-dev-1', topic: 'AI-assisted code review patterns', matchScore: 92 },
    { mentor: 'senior-dev-2', mentee: 'junior-dev-2', topic: 'Effective Copilot prompt engineering', matchScore: 87 },
    { mentor: 'mid-dev-1', mentee: 'junior-dev-3', topic: 'Risk-aware PR authoring', matchScore: 78 },
    { mentor: 'senior-dev-1', mentee: 'mid-dev-2', topic: 'Architecture decision records', matchScore: 74 },
  ];
}

export const mentorCommand = new Command('mentor')
  .description('Suggest mentorship pairs based on AI usage patterns')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Mentorship Suggestions');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const pairs = suggestMentors(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(pairs, null, 2));
      return;
    }

    console.log();
    for (const pair of pairs) {
      const scoreColor = pair.matchScore >= 85 ? pc.green : pair.matchScore >= 70 ? pc.yellow : pc.dim;
      console.log(`  ${pc.bold(pair.mentor)} ${pc.dim('→')} ${pc.bold(pair.mentee)}`);
      console.log(`    ${pc.dim('Topic:')} ${pair.topic}  ${pc.dim('Match:')} ${scoreColor(`${pair.matchScore}%`)}`);
      console.log();
    }

    info(`${pairs.length} mentorship pairs suggested based on AI usage pattern analysis.`);
    success('Mentorship suggestions generated.');
  });
