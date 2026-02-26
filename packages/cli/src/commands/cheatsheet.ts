import { Command } from 'commander';
import pc from 'picocolors';
import { header } from '../utils/display.js';

interface CheatsheetSection {
  title: string;
  commands: Array<{ cmd: string; desc: string }>;
}

const SECTIONS: CheatsheetSection[] = [
  {
    title: 'Getting Started',
    commands: [
      { cmd: 'vibe init', desc: 'Initialize project config' },
      { cmd: 'vibe sync', desc: 'Sync data from remote sources' },
      { cmd: 'vibe status', desc: 'Show current project status' },
      { cmd: 'vibe doctor', desc: 'Diagnose setup issues' },
    ],
  },
  {
    title: 'Risk & Analysis',
    commands: [
      { cmd: 'vibe check', desc: 'Pre-commit risk check' },
      { cmd: 'vibe risk', desc: 'View risk trends' },
      { cmd: 'vibe analyze', desc: 'Offline local analysis' },
      { cmd: 'vibe hotspots', desc: 'Find high-risk hotspots' },
      { cmd: 'vibe top', desc: 'Top risk files' },
      { cmd: 'vibe diff', desc: 'Compare snapshots' },
      { cmd: 'vibe diff-files', desc: 'Compare specific files' },
    ],
  },
  {
    title: 'Reporting',
    commands: [
      { cmd: 'vibe report', desc: 'Generate full report' },
      { cmd: 'vibe summary', desc: 'Quick summary' },
      { cmd: 'vibe digest', desc: 'Weekly digest' },
      { cmd: 'vibe scorecard', desc: 'Project scorecard' },
      { cmd: 'vibe velocity', desc: 'Team velocity metrics' },
      { cmd: 'vibe coverage', desc: 'Test coverage data' },
    ],
  },
  {
    title: 'Integrations',
    commands: [
      { cmd: 'vibe github-action', desc: 'GitHub Actions workflow' },
      { cmd: 'vibe gitlab-ci', desc: 'GitLab CI config' },
      { cmd: 'vibe jenkins', desc: 'Jenkins pipeline' },
      { cmd: 'vibe docker', desc: 'Docker setup' },
      { cmd: 'vibe k8s', desc: 'Kubernetes manifest' },
      { cmd: 'vibe terraform', desc: 'Terraform config' },
      { cmd: 'vibe backstage', desc: 'Backstage catalog' },
      { cmd: 'vibe argocd', desc: 'ArgoCD manifest' },
    ],
  },
  {
    title: 'Productivity',
    commands: [
      { cmd: 'vibe bookmarks', desc: 'Manage file bookmarks' },
      { cmd: 'vibe journal', desc: 'Daily coding notes' },
      { cmd: 'vibe remind', desc: 'Set metric reminders' },
      { cmd: 'vibe shortcuts', desc: 'Command shortcuts' },
      { cmd: 'vibe cheatsheet', desc: 'This cheatsheet' },
    ],
  },
];

export const cheatsheetCommand = new Command('cheatsheet')
  .description('Display CLI command cheatsheet')
  .option('--section <name>', 'Show specific section')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('VibeBetter CLI Cheatsheet');

    let sections = SECTIONS;
    if (opts.section) {
      const lower = opts.section.toLowerCase();
      sections = sections.filter((s) => s.title.toLowerCase().includes(lower));
    }

    if (opts.json) {
      console.log(JSON.stringify(sections, null, 2));
      return;
    }

    if (sections.length === 0) {
      console.log(pc.dim('  No matching sections.'));
      return;
    }

    for (const section of sections) {
      console.log();
      console.log(pc.bold(`  ${section.title}`));
      console.log(`  ${pc.dim('─'.repeat(50))}`);
      for (const c of section.commands) {
        console.log(`  ${pc.cyan(c.cmd.padEnd(28))} ${pc.dim(c.desc)}`);
      }
    }

    console.log();
    console.log(pc.dim(`  ${SECTIONS.reduce((sum, s) => sum + s.commands.length, 0)} commands available`));
    console.log(pc.dim('  Run any command with --help for details'));
    console.log();
  });
