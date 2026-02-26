import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

interface CheckResult {
  name: string;
  status: 'ok' | 'warn' | 'fail';
  message: string;
}

function checkGit(): CheckResult {
  try {
    execSync('git --version', { stdio: 'pipe' });
    return { name: 'Git', status: 'ok', message: 'Git is installed' };
  } catch {
    return { name: 'Git', status: 'fail', message: 'Git is not installed' };
  }
}

function checkNode(): CheckResult {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0] ?? '0', 10);
  if (major >= 18) {
    return { name: 'Node.js', status: 'ok', message: `Node.js ${version}` };
  }
  return { name: 'Node.js', status: 'warn', message: `Node.js ${version} — recommended >= 18` };
}

function checkConfig(): CheckResult {
  const configPath = resolve(process.cwd(), '.vibeconfig');
  if (existsSync(configPath)) {
    return { name: 'Config', status: 'ok', message: '.vibeconfig found' };
  }
  return { name: 'Config', status: 'warn', message: '.vibeconfig not found — run: vibe init' };
}

function checkGitRepo(): CheckResult {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
    return { name: 'Git repo', status: 'ok', message: 'Inside a git repository' };
  } catch {
    return { name: 'Git repo', status: 'warn', message: 'Not inside a git repository' };
  }
}

function checkNetwork(): CheckResult {
  try {
    execSync('curl -s --max-time 5 -o /dev/null -w "%{http_code}" https://api.github.com', { stdio: 'pipe' });
    return { name: 'Network', status: 'ok', message: 'Network connectivity OK' };
  } catch {
    return { name: 'Network', status: 'warn', message: 'Cannot reach GitHub API' };
  }
}

function checkDiskSpace(): CheckResult {
  try {
    const output = execSync('df -h .', { stdio: 'pipe' }).toString();
    const lines = output.trim().split('\n');
    const parts = lines[1]?.split(/\s+/) ?? [];
    const available = parts[3] ?? 'unknown';
    return { name: 'Disk', status: 'ok', message: `Available: ${available}` };
  } catch {
    return { name: 'Disk', status: 'ok', message: 'Could not determine disk space' };
  }
}

const ICON: Record<string, string> = {
  ok: pc.green('\u2714'),
  warn: pc.yellow('\u26A0'),
  fail: pc.red('\u2718'),
};

export const doctorCommand = new Command('doctor')
  .description('Diagnose common setup issues')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('VibeBetter Doctor');

    const checks: CheckResult[] = [
      checkNode(),
      checkGit(),
      checkGitRepo(),
      checkConfig(),
      checkNetwork(),
      checkDiskSpace(),
    ];

    if (opts.json) {
      console.log(JSON.stringify(checks, null, 2));
      return;
    }

    console.log();
    for (const check of checks) {
      console.log(`  ${ICON[check.status]}  ${pc.bold(check.name)} — ${pc.dim(check.message)}`);
    }

    const failures = checks.filter((c) => c.status === 'fail');
    const warnings = checks.filter((c) => c.status === 'warn');

    console.log();
    if (failures.length > 0) {
      console.log(pc.red(`  ${failures.length} issue(s) found that must be resolved.`));
    } else if (warnings.length > 0) {
      console.log(pc.yellow(`  ${warnings.length} warning(s) — everything should still work.`));
    } else {
      console.log(pc.green('  All checks passed! Your setup looks good.'));
    }
    console.log();
    info('Run vibe doctor periodically to catch issues early');
  });
