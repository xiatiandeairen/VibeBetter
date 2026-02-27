export interface DependencyNode {
  id: string;
  filePath: string;
  module: string;
  imports: string[];
  importedBy: string[];
  depth: number;
  isEntryPoint: boolean;
  metadata: Record<string, unknown>;
}

export interface DependencyEdge {
  source: string;
  target: string;
  type: 'static' | 'dynamic' | 'type-only' | 're-export';
  weight: number;
}

export interface GraphLayout {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  rootNodes: string[];
  leafNodes: string[];
  maxDepth: number;
  circularDependencies: string[][];
  totalNodes: number;
  totalEdges: number;
}

export interface GraphFilter {
  maxDepth: number | null;
  includeNodeModules: boolean;
  includeTypeImports: boolean;
  pathPattern: string | null;
  excludePatterns: string[];
}
