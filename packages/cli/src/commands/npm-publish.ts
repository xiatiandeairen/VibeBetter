import { Command } from 'commander';
import pc from 'picocolors';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { header, info } from '../utils/display.js';

interface PublishCheck {
  name: string;
  passed: boolean;
  message: string;
}

function runChecks(root: string): PublishCheck[] {
  const checks: PublishCheck[] = [];

  const pkgPath = join(root, 'package.json');
  if (!existsSync(pkgPath)) {
    checks.push({ name: 'package.json', passed: false, message: 'package.json not found' });
    return checks;
  }

  const raw = readFileSync(pkgPath, 'utf-8');
  const pkg = JSON.parse(raw) as Record<string, unknown>;

  checks.push({
    name: 'name',
    passed: typeof pkg['name'] === 'string' && (pkg['name'] as string).length > 0,
    message: pkg['name'] ? `name: ${pkg['name']}` : 'Missing "name" field',
  });

  checks.push({
    name: 'version',
    passed: typeof pkg['version'] === 'string',
    message: pkg['version'] ? `version: ${pkg['version']}` : 'Missing "version" field',
  });

  checks.push({
    name: 'main/exports',
    passed: !!(pkg['main'] || pkg['exports']),
    message: (pkg['main'] || pkg['exports']) ? 'Entry point defined' : 'No "main" or "exports" field',
  });

  checks.push({
    name: 'license',
    passed: typeof pkg['license'] === 'string',
    message: pkg['license'] ? `license: ${pkg['license']}` : 'Missing "license" field',
  });

  const hasReadme = existsSync(join(root, 'README.md'));
  checks.push({
    name: 'README.md',
    passed: hasReadme,
    message: hasReadme ? 'README.md present' : 'Missing README.md',
  });

  const isPrivate = pkg['private'] === true;
  checks.push({
    name: 'not private',
    passed: !isPrivate,
    message: isPrivate ? '"private": true — cannot publish' : 'Package is publishable',
  });

  const hasFiles = Array.isArray(pkg['files']);
  checks.push({
    name: 'files field',
    passed: hasFiles,
    message: hasFiles ? `files: ${(pkg['files'] as string[]).join(', ')}` : 'No "files" field — entire directory will be published',
  });

  return checks;
}

export const npmPublishCommand = new Command('npm-publish')
  .description('Check package readiness for npm publishing')
  .option('--root <dir>', 'Package root directory', '.')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('npm Publish Readiness');

    const checks = runChecks(opts.root);

    if (opts.json) {
      console.log(JSON.stringify(checks, null, 2));
      return;
    }

    console.log();
    for (const check of checks) {
      const icon = check.passed ? pc.green('✓') : pc.red('✗');
      console.log(`  ${icon} ${pc.bold(check.name)}: ${pc.dim(check.message)}`);
    }

    const passed = checks.filter(c => c.passed).length;
    const total = checks.length;
    console.log();
    info(`${passed}/${total} checks passed`);

    if (passed === total) {
      console.log(pc.green(pc.bold('  Ready to publish! Run: npm publish')));
    } else {
      console.log(pc.yellow('  Fix the issues above before publishing.'));
    }
  });
