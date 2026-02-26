import { Command } from 'commander';
import pc from 'picocolors';
import { header } from '../utils/display.js';

interface Achievement {
  metric: string;
  value: number;
  threshold: number;
  message: string;
  emoji: string;
}

function checkAchievements(
  aiSuccess: number,
  aiStable: number,
  psri: number,
  coverage: number,
): Achievement[] {
  const achievements: Achievement[] = [];

  if (aiSuccess >= 90) {
    achievements.push({ metric: 'AI Success Rate', value: aiSuccess, threshold: 90, message: 'AI Success Rate hit 90%!', emoji: '🏆' });
  } else if (aiSuccess >= 80) {
    achievements.push({ metric: 'AI Success Rate', value: aiSuccess, threshold: 80, message: 'AI Success Rate above 80%!', emoji: '⭐' });
  }

  if (aiStable >= 95) {
    achievements.push({ metric: 'AI Stable Rate', value: aiStable, threshold: 95, message: 'AI Stable Rate hit 95%! Rock solid!', emoji: '🎯' });
  } else if (aiStable >= 85) {
    achievements.push({ metric: 'AI Stable Rate', value: aiStable, threshold: 85, message: 'AI Stable Rate above 85%!', emoji: '✅' });
  }

  if (psri <= 20) {
    achievements.push({ metric: 'PSRI', value: psri, threshold: 20, message: 'PSRI below 20 — minimal structural risk!', emoji: '🛡️' });
  } else if (psri <= 35) {
    achievements.push({ metric: 'PSRI', value: psri, threshold: 35, message: 'PSRI below 35 — well managed risk!', emoji: '📊' });
  }

  if (coverage >= 90) {
    achievements.push({ metric: 'Coverage', value: coverage, threshold: 90, message: 'Test coverage hit 90%!', emoji: '🧪' });
  } else if (coverage >= 80) {
    achievements.push({ metric: 'Coverage', value: coverage, threshold: 80, message: 'Test coverage above 80%!', emoji: '✨' });
  }

  return achievements;
}

function printCelebration(achievements: Achievement[]): void {
  if (achievements.length === 0) {
    console.log();
    console.log(pc.dim('  No achievements unlocked yet. Keep improving!'));
    console.log(pc.dim('  Targets: AI Success >= 80%, Stable >= 85%, PSRI <= 35, Coverage >= 80%'));
    return;
  }

  console.log();
  console.log(pc.bold(pc.cyan('  ╔══════════════════════════════════════════════╗')));
  console.log(pc.bold(pc.cyan('  ║       ACHIEVEMENTS UNLOCKED!                 ║')));
  console.log(pc.bold(pc.cyan('  ╚══════════════════════════════════════════════╝')));
  console.log();

  for (const a of achievements) {
    console.log(`  ${a.emoji}  ${pc.bold(pc.green(a.message))}`);
    console.log(`     ${pc.dim(`${a.metric}: ${a.value}% (threshold: ${a.threshold}%)`)}`);
    console.log();
  }

  console.log(pc.bold(`  Total: ${achievements.length} achievement${achievements.length > 1 ? 's' : ''} unlocked!`));
}

export const celebrateCommand = new Command('celebrate')
  .description('Celebrate metric achievements and milestones')
  .option('--ai-success <n>', 'AI success rate', '82')
  .option('--ai-stable <n>', 'AI stable rate', '90')
  .option('--psri <n>', 'PSRI score', '32')
  .option('--coverage <n>', 'Coverage percent', '78')
  .action(async (opts) => {
    header('Celebrate Achievements');

    const achievements = checkAchievements(
      parseFloat(opts.aiSuccess),
      parseFloat(opts.aiStable),
      parseFloat(opts.psri),
      parseFloat(opts.coverage),
    );

    printCelebration(achievements);
  });
