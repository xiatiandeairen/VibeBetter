import { logger } from './logger.js';

export interface SymbolDoc {
  name: string;
  kind: 'function' | 'class' | 'interface' | 'type' | 'variable';
  hasJSDoc: boolean;
  hasParamDocs: boolean;
  hasReturnDoc: boolean;
}

export interface DocAnalysisResult {
  file: string;
  symbols: SymbolDoc[];
  coverage: number;
  issues: string[];
}

export function analyzeDocumentation(
  files: { path: string; symbols: SymbolDoc[] }[],
): DocAnalysisResult[] {
  if (files.length === 0) {
    logger.warn('No files provided for documentation analysis');
    return [];
  }

  const results: DocAnalysisResult[] = [];

  for (const file of files) {
    const total = file.symbols.length;
    const documented = file.symbols.filter(s => s.hasJSDoc).length;
    const coverage = total > 0 ? Math.round((documented / total) * 100) : 100;

    const issues: string[] = [];
    for (const sym of file.symbols) {
      if (!sym.hasJSDoc) {
        issues.push(`Missing JSDoc for ${sym.kind} '${sym.name}'`);
      } else if (sym.kind === 'function' && !sym.hasParamDocs) {
        issues.push(`Missing @param docs for function '${sym.name}'`);
      } else if (sym.kind === 'function' && !sym.hasReturnDoc) {
        issues.push(`Missing @returns doc for function '${sym.name}'`);
      }
    }

    results.push({ file: file.path, symbols: file.symbols, coverage, issues });
  }

  const avgCoverage = Math.round(results.reduce((s, r) => s + r.coverage, 0) / results.length);
  logger.info({ files: results.length, avgCoverage, totalIssues: results.reduce((s, r) => s + r.issues.length, 0) }, 'Documentation analyzed');

  return results;
}
