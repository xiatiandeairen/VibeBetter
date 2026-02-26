import { Command } from 'commander';
import pc from 'picocolors';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { header, info } from '../utils/display.js';

interface PackageInfo {
  name: string;
  path: string;
  hasSrc: boolean;
  hasTests: boolean;
  dependencyCount: number;
  risk: 'low' | 'medium' | 'high';
}

function detectPackages(root: string, dirs: string[]): PackageInfo[] {
  const packages: PackageInfo[] = [];

  for (const dir of dirs) {
    const base = join(root, dir);
    if (!existsSync(base)) continue;

    const entries = readdirSync(base, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const pkgJsonPath = join(base, entry.name, 'package.json');
      if (!existsSync(pkgJsonPath)) continue;

      try {
        const raw = readFileSync(pkgJsonPath, 'utf-8');
        const pkg = JSON.parse(raw) as Record<string, unknown>;
        const deps = Object.keys((pkg['dependencies'] as Record<string, string>) ?? {});
        const devDeps = Object.keys((pkg['devDependencies'] as Record<string, string>) ?? {});
        const totalDeps = deps.length + devDeps.length;

        const pkgPath = join(dir, entry.name);
        const hasSrc = existsSync(join(base, entry.name, 'src'));
        const hasTests = existsSync(join(base, entry.name, '__tests__')) ||
          existsSync(join(base, entry.name, 'tests')) ||
          existsSync(join(base, entry.name, 'test'));

        const risk: PackageInfo['risk'] =
          totalDeps > 20 ? 'high' : totalDeps > 10 ? 'medium' : 'low';

        packages.push({
          name: (pkg['name'] as string) ?? entry.name,
          path: pkgPath,
          hasSrc,
          hasTests,
          dependencyCount: totalDeps,
          risk,
        });
      } catch {
        // skip invalid package.json
      }
    }
  }

  return packages;
}

function riskIcon(risk: PackageInfo['risk']): string {
  switch (risk) {
    case 'high': return pc.red('●');
    case 'medium': return pc.yellow('●');
    case 'low': return pc.green('●');
  }
}

export const monorepoCommand = new Command('monorepo')
  .description('Analyze monorepo structure and per-package risk')
  .option('--root <dir>', 'Project root', '.')
  .option('--dirs <dirs>', 'Comma-separated package directories', 'packages,apps')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Monorepo Analysis');

    const dirs = (opts.dirs as string).split(',').map((d: string) => d.trim());
    const packages = detectPackages(opts.root, dirs);

    if (opts.json) {
      console.log(JSON.stringify(packages, null, 2));
      return;
    }

    if (packages.length === 0) {
      console.log(pc.dim('  No packages found.'));
      return;
    }

    console.log();
    for (const pkg of packages) {
      const tests = pkg.hasTests ? pc.green('tests ✓') : pc.dim('no tests');
      const src = pkg.hasSrc ? pc.green('src ✓') : pc.dim('no src');
      console.log(
        `  ${riskIcon(pkg.risk)} ${pc.bold(pkg.name)}  ${pc.dim(pkg.path)}`,
      );
      console.log(
        `    deps: ${pkg.dependencyCount}  ${src}  ${tests}`,
      );
    }

    const high = packages.filter(p => p.risk === 'high').length;
    const medium = packages.filter(p => p.risk === 'medium').length;
    console.log();
    info(`${packages.length} packages — ${high} high risk, ${medium} medium risk`);
  });
