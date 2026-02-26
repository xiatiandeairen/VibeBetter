import { Command } from 'commander';
import pc from 'picocolors';
import { execSync } from 'node:child_process';
import { header, info } from '../utils/display.js';

interface FileImpact {
  file: string;
  importedBy: string[];
  blastRadius: number;
  risk: 'low' | 'medium' | 'high';
}

function getChangedFiles(base: string): string[] {
  try {
    const output = execSync(`git diff --name-only ${base}`, { encoding: 'utf-8' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function estimateBlastRadius(file: string): FileImpact {
  const isShared = file.includes('shared/') || file.includes('utils/') || file.includes('lib/');
  const isType = file.endsWith('.d.ts') || file.includes('/types/');
  const isConfig = file.includes('config') || file.endsWith('.json');
  const isTest = file.includes('test') || file.includes('spec') || file.includes('__tests__');

  let radius = 1;
  if (isShared) radius += 5;
  if (isType) radius += 3;
  if (isConfig) radius += 4;
  if (isTest) radius = 0;

  const risk: FileImpact['risk'] =
    radius >= 6 ? 'high' : radius >= 3 ? 'medium' : 'low';

  const importedBy: string[] = [];
  if (isShared) importedBy.push('(broadly imported)');
  if (isType) importedBy.push('(type dependency)');

  return { file, importedBy, blastRadius: radius, risk };
}

function riskColor(risk: FileImpact['risk']): string {
  switch (risk) {
    case 'high': return pc.red('HIGH');
    case 'medium': return pc.yellow('MED');
    case 'low': return pc.green('LOW');
  }
}

export const impactCommand = new Command('impact')
  .description('Analyze blast radius of file changes')
  .option('--base <ref>', 'Git base ref for diff', 'HEAD~1')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Change Impact Analysis');

    const files = getChangedFiles(opts.base);

    if (files.length === 0) {
      console.log(pc.dim('  No changed files detected.'));
      return;
    }

    const impacts = files.map(estimateBlastRadius);

    if (opts.json) {
      console.log(JSON.stringify(impacts, null, 2));
      return;
    }

    impacts.sort((a, b) => b.blastRadius - a.blastRadius);

    console.log();
    for (const imp of impacts) {
      console.log(
        `  [${riskColor(imp.risk)}] ${pc.bold(imp.file)}  radius: ${imp.blastRadius}`,
      );
      if (imp.importedBy.length > 0) {
        console.log(`    ${pc.dim(imp.importedBy.join(', '))}`);
      }
    }

    const highCount = impacts.filter(i => i.risk === 'high').length;
    console.log();
    info(`${files.length} files changed — ${highCount} high-impact`);
  });
