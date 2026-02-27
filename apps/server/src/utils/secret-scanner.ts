import { logger } from './logger.js';

export interface SecretFinding {
  file: string;
  line: number;
  pattern: string;
  severity: 'critical' | 'high' | 'medium';
  snippet: string;
  suggestion: string;
}

interface ScanPattern {
  name: string;
  regex: RegExp;
  severity: 'critical' | 'high' | 'medium';
  suggestion: string;
}

const PATTERNS: ScanPattern[] = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g, severity: 'critical', suggestion: 'Use environment variables or AWS Secrets Manager' },
  { name: 'Generic API Key', regex: /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/gi, severity: 'high', suggestion: 'Move to environment variables' },
  { name: 'Private Key', regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g, severity: 'critical', suggestion: 'Never commit private keys — use a secret manager' },
  { name: 'JWT Secret', regex: /jwt[_-]?secret\s*[:=]\s*['"][^'"]{8,}['"]/gi, severity: 'high', suggestion: 'Use environment variables for JWT secrets' },
  { name: 'Database URL', regex: /(?:postgres|mysql|mongodb):\/\/[^:]+:[^@]+@/gi, severity: 'high', suggestion: 'Use DATABASE_URL environment variable' },
  { name: 'Hardcoded Password', regex: /password\s*[:=]\s*['"][^'"]{4,}['"]/gi, severity: 'medium', suggestion: 'Replace with environment variable or config' },
];

export function scanFileContent(filePath: string, content: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] as string;
    for (const pattern of PATTERNS) {
      pattern.regex.lastIndex = 0;
      if (pattern.regex.test(line)) {
        const masked = line.substring(0, 60) + (line.length > 60 ? '...' : '');
        findings.push({
          file: filePath,
          line: i + 1,
          pattern: pattern.name,
          severity: pattern.severity,
          snippet: masked,
          suggestion: pattern.suggestion,
        });
      }
    }
  }

  if (findings.length > 0) {
    logger.warn({ file: filePath, findings: findings.length }, 'Potential secrets detected');
  }

  return findings;
}

export function scanMultipleFiles(files: Array<{ path: string; content: string }>): SecretFinding[] {
  const allFindings: SecretFinding[] = [];
  for (const file of files) {
    allFindings.push(...scanFileContent(file.path, file.content));
  }

  logger.info({ filesScanned: files.length, totalFindings: allFindings.length }, 'Secret scan complete');
  return allFindings;
}
