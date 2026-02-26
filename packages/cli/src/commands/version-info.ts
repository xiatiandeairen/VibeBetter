import { Command } from 'commander';
import pc from 'picocolors';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { header } from '../utils/display.js';

interface PackageVersion {
  name: string;
  version: string;
  path: string;
}

function findPackageVersions(root: string): PackageVersion[] {
  const results: PackageVersion[] = [];
  const dirs = ['packages/cli', 'packages/shared', 'packages/db', 'apps/web', 'apps/server'];

  for (const dir of dirs) {
    const pkgPath = path.join(root, dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        results.push({ name: pkg.name ?? dir, version: pkg.version ?? 'unknown', path: dir });
      } catch {
        results.push({ name: dir, version: 'error', path: dir });
      }
    }
  }

  const rootPkg = path.join(root, 'package.json');
  if (fs.existsSync(rootPkg)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(rootPkg, 'utf-8'));
      results.unshift({ name: pkg.name ?? 'root', version: pkg.version ?? 'unknown', path: '.' });
    } catch {}
  }

  return results;
}

export const versionInfoCommand = new Command('version')
  .description('Show detailed version info for all packages')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Version Info');

    const root = process.cwd();
    const packages = findPackageVersions(root);
    const nodeVersion = process.version;
    const platform = `${process.platform} ${process.arch}`;

    const info = {
      runtime: { node: nodeVersion, platform },
      packages,
    };

    if (opts.json) {
      console.log(JSON.stringify(info, null, 2));
      return;
    }

    console.log(pc.bold('  Runtime'));
    console.log(`    Node.js:  ${pc.cyan(nodeVersion)}`);
    console.log(`    Platform: ${pc.cyan(platform)}`);
    console.log();

    console.log(pc.bold('  Packages'));
    console.log(`    ${'Name'.padEnd(30)} ${'Version'.padEnd(15)} Path`);
    console.log(`    ${pc.dim('─'.repeat(60))}`);
    for (const pkg of packages) {
      console.log(`    ${pkg.name.padEnd(30)} ${pc.green(pkg.version.padEnd(15))} ${pc.dim(pkg.path)}`);
    }
    console.log();
  });
