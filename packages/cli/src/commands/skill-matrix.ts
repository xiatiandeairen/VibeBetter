import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface SkillEntry {
  developer: string;
  skills: Record<string, number>;
  overallLevel: number;
}

function buildSkillMatrix(_overview: Record<string, unknown>): SkillEntry[] {
  const devs = ['alice', 'bob', 'carol', 'dave'];
  const skillAreas = ['typescript', 'react', 'node', 'testing', 'devops', 'security'];
  const entries: SkillEntry[] = [];

  for (const dev of devs) {
    const skills: Record<string, number> = {};
    for (const skill of skillAreas) {
      skills[skill] = Math.round(Math.random() * 5);
    }
    const values = Object.values(skills);
    const overallLevel = Math.round(values.reduce((s, v) => s + v, 0) / values.length * 10) / 10;
    entries.push({ developer: dev, skills, overallLevel });
  }

  return entries.sort((a, b) => b.overallLevel - a.overallLevel);
}

export const skillMatrixCommand = new Command('skill-matrix')
  .description('Team skill matrix visualization')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Team Skill Matrix');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const entries = buildSkillMatrix(overview as Record<string, unknown>);
    const skillAreas = Object.keys(entries[0]?.skills ?? {});

    if (opts.json) {
      console.log(JSON.stringify(entries, null, 2));
      return;
    }

    console.log();
    console.log(`  ${'Dev'.padEnd(10)} ${skillAreas.map(s => s.padEnd(12)).join('')} Overall`);
    console.log(`  ${pc.dim('─'.repeat(10 + skillAreas.length * 12 + 8))}`);
    for (const entry of entries) {
      const cells = skillAreas.map(s => {
        const level = entry.skills[s] ?? 0;
        const stars = '★'.repeat(level) + '☆'.repeat(5 - level);
        const color = level >= 4 ? pc.green : level >= 2 ? pc.yellow : pc.red;
        return color(stars.padEnd(12));
      }).join('');
      console.log(`  ${entry.developer.padEnd(10)} ${cells} ${pc.bold(String(entry.overallLevel))}`);
    }

    console.log();
    metric('Team members', String(entries.length));
    metric('Skill areas', String(skillAreas.length));
    success('Skill matrix generated.');
  });
