import { Command } from 'commander';
import pc from 'picocolors';
import simpleGit from 'simple-git';
import { readFileSync, existsSync } from 'fs';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header } from '../utils/display.js';

export const contextCommand = new Command('context')
  .description('Generate file context for AI coding — paste this into your AI chat')
  .argument('<file>', 'File path to analyze')
  .action(async (file: string) => {
    header(`Context: ${file}`);
    const config = requireConfig();
    const client = new ApiClient(config);
    const git = simpleGit();

    // File profile from API
    const topFiles = await client.getTopFiles(100).catch(() => []);
    const fileData = topFiles.find(f => f.filePath.includes(file));

    if (fileData) {
      console.log(pc.bold('\n## File Profile'));
      console.log(`  Complexity: ${fileData.cyclomaticComplexity}${fileData.cyclomaticComplexity > 15 ? pc.red(' (HIGH)') : pc.green(' (OK)')}`);
      console.log(`  Changes (90d): ${fileData.changeFrequency90d}`);
      console.log(`  LOC: ${fileData.linesOfCode}`);
      console.log(`  Authors: ${fileData.authorCount}`);
      console.log(`  AI Code: ${fileData.aiCodeRatio ? `${(fileData.aiCodeRatio * 100).toFixed(0)}%` : 'unknown'}`);
      console.log(`  Risk Score: ${fileData.riskScore}${fileData.riskScore > 200 ? pc.red(' (HIGH)') : fileData.riskScore > 50 ? pc.yellow(' (MEDIUM)') : pc.green(' (LOW)')}`);
    }

    // Dependencies — read file and extract imports
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf-8');
      const imports = content.match(/from\s+['"]([^'"]+)['"]/g) || [];
      if (imports.length > 0) {
        console.log(pc.bold('\n## Dependencies'));
        for (const imp of imports.slice(0, 10)) {
          console.log(`  ${pc.dim(imp.replace(/from\s+['"]/, '').replace(/['"]/, ''))}`);
        }
      }

      // File size check
      const lines = content.split('\n').length;
      console.log(pc.bold('\n## Size'));
      console.log(`  Lines: ${lines}${lines > 200 ? pc.red(' (⚠ exceeds 200-line guideline)') : pc.green(' (OK)')}`);
    }

    // Recent changes from git
    try {
      const log = await git.log({ file, maxCount: 5 });
      if (log.all.length > 0) {
        console.log(pc.bold('\n## Recent Changes'));
        for (const commit of log.all) {
          console.log(`  ${pc.dim(commit.date.split('T')[0])} ${commit.message.slice(0, 60)}`);
        }
      }
    } catch { /* not in git */ }

    // Project rules
    if (existsSync('.vibe/rules.yaml') || existsSync('.vibe/rules.json')) {
      console.log(pc.bold('\n## Project Rules'));
      console.log(`  ${pc.dim('See .vibe/rules.yaml for constraints')}`);
    }

    // Boundary conditions hints
    console.log(pc.bold('\n## Boundary Conditions to Watch'));
    console.log(`  ${pc.dim('- What if input is null/undefined/empty?')}`);
    console.log(`  ${pc.dim('- What if the array has 0 elements?')}`);
    console.log(`  ${pc.dim('- What if the API call fails?')}`);
    console.log(`  ${pc.dim('- What about concurrent access?')}`);

    console.log(pc.dim('\n💡 Copy this output and paste it into your AI coding chat for better context.'));
  });
