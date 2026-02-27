import { Command } from 'commander';
import pc from 'picocolors';
import simpleGit from 'simple-git';
import { readFileSync, existsSync } from 'fs';
import { header, success, warn, metric } from '../utils/display.js';

export const commitCommand = new Command('commit')
  .description('Validate staged changes and suggest commit message')
  .action(async () => {
    header('Commit Check');
    const git = simpleGit();
    const status = await git.status();

    if (status.staged.length === 0) {
      warn('Nothing staged. Run `git add` first.');
      return;
    }

    metric('Staged files', status.staged.length);

    let issues = 0;
    const tsFiles = status.staged.filter(
      (f) => (f.endsWith('.ts') || f.endsWith('.tsx')) && existsSync(f),
    );

    for (const file of tsFiles) {
      const content = readFileSync(file, 'utf-8');
      if (/:\s*any\b/.test(content)) {
        issues++;
        console.log(`  ${pc.yellow('⚠')} ${file}: contains \`any\` type`);
      }
      if (/console\.(log|debug)\(/.test(content)) {
        issues++;
        console.log(`  ${pc.yellow('⚠')} ${file}: contains console.log`);
      }
      if (/\/\/\s*(TODO|FIXME)/i.test(content)) {
        issues++;
        console.log(`  ${pc.yellow('⚠')} ${file}: has TODO/FIXME`);
      }
    }

    if (issues > 0) {
      console.log();
      warn(`${issues} issue(s) in staged files — consider fixing first`);
    }

    const fileTypes = new Map<string, number>();
    for (const f of status.staged) {
      if (f.includes('test')) fileTypes.set('test', (fileTypes.get('test') ?? 0) + 1);
      else if (f.includes('docs/') || f.endsWith('.md'))
        fileTypes.set('docs', (fileTypes.get('docs') ?? 0) + 1);
      else if (f.includes('routes/') || f.includes('commands/'))
        fileTypes.set('feat', (fileTypes.get('feat') ?? 0) + 1);
      else if (f.includes('utils/') || f.includes('middleware/'))
        fileTypes.set('refactor', (fileTypes.get('refactor') ?? 0) + 1);
      else fileTypes.set('chore', (fileTypes.get('chore') ?? 0) + 1);
    }

    const primaryType =
      Array.from(fileTypes.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'chore';

    const scopes = new Set<string>();
    for (const f of status.staged) {
      if (f.includes('server/')) scopes.add('server');
      if (f.includes('web/')) scopes.add('web');
      if (f.includes('cli/')) scopes.add('cli');
      if (f.includes('shared/')) scopes.add('shared');
    }
    const scope = scopes.size === 1 ? Array.from(scopes)[0] : scopes.size > 1 ? 'all' : '';

    console.log(pc.bold('\n  Suggested commit message:'));
    console.log(
      `  ${pc.green(`${primaryType}${scope ? `(${scope})` : ''}: <describe your change>`)}`,
    );
    console.log();

    if (issues === 0) {
      success('Ready to commit');
    }
    console.log(pc.dim(`  Run: git commit -m "${primaryType}${scope ? `(${scope})` : ''}: ..."`));
  });
