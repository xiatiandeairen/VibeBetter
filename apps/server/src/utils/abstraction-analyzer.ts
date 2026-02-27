import { logger } from './logger.js';

export interface ModuleInfo {
  file: string;
  exports: number;
  imports: number;
  depthLayers: number;
  publicApi: string[];
  internalLeaks: string[];
}

export interface AbstractionIssue {
  file: string;
  issue: 'god-module' | 'too-abstract' | 'too-concrete' | 'leaky-abstraction';
  severity: 'high' | 'medium' | 'low';
  detail: string;
  suggestion: string;
}

export function analyzeAbstractions(
  modules: ModuleInfo[],
  maxExports = 20,
  maxDepth = 4,
): AbstractionIssue[] {
  if (modules.length === 0) {
    logger.warn('No modules provided for abstraction analysis');
    return [];
  }

  const issues: AbstractionIssue[] = [];

  for (const mod of modules) {
    if (mod.exports > maxExports) {
      issues.push({
        file: mod.file,
        issue: 'god-module',
        severity: mod.exports > maxExports * 2 ? 'high' : 'medium',
        detail: `${mod.exports} exports, exceeds threshold of ${maxExports}`,
        suggestion: 'Split into focused sub-modules',
      });
    }

    if (mod.depthLayers > maxDepth) {
      issues.push({
        file: mod.file,
        issue: 'too-abstract',
        severity: mod.depthLayers > maxDepth + 2 ? 'high' : 'low',
        detail: `${mod.depthLayers} layers of indirection`,
        suggestion: 'Flatten abstractions where possible',
      });
    }

    if (mod.internalLeaks.length > 0) {
      issues.push({
        file: mod.file,
        issue: 'leaky-abstraction',
        severity: mod.internalLeaks.length > 3 ? 'high' : 'medium',
        detail: `Leaks: ${mod.internalLeaks.join(', ')}`,
        suggestion: 'Encapsulate internal details behind public API',
      });
    }

    if (mod.exports > 0 && mod.imports === 0 && mod.depthLayers === 0) {
      issues.push({
        file: mod.file,
        issue: 'too-concrete',
        severity: 'low',
        detail: 'No abstractions or shared imports',
        suggestion: 'Consider extracting reusable patterns',
      });
    }
  }

  issues.sort((a, b) => {
    const sevOrder = { high: 0, medium: 1, low: 2 };
    return sevOrder[a.severity] - sevOrder[b.severity];
  });

  logger.info({ modules: modules.length, issues: issues.length }, 'Abstraction analysis complete');
  return issues;
}
