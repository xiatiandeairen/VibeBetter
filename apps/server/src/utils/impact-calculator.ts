import { logger } from './logger.js';

export interface FileNode {
  file: string;
  imports: string[];
  importedBy: string[];
  linesOfCode: number;
}

export interface ImpactResult {
  file: string;
  directDependents: number;
  transitiveDependents: number;
  riskScore: number;
  blastRadius: 'low' | 'medium' | 'high' | 'critical';
}

export function calculateImpact(nodes: FileNode[]): ImpactResult[] {
  if (nodes.length === 0) {
    logger.warn('No file nodes provided for impact calculation');
    return [];
  }

  const nodeMap = new Map(nodes.map(n => [n.file, n]));
  const results: ImpactResult[] = [];

  for (const node of nodes) {
    const visited = new Set<string>();
    const queue = [...node.importedBy];

    while (queue.length > 0) {
      const dep = queue.shift()!;
      if (visited.has(dep)) continue;
      visited.add(dep);
      const depNode = nodeMap.get(dep);
      if (depNode) queue.push(...depNode.importedBy);
    }

    const directDependents = node.importedBy.length;
    const transitiveDependents = visited.size;
    const riskScore = Math.min(100, Math.round((transitiveDependents * 5) + (node.linesOfCode / 10)));

    let blastRadius: ImpactResult['blastRadius'];
    if (riskScore >= 80) blastRadius = 'critical';
    else if (riskScore >= 60) blastRadius = 'high';
    else if (riskScore >= 30) blastRadius = 'medium';
    else blastRadius = 'low';

    results.push({ file: node.file, directDependents, transitiveDependents, riskScore, blastRadius });
  }

  results.sort((a, b) => b.riskScore - a.riskScore);
  logger.info({ files: nodes.length, critical: results.filter(r => r.blastRadius === 'critical').length }, 'Impact calculation complete');
  return results;
}
