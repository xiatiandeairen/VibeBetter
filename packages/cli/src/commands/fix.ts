import { Command } from 'commander';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, success, warn, riskBadge } from '../utils/display.js';
import pc from 'picocolors';

interface Suggestion {
  text: string;
  priority: 'high' | 'medium' | 'low';
}

function generateSuggestions(file: {
  filePath: string;
  cyclomaticComplexity: number;
  changeFrequency90d: number;
  linesOfCode: number;
  authorCount: number;
  aiCodeRatio: number | null;
}): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (file.linesOfCode > 200) {
    suggestions.push({
      text: `Split into smaller modules (${file.linesOfCode} lines, complexity ${file.cyclomaticComplexity})`,
      priority: 'high',
    });
  }

  if (file.cyclomaticComplexity > 15) {
    suggestions.push({
      text: `Reduce cyclomatic complexity (currently ${file.cyclomaticComplexity}, target <10)`,
      priority: 'high',
    });
  }

  if (file.changeFrequency90d > 10) {
    suggestions.push({
      text: `Reduce change frequency (${file.changeFrequency90d} changes in 90d — consider stabilizing interface)`,
      priority: 'medium',
    });
  }

  if (file.authorCount > 5) {
    suggestions.push({
      text: `Assign clear ownership (${file.authorCount} authors — consider CODEOWNERS)`,
      priority: 'low',
    });
  }

  if ((file.aiCodeRatio ?? 0) > 0.5) {
    suggestions.push({
      text: `Review AI-generated code quality (${((file.aiCodeRatio ?? 0) * 100).toFixed(0)}% AI ratio)`,
      priority: 'medium',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({ text: 'No specific issues detected', priority: 'low' });
  }

  return suggestions;
}

export const fixCommand = new Command('fix')
  .description('Suggest specific fixes for high-risk files')
  .option('--limit <n>', 'Number of files to analyze', '10')
  .action(async (opts: { limit: string }) => {
    header('Fix Suggestions');
    const config = requireConfig();
    const client = new ApiClient(config);

    try {
      const files = await client.getTopFiles(parseInt(opts.limit));

      if (files.length === 0) {
        success('No files to analyze. Run `vibe sync` to collect data first.');
        return;
      }

      let index = 0;
      for (const file of files) {
        index++;
        const risk = file.cyclomaticComplexity * file.changeFrequency90d;
        const badge = riskBadge(risk);
        console.log(`  ${pc.bold(String(index))}. ${pc.white(file.filePath)} (Risk: ${badge})`);

        const suggestions = generateSuggestions(file);
        for (const s of suggestions) {
          const icon = s.priority === 'high' ? pc.red('→') : s.priority === 'medium' ? pc.yellow('→') : pc.dim('→');
          console.log(`     ${icon} ${pc.dim(s.text)}`);
        }
        console.log();
      }

      const highRisk = files.filter(f => f.cyclomaticComplexity * f.changeFrequency90d > 200);
      if (highRisk.length > 0) {
        warn(`${highRisk.length} HIGH risk file(s) need attention`);
      }
      success(`Analyzed ${files.length} files with actionable suggestions.`);
    } catch (err) {
      console.error(`Fix suggestions failed: ${err instanceof Error ? err.message : 'Unknown'}`);
      console.error('  Tip: Run `vibe status` to check connection');
      process.exit(1);
    }
  });
