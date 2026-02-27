import { logger } from './logger.js';

export interface ImportInfo {
  source: string;
  specifiers: string[];
  isTypeOnly: boolean;
  isDynamic: boolean;
}

export interface ResolvedDependency {
  filePath: string;
  imports: ImportInfo[];
  depth: number;
  isCircular: boolean;
}

export function resolveImports(fileContent: string, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = [];
  const staticImportRegex = /import\s+(?:type\s+)?(?:\{([^}]*)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  let match: RegExpExecArray | null;

  while ((match = staticImportRegex.exec(fileContent)) !== null) {
    const specifiers = (match[1] ?? match[2] ?? '').split(',').map(s => s.trim()).filter(Boolean);
    const source = match[3]!;
    const isTypeOnly = fileContent.substring(match.index, match.index + 15).includes('import type');
    imports.push({ source, specifiers, isTypeOnly, isDynamic: false });
  }

  while ((match = dynamicImportRegex.exec(fileContent)) !== null) {
    imports.push({ source: match[1]!, specifiers: [], isTypeOnly: false, isDynamic: true });
  }

  logger.debug({ filePath, importCount: imports.length }, 'Resolved file imports');
  return imports;
}

export function buildDependencyTree(
  files: Map<string, string>,
  entryPoint: string,
  maxDepth = 10,
): ResolvedDependency[] {
  const result: ResolvedDependency[] = [];
  const visited = new Set<string>();

  function walk(filePath: string, depth: number): void {
    if (depth > maxDepth || visited.has(filePath)) {
      if (visited.has(filePath)) {
        result.push({ filePath, imports: [], depth, isCircular: true });
      }
      return;
    }

    visited.add(filePath);
    const content = files.get(filePath);
    if (!content) return;

    const imports = resolveImports(content, filePath);
    result.push({ filePath, imports, depth, isCircular: false });

    for (const imp of imports) {
      if (!imp.isTypeOnly && !imp.isDynamic) {
        walk(imp.source, depth + 1);
      }
    }
  }

  walk(entryPoint, 0);
  logger.info({ entryPoint, totalResolved: result.length }, 'Dependency tree built');
  return result;
}
