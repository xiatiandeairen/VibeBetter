import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

function gitlabSection(name: string, collapsed: boolean, lines: string[]): string {
  const inner = lines.join('\n');
  if (collapsed) return `\\e[0Ksection_start:\`date +%s\`:${name}[collapsed=true]\\r\\e[0K${pc.bold(name)}\n${inner}\n\\e[0Ksection_end:\`date +%s\`:${name}\\r\\e[0K`;
  return inner;
}

export const gitlabCommand = new Command('gitlab')
  .description('Format metrics for GitLab CI integration')
  .option('--threshold <n>', 'PSRI threshold for failure', '0.6')
  .option('--json', 'Output raw JSON for GitLab artifacts')
  .action(async (opts) => {
    header('GitLab CI Integration');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const threshold = parseFloat(opts.threshold);
    const psri = overview.psriScore ?? 0;
    const tdi = overview.tdiScore ?? 0;
    const aiRate = overview.aiSuccessRate ?? 0;
    const passed = psri <= threshold;

    if (opts.json) {
      const artifact = {
        vibebetter: {
          version: '0.73.0',
          psri: { value: psri, threshold, passed },
          tdi: { value: tdi },
          aiSuccessRate: { value: aiRate },
          totalPrs: overview.totalPrs,
          hotspotFiles: overview.hotspotFiles,
        },
      };
      console.log(JSON.stringify(artifact, null, 2));
      return;
    }

    const statusIcon = passed ? '✅' : '❌';
    const lines = [
      `  ${pc.bold('VibeBetter GitLab CI Report')}`,
      '',
      `  ${pc.dim('PSRI:')}           ${psri.toFixed(3)} ${statusIcon} (threshold: ${threshold})`,
      `  ${pc.dim('TDI:')}            ${tdi.toFixed(3)}`,
      `  ${pc.dim('AI Success:')}     ${(aiRate * 100).toFixed(1)}%`,
      `  ${pc.dim('Total PRs:')}      ${overview.totalPrs}`,
      `  ${pc.dim('Hotspot Files:')}  ${overview.hotspotFiles}`,
      '',
      `  ${pc.dim('Status:')}         ${passed ? pc.green('PASSED') : pc.red('FAILED')}`,
    ];

    for (const l of lines) console.log(l);
    console.log();

    if (!passed) {
      console.log(pc.yellow('  Tip: Use --threshold to adjust the failure threshold.'));
      console.log();
      process.exitCode = 1;
    }
  });
