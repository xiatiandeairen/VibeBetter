import { Command } from 'commander';
import pc from 'picocolors';
import * as readline from 'node:readline';
import { header } from '../utils/display.js';

interface MenuItem {
  key: string;
  label: string;
  command: string;
  description: string;
}

const MENU_ITEMS: MenuItem[] = [
  { key: '1', label: 'Check', command: 'check', description: 'Run risk check on project' },
  { key: '2', label: 'Status', command: 'status', description: 'Show project status' },
  { key: '3', label: 'Risk', command: 'risk', description: 'View risk breakdown' },
  { key: '4', label: 'Health', command: 'health', description: 'Project health assessment' },
  { key: '5', label: 'Summary', command: 'summary', description: 'Combined check + insights' },
  { key: '6', label: 'Trends', command: 'trends', description: 'Metric trend arrows' },
  { key: '7', label: 'Hotspots', command: 'hotspots', description: 'Hotspot analysis' },
  { key: '8', label: 'Standup', command: 'standup', description: 'Daily standup summary' },
  { key: '9', label: 'Sprint Plan', command: 'sprint-plan', description: 'Sprint priorities' },
  { key: '0', label: 'Quick', command: 'quick', description: 'One-line status' },
  { key: 'q', label: 'Quit', command: 'quit', description: 'Exit interactive mode' },
];

function printMenu(): void {
  console.log(pc.bold('\n  VibeBetter Interactive Menu\n'));
  for (const item of MENU_ITEMS) {
    const key = pc.cyan(pc.bold(`[${item.key}]`));
    console.log(`  ${key} ${item.label.padEnd(14)} ${pc.dim(item.description)}`);
  }
  console.log();
}

function createPrompt(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export const interactiveCommand = new Command('interactive')
  .description('Interactive menu-driven CLI mode')
  .alias('i')
  .action(async () => {
    header('Interactive Mode');

    if (!process.stdin.isTTY) {
      console.log(pc.yellow('  Interactive mode requires a TTY terminal.'));
      console.log(pc.dim('  Use individual commands instead, e.g.: vibe check'));
      return;
    }

    const rl = createPrompt();
    let running = true;

    const ask = (): void => {
      printMenu();
      rl.question(pc.bold('  Select> '), async (answer) => {
        const choice = answer.trim().toLowerCase();
        const item = MENU_ITEMS.find((m) => m.key === choice);

        if (!item) {
          console.log(pc.red('  Invalid choice. Try again.'));
          if (running) ask();
          return;
        }

        if (item.command === 'quit') {
          console.log(pc.dim('  Goodbye!'));
          running = false;
          rl.close();
          return;
        }

        console.log(pc.dim(`\n  Running: vibe ${item.command}\n`));
        try {
          const { execSync } = await import('node:child_process');
          execSync(`npx vibe ${item.command}`, { stdio: 'inherit' });
        } catch {
          console.log(pc.yellow('  Command finished with non-zero exit code.'));
        }

        if (running) ask();
      });
    };

    ask();
  });
