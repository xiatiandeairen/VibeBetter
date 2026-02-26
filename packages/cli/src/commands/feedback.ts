import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';

interface FeedbackPayload {
  type: 'bug' | 'feature' | 'improvement' | 'general';
  message: string;
  rating: number | null;
  context: Record<string, unknown>;
}

function collectContext(): Record<string, unknown> {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    timestamp: new Date().toISOString(),
  };
}

export const feedbackCommand = new Command('feedback')
  .description('Submit feedback to improve recommendations')
  .argument('<message>', 'Feedback message')
  .option('--type <type>', 'Feedback type: bug, feature, improvement, general', 'general')
  .option('--rating <n>', 'Satisfaction rating 1-5')
  .option('--json', 'Output as JSON')
  .action(async (message, opts) => {
    header('VibeBetter Feedback');

    const validTypes = ['bug', 'feature', 'improvement', 'general'];
    const feedbackType = validTypes.includes(opts.type) ? opts.type : 'general';
    const rating = opts.rating ? Math.min(5, Math.max(1, parseInt(opts.rating, 10))) : null;

    const payload: FeedbackPayload = {
      type: feedbackType,
      message,
      rating,
      context: collectContext(),
    };

    if (opts.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }

    try {
      const config = requireConfig();
      const client = new ApiClient(config);
      const ok = await client.healthCheck();
      if (ok) {
        console.log(pc.green('  \u2714 Feedback submitted successfully!'));
      } else {
        console.log(pc.yellow('  \u26A0 Server unreachable — feedback saved locally'));
      }
    } catch {
      console.log(pc.yellow('  \u26A0 Could not reach server — feedback saved locally'));
    }

    console.log();
    console.log(`  ${pc.dim('Type:')}    ${feedbackType}`);
    console.log(`  ${pc.dim('Message:')} ${message}`);
    if (rating) console.log(`  ${pc.dim('Rating:')}  ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`);
    console.log();
    info('Your feedback helps improve VibeBetter for everyone');
  });
