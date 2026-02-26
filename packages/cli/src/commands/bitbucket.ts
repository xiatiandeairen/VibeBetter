import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface BitbucketReport {
  title: string;
  reporter: string;
  report_type: string;
  result: 'PASSED' | 'FAILED' | 'PENDING';
  details: string;
  data: BitbucketAnnotation[];
}

interface BitbucketAnnotation {
  external_id: string;
  annotation_type: 'VULNERABILITY' | 'CODE_SMELL' | 'BUG';
  summary: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  path: string;
  line: number;
}

function mapSeverity(riskScore: number): BitbucketAnnotation['severity'] {
  if (riskScore >= 0.8) return 'CRITICAL';
  if (riskScore >= 0.6) return 'HIGH';
  if (riskScore >= 0.4) return 'MEDIUM';
  return 'LOW';
}

export const bitbucketCommand = new Command('bitbucket')
  .description('Format output for Bitbucket integration')
  .option('--threshold <n>', 'PSRI threshold for pass/fail', '0.6')
  .option('--json', 'Output raw JSON')
  .action(async (opts) => {
    header('Bitbucket Integration');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const threshold = parseFloat(opts.threshold);
    const psri = overview.psriScore ?? 0;
    const topFiles = await client.getTopFiles(100).catch(() => null);
    const fileList = topFiles ?? [];

    const annotations: BitbucketAnnotation[] = fileList
      .filter((f) => f.riskScore > 0.3)
      .slice(0, 50)
      .map((f, i) => ({
        external_id: `vibe-${i}`,
        annotation_type: 'CODE_SMELL' as const,
        summary: `Risk score: ${f.riskScore.toFixed(3)}`,
        severity: mapSeverity(f.riskScore),
        path: f.filePath,
        line: 1,
      }));

    const report: BitbucketReport = {
      title: 'VibeBetter Analysis',
      reporter: 'VibeBetter',
      report_type: 'SECURITY',
      result: psri <= threshold ? 'PASSED' : 'FAILED',
      details: `PSRI: ${psri.toFixed(3)} (threshold: ${threshold})`,
      data: annotations,
    };

    if (opts.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    console.log(pc.bold(`  Bitbucket Report\n`));
    const resultColor = report.result === 'PASSED' ? pc.green : pc.red;
    console.log(`  ${pc.dim('Result:')} ${resultColor(report.result)}`);
    console.log(`  ${pc.dim('PSRI:')} ${psri.toFixed(3)} / ${threshold}`);
    console.log(`  ${pc.dim('Annotations:')} ${annotations.length}`);
    console.log();

    for (const a of annotations.slice(0, 10)) {
      const sColor = a.severity === 'CRITICAL' || a.severity === 'HIGH' ? pc.red : a.severity === 'MEDIUM' ? pc.yellow : pc.dim;
      console.log(`  ${sColor(a.severity.padEnd(8))} ${a.path}`);
    }

    if (annotations.length > 10) {
      console.log(pc.dim(`  ... and ${annotations.length - 10} more`));
    }
  });
