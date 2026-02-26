import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface DepInfo {
  file: string;
  imports: string[];
  importedBy: string[];
}

function extractImports(content: string, filePath: string): string[] {
  const imports: string[] = [];
  const importRegex = /(?:import\s+.*?from\s+['"](.+?)['"]|require\s*\(\s*['"](.+?)['"]\s*\))/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    const dep = match[1] ?? match[2]!;
    if (dep.startsWith('.')) {
      const resolved = path.resolve(path.dirname(filePath), dep);
      imports.push(resolved);
    } else {
      imports.push(dep);
    }
  }
  return imports;
}

function walkDir(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      results.push(...walkDir(full, extensions));
    } else if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

export const depsCommand = new Command('deps')
  .description('Analyze file dependencies using import statements')
  .argument('[dir]', 'Directory to analyze', '.')
  .option('--ext <extensions>', 'File extensions to include', '.ts,.js,.tsx,.jsx')
  .option('--file <path>', 'Show deps for a specific file')
  .option('--json', 'Output as JSON')
  .action(async (dir, opts) => {
    header('Dependency Analyzer');

    const baseDir = path.resolve(process.cwd(), dir);
    const extensions = opts.ext.split(',');
    const files = walkDir(baseDir, extensions);

    if (files.length === 0) {
      info('No files found with the specified extensions.');
      return;
    }

    const depMap = new Map<string, DepInfo>();

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const imports = extractImports(content, file);
      depMap.set(file, { file, imports, importedBy: [] });
    }

    for (const [file, depInfo] of depMap) {
      for (const imp of depInfo.imports) {
        for (const [candidate, candidateInfo] of depMap) {
          const withoutExt = candidate.replace(/\.\w+$/, '');
          if (imp === withoutExt || imp === candidate) {
            candidateInfo.importedBy.push(file);
          }
        }
      }
    }

    if (opts.file) {
      const resolved = path.resolve(process.cwd(), opts.file);
      const depInfo = depMap.get(resolved);
      if (!depInfo) {
        info(`File not found in analysis: ${opts.file}`);
        return;
      }
      if (opts.json) {
        console.log(JSON.stringify(depInfo, null, 2));
        return;
      }
      console.log(pc.bold(`  ${path.relative(baseDir, resolved)}`));
      console.log(`  ${pc.dim('Imports:')} ${depInfo.imports.length}`);
      for (const imp of depInfo.imports) console.log(`    → ${pc.cyan(path.relative(baseDir, imp))}`);
      console.log(`  ${pc.dim('Imported by:')} ${depInfo.importedBy.length}`);
      for (const ib of depInfo.importedBy) console.log(`    ← ${pc.yellow(path.relative(baseDir, ib))}`);
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(Array.from(depMap.values()), null, 2));
      return;
    }

    console.log(pc.bold(`  Analyzed ${files.length} files\n`));
    const sorted = Array.from(depMap.values()).sort((a, b) => b.importedBy.length - a.importedBy.length);
    const top = sorted.slice(0, 15);
    for (const d of top) {
      const rel = path.relative(baseDir, d.file);
      console.log(`  ${pc.cyan(rel.padEnd(50))} ${pc.dim('imports:')} ${d.imports.length}  ${pc.dim('imported-by:')} ${pc.bold(String(d.importedBy.length))}`);
    }
    if (sorted.length > 15) console.log(pc.dim(`  ... and ${sorted.length - 15} more files`));
    console.log();
  });
