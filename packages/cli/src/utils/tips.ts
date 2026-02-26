import pc from 'picocolors';

const TIPS = [
  'Run `vibe check` before every commit to catch risk early',
  'Use `vibe report --format markdown` to share insights in PRs',
  'Set up `vibe check --strict` as a git pre-commit hook',
  'Run `vibe analyze` for offline analysis without a server',
  'Use `vibe decisions --generate` to get fresh recommendations',
  'Export data with `vibe report --format json` for custom analysis',
  'Run `vibe sync` after major changes to refresh metrics',
  'Check `vibe risk --file <path>` for file-specific risk scores',
];

export function showTip(): void {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  console.log();
  console.log(pc.dim(`💡 Tip: ${tip}`));
}
