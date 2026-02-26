import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: Array<{ name: string; value: string; inline: boolean }>;
  footer: { text: string };
  timestamp: string;
}

interface DiscordPayload {
  content: string | null;
  embeds: DiscordEmbed[];
}

function riskColor(psri: number): number {
  if (psri <= 30) return 0x00ff00;
  if (psri <= 60) return 0xffaa00;
  return 0xff0000;
}

function buildPayload(project: string): DiscordPayload {
  const aiSuccess = 82;
  const aiStable = 90;
  const psri = 34;
  const coverage = 78;

  const embed: DiscordEmbed = {
    title: `📊 VibeBetter Report — ${project}`,
    description: 'Automated project health report',
    color: riskColor(psri),
    fields: [
      { name: 'AI Success Rate', value: `${aiSuccess}%`, inline: true },
      { name: 'AI Stable Rate', value: `${aiStable}%`, inline: true },
      { name: 'PSRI', value: `${psri}`, inline: true },
      { name: 'Coverage', value: `${coverage}%`, inline: true },
      { name: 'Status', value: psri <= 30 ? '🟢 Healthy' : psri <= 60 ? '🟡 Moderate' : '🔴 At Risk', inline: true },
    ],
    footer: { text: 'VibeBetter CLI • vibe discord' },
    timestamp: new Date().toISOString(),
  };

  return { content: null, embeds: [embed] };
}

export const discordCommand = new Command('discord')
  .description('Format VibeBetter report for Discord webhook')
  .option('--project <name>', 'Project name', 'my-project')
  .option('--webhook <url>', 'Discord webhook URL (dry-run if omitted)')
  .option('--json', 'Output payload as JSON without sending')
  .action(async (opts) => {
    header('Discord Report');

    const payload = buildPayload(opts.project);

    if (opts.json || !opts.webhook) {
      console.log();
      console.log(JSON.stringify(payload, null, 2));
      console.log();
      if (!opts.webhook) {
        info('Dry run — pass --webhook <url> to send to Discord.');
      }
      return;
    }

    try {
      const response = await fetch(opts.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(pc.green('  ✓ Report sent to Discord successfully'));
      } else {
        console.log(pc.red(`  ✗ Discord returned ${response.status}`));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(pc.red(`  ✗ Failed to send: ${message}`));
    }
  });
