import { Command } from 'commander';
import pc from 'picocolors';
import simpleGit from 'simple-git';
import { readFileSync, existsSync } from 'fs';
import { header, success, warn, metric } from '../utils/display.js';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';

export const qualityCommand = new Command('quality')
  .description('Quick quality check of current changes')
  .action(async () => {
    header('Quality Check');
    const git = simpleGit();
    const status = await git.status();
    const changed = [...new Set([...status.modified, ...status.staged, ...status.created])];
    const tsFiles = changed.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

    if (tsFiles.length === 0) {
      success('No TypeScript changes to check');
      return;
    }

    metric('Files changed', changed.length);
    metric('TypeScript files', tsFiles.length);

    let totalLines = 0;
    let anyCount = 0;
    let consoleCount = 0;
    let todoCount = 0;
    let longFiles = 0;

    for (const file of tsFiles) {
      if (!existsSync(file)) continue;
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n').length;
      totalLines += lines;
      if (lines > 200) longFiles++;
      anyCount += (content.match(/:\s*any\b|as\s+any\b/g) || []).length;
      consoleCount += (content.match(/console\.(log|debug)\(/g) || []).length;
      todoCount += (content.match(/\/\/\s*(TODO|FIXME)/gi) || []).length;
    }

    console.log();
    console.log(pc.bold('  Code Quality:'));
    console.log(`  ${anyCount === 0 ? pc.green('✓') : pc.red('✗')} ${anyCount === 0 ? 'No any types' : `${anyCount} any type(s) found`}`);
    console.log(`  ${consoleCount === 0 ? pc.green('✓') : pc.yellow('⚠')} ${consoleCount === 0 ? 'No console.log' : `${consoleCount} console.log(s)`}`);
    console.log(`  ${todoCount === 0 ? pc.green('✓') : pc.yellow('⚠')} ${todoCount === 0 ? 'No TODOs' : `${todoCount} TODO(s)`}`);
    console.log(`  ${longFiles === 0 ? pc.green('✓') : pc.yellow('⚠')} ${longFiles === 0 ? 'All files ≤200 lines' : `${longFiles} file(s) >200 lines`}`);

    // AI impact assessment
    try {
      const config = requireConfig();
      const client = new ApiClient(config);
      const topFiles = await client.getTopFiles(100);
      const riskMap = new Map(topFiles.map(f => [f.filePath, f]));

      let aiFiles = 0;
      let highRisk = 0;
      for (const file of tsFiles) {
        const data = riskMap.get(file);
        if (data) {
          if ((data.aiCodeRatio ?? 0) > 0.3) aiFiles++;
          if (data.riskScore > 200) highRisk++;
        }
      }

      if (aiFiles > 0 || highRisk > 0) {
        console.log(pc.bold('\n  AI Impact:'));
        if (aiFiles > 0) console.log(`  ${pc.dim(`${aiFiles} file(s) in AI-heavy areas (>30% AI code)`)}`);
        if (highRisk > 0) console.log(`  ${pc.yellow(`⚠ ${highRisk} high-risk file(s) modified`)}`);
      }
    } catch { /* no config — offline mode */ }

    console.log();
    const totalIssues = anyCount + consoleCount + longFiles;
    if (totalIssues === 0) success('All quality checks passed');
    else warn(`${totalIssues} issue(s) to address`);
  });
