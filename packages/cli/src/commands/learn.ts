import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';

interface LearningTopic {
  id: string;
  title: string;
  category: string;
  summary: string;
  tips: string[];
}

const TOPICS: LearningTopic[] = [
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering for Code',
    category: 'AI Coding',
    summary: 'Write effective prompts to get better AI-generated code.',
    tips: [
      'Be specific about language, framework, and patterns',
      'Provide context: file structure, dependencies, conventions',
      'Ask for tests alongside implementation',
      'Review AI output critically — never accept blindly',
    ],
  },
  {
    id: 'ai-review',
    title: 'Reviewing AI-Generated Code',
    category: 'AI Coding',
    summary: 'Best practices for reviewing code produced by AI assistants.',
    tips: [
      'Check edge cases AI may have overlooked',
      'Verify error handling and security implications',
      'Ensure naming conventions match your codebase',
      'Run tests before merging any AI-generated PR',
    ],
  },
  {
    id: 'risk-management',
    title: 'Managing Structural Risk',
    category: 'Engineering',
    summary: 'Use PSRI and risk metrics to keep your codebase healthy.',
    tips: [
      'Monitor PSRI weekly — track the trend, not just the number',
      'Address high-risk hotspots before adding new features',
      'Use vibe check before every commit',
      'Set team goals for risk reduction each sprint',
    ],
  },
  {
    id: 'metrics-culture',
    title: 'Building a Metrics Culture',
    category: 'Team',
    summary: 'Foster data-driven engineering decisions in your team.',
    tips: [
      'Share vibe digest reports in standups',
      'Celebrate improvements with vibe celebrate',
      'Use metrics for insight, not punishment',
      'Let trends guide refactoring priorities',
    ],
  },
];

export const learnCommand = new Command('learn')
  .description('Educational content about AI coding best practices')
  .argument('[topic]', 'Topic ID to learn about')
  .option('--list', 'List all available topics')
  .action(async (topic, opts) => {
    header('Learn — AI Coding Best Practices');

    if (opts.list || !topic) {
      console.log();
      for (const t of TOPICS) {
        console.log(`  ${pc.bold(pc.cyan(t.id))}  ${pc.dim(`[${t.category}]`)}`);
        console.log(`    ${t.title}`);
      }
      console.log();
      info(`Run ${pc.bold('vibe learn <topic-id>')} for details.`);
      return;
    }

    const found = TOPICS.find(t => t.id === topic);
    if (!found) {
      console.log(pc.red(`  Topic "${topic}" not found.`));
      info('Use --list to see available topics.');
      return;
    }

    console.log();
    console.log(`  ${pc.bold(pc.cyan(found.title))}  ${pc.dim(`[${found.category}]`)}`);
    console.log(`  ${found.summary}`);
    console.log();
    for (const tip of found.tips) {
      console.log(`  ${pc.green('•')} ${tip}`);
    }
    console.log();
  });
