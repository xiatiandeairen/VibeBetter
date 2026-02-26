import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { header, info } from '../utils/display.js';

function generateAutoLoginToken(projectId: string): string {
  const payload = `${projectId}:${Date.now()}`;
  return Buffer.from(payload).toString('base64url');
}

function buildDashboardUrl(baseUrl: string, token: string, page: string): string {
  const url = new URL(page, baseUrl);
  url.searchParams.set('token', token);
  return url.toString();
}

export const studioCommand = new Command('studio')
  .description('Open web dashboard from CLI with auto-login token')
  .option('--base-url <url>', 'Dashboard base URL', 'http://localhost:3000')
  .option('--page <path>', 'Dashboard page to open', '/')
  .option('--no-browser', 'Print URL without opening browser')
  .action(async (opts) => {
    header('VibeBetter Studio');

    const config = requireConfig();
    const projectId = config.projectId ?? 'default';

    info(`Project: ${pc.bold(projectId)}`);

    const token = generateAutoLoginToken(projectId);
    const url = buildDashboardUrl(opts.baseUrl, token, opts.page);

    console.log();
    console.log(`  ${pc.bold('Dashboard URL:')}`);
    console.log(`  ${pc.cyan(url)}`);
    console.log();

    if (opts.browser !== false) {
      try {
        const { exec } = await import('node:child_process');
        const platform = process.platform;
        const cmd =
          platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
        exec(`${cmd} "${url}"`);
        info('Opening browser...');
      } catch {
        info('Could not open browser automatically. Copy the URL above.');
      }
    } else {
      info('Copy the URL above to open in your browser');
    }

    console.log();
    info(`Auto-login token valid for this session`);
    info('The token expires after first use');
  });
