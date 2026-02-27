export interface ComplianceSection {
  id: string;
  name: string;
  framework: string;
  findings: Finding[];
  score: number;
  maxScore: number;
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable';
}

export interface Finding {
  id: string;
  sectionId: string;
  rule: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pass' | 'fail' | 'warning' | 'exception';
  description: string;
  evidence: string;
  remediation?: Remediation;
  detectedAt: Date;
}

export interface Remediation {
  description: string;
  steps: string[];
  effort: 'trivial' | 'small' | 'medium' | 'large';
  deadline?: Date;
  assignee?: string;
  automated: boolean;
  fixCommand?: string;
}

export interface ComplianceReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  framework: string;
  sections: ComplianceSection[];
  overallScore: number;
  overallStatus: ComplianceSection['status'];
  previousScore?: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface ComplianceConfig {
  frameworks: string[];
  autoScan: boolean;
  scanIntervalHours: number;
  failOnCritical: boolean;
  exemptions: { findingId: string; reason: string; expiresAt?: Date }[];
}
