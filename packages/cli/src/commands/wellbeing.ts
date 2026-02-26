import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';

interface WellbeingReport {
  sessionMinutes: number;
  breaksTaken: number;
  suggestedBreaks: number;
  status: 'great' | 'okay' | 'needs-break';
  tips: string[];
}

function assessWellbeing(sessionMinutes: number): WellbeingReport {
  const suggestedBreaks = Math.floor(sessionMinutes / 50);
  const breaksTaken = Math.max(0, suggestedBreaks - 1);

  let status: WellbeingReport['status'] = 'great';
  const tips: string[] = [];

  if (sessionMinutes > 120 && breaksTaken < suggestedBreaks) {
    status = 'needs-break';
    tips.push('Take a 10-minute break — you\'ve been coding for over 2 hours');
    tips.push('Stand up and stretch');
    tips.push('Look away from the screen for 20 seconds (20-20-20 rule)');
  } else if (sessionMinutes > 50) {
    status = 'okay';
    tips.push('Consider a short break soon');
    tips.push('Hydrate — grab some water');
  } else {
    tips.push('You\'re doing great! Stay focused');
    tips.push('Remember to commit frequently');
  }

  return { sessionMinutes, breaksTaken, suggestedBreaks, status, tips };
}

function statusEmoji(status: WellbeingReport['status']): string {
  switch (status) {
    case 'great': return '🟢';
    case 'okay': return '🟡';
    case 'needs-break': return '🔴';
  }
}

function statusLabel(status: WellbeingReport['status']): string {
  switch (status) {
    case 'great': return pc.green('Great');
    case 'okay': return pc.yellow('Okay');
    case 'needs-break': return pc.red('Needs Break');
  }
}

export const wellbeingCommand = new Command('wellbeing')
  .description('Developer wellbeing check — session length & break reminders')
  .option('--minutes <n>', 'Current session length in minutes', '90')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Developer Wellbeing');

    const minutes = parseInt(opts.minutes, 10);
    const report = assessWellbeing(minutes);

    if (opts.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    console.log();
    console.log(`  ${statusEmoji(report.status)} Status: ${statusLabel(report.status)}`);
    console.log(`  ${pc.dim('Session:')} ${report.sessionMinutes} minutes`);
    console.log(`  ${pc.dim('Breaks taken:')} ${report.breaksTaken} / ${report.suggestedBreaks} suggested`);
    console.log();

    for (const tip of report.tips) {
      console.log(`  ${pc.cyan('→')} ${tip}`);
    }

    console.log();
    info('Take care of yourself — sustainable coding is better coding.');
  });
