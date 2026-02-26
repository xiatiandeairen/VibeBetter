export interface DecisionRule {
  id: string;
  name: string;
  condition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
  };
  action: {
    level: 'CRITICAL' | 'WARNING' | 'INFO';
    category: string;
    title: string;
    description: string;
  };
}

export const DEFAULT_RULES: DecisionRule[] = [
  { id: 'r1', name: 'AI Success High', condition: { metric: 'aiSuccessRate', operator: 'gt', value: 0.8 }, action: { level: 'INFO', category: 'AI_USAGE', title: 'Expand AI usage', description: 'AI coding is performing well.' } },
  { id: 'r2', name: 'PSRI High Risk', condition: { metric: 'psriScore', operator: 'gt', value: 0.6 }, action: { level: 'CRITICAL', category: 'RISK', title: 'High structural risk', description: 'PSRI exceeds 0.6 threshold.' } },
  { id: 'r3', name: 'TDI Critical', condition: { metric: 'tdiScore', operator: 'gt', value: 0.7 }, action: { level: 'CRITICAL', category: 'TECH_DEBT', title: 'Tech debt sprint needed', description: 'TDI exceeds 0.7 threshold.' } },
  { id: 'r4', name: 'Hotspot Warning', condition: { metric: 'hotspotFiles', operator: 'gt', value: 5 }, action: { level: 'WARNING', category: 'CODE_QUALITY', title: 'Hotspot files need attention', description: 'Multiple hotspot files detected.' } },
];
