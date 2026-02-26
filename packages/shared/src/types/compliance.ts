export type ComplianceStandard = 'soc2' | 'iso27001' | 'gdpr' | 'hipaa' | 'pci_dss' | 'nist' | 'cis' | 'custom';
export type CheckStatus = 'passed' | 'failed' | 'warning' | 'not_applicable' | 'pending';
export type CheckSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type ReportStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

export interface ComplianceFramework {
  id: string;
  standard: ComplianceStandard;
  name: string;
  version: string;
  description: string;
  controls: ComplianceControl[];
  applicableTo: string[];
  effectiveDate: Date;
  reviewCycle: 'monthly' | 'quarterly' | 'annually';
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceControl {
  id: string;
  frameworkId: string;
  controlId: string;
  title: string;
  description: string;
  category: string;
  checks: ComplianceCheck[];
  evidence: ComplianceEvidence[];
  parentControlId: string | null;
  required: boolean;
}

export interface ComplianceCheck {
  id: string;
  controlId: string;
  name: string;
  description: string;
  status: CheckStatus;
  severity: CheckSeverity;
  automated: boolean;
  lastCheckedAt: Date | null;
  nextCheckAt: Date | null;
  remediationSteps: string[];
  affectedResources: string[];
  assignee: string | null;
  dueDate: Date | null;
}

export interface ComplianceEvidence {
  id: string;
  controlId: string;
  type: 'document' | 'screenshot' | 'log' | 'configuration' | 'automated_scan';
  title: string;
  description: string;
  url: string | null;
  collectedAt: Date;
  expiresAt: Date | null;
  collector: string;
}

export interface ComplianceReport {
  id: string;
  frameworkId: string;
  organizationId: string;
  title: string;
  status: ReportStatus;
  period: string;
  overallScore: number;
  totalControls: number;
  passedControls: number;
  failedControls: number;
  warningControls: number;
  notApplicableControls: number;
  criticalFindings: ComplianceFinding[];
  generatedAt: Date;
  approvedBy: string | null;
  approvedAt: Date | null;
}

export interface ComplianceFinding {
  checkId: string;
  controlId: string;
  severity: CheckSeverity;
  title: string;
  description: string;
  recommendation: string;
  riskScore: number;
  deadline: Date | null;
}
