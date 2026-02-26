import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { header, info } from '../utils/display.js';

interface DepEdge {
  from: string;
  to: string;
}

function extractImports(content: string, filePath: string): string[] {
  const imports: string[] = [];
  const regex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const dep = match[1] ?? '';
    if (dep.startsWith('.')) {
      imports.push(dep);
    }
  }
  return imports;
}

function buildDotGraph(edges: DepEdge[], projectId: string): string {
  const lines: string[] = [];
  lines.push(`digraph "${projectId}_dependencies" {`);
  lines.push('  rankdir=LR;');
  lines.push('  node [shape=box, style=rounded, fontname="Helvetica", fontsize=10];');
  lines.push('  edge [color="#666666"];');
  lines.push('');

  const nodes = new Set<string>();
  for (const edge of edges) {
    nodes.add(edge.from);
    nodes.add(edge.to);
  }

  for (const node of nodes) {
    const label = node.replace(/^.*\//, '');
    lines.push(`  "${node}" [label="${label}"];`);
  }

  lines.push('');

  for (const edge of edges) {
    lines.push(`  "${edge.from}" -> "${edge.to}";`);
  }

  lines.push('}');
  return lines.join('\n');
}

export const graphCommand = new Command('graph')
  .description('Generate dependency graph in DOT format')
  .option('--root <dir>', 'Root directory to scan', 'src')
  .option('--output <file>', 'Write DOT output to file')
  .option('--include <ext>', 'File extensions to include', 'ts,js')
  .action(async (opts) => {
    header('Dependency Graph');

    const config = requireConfig();
    const projectId = config.projectId ?? 'default';
    const fs = await import('node:fs');
    const path = await import('node:path');

    const extensions = opts.include.split(',').map((e: string) => `.${e.trim()}`);
    const root = path.resolve(opts.root);

    if (!fs.existsSync(root)) {
      console.log(pc.red(`Directory not found: ${root}`));
      return;
    }

    const edges: DepEdge[] = [];

    function walk(dir: string): void {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walk(full);
        } else if (entry.isFile() && extensions.some((ext: string) => entry.name.endsWith(ext))) {
          const content = fs.readFileSync(full, 'utf-8');
          const rel = path.relative(root, full);
          const imports = extractImports(content, rel);
          for (const imp of imports) {
            edges.push({ from: rel, to: imp });
          }
        }
      }
    }

    walk(root);

    const dot = buildDotGraph(edges, projectId);

    if (opts.output) {
      fs.writeFileSync(opts.output, dot, 'utf-8');
      info(`DOT graph written to ${pc.bold(opts.output)}`);
    } else {
      console.log(dot);
    }

    console.log();
    info(`Found ${pc.bold(String(edges.length))} dependency edges`);
    info('Render with: dot -Tpng graph.dot -o graph.png');
  });
