import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface SonarMeasure {
  metric: string;
  value: string;
}

interface SonarQubeReport {
  projectKey: string;
  measures: SonarMeasure[];
  qualityGate: 'OK' | 'WARN' | 'ERROR';
  timestamp: string;
}

function mapToSonarMetrics(overview: Record<string, unknown>): SonarMeasure[] {
  const measures: SonarMeasure[] = [];
  const psri = Number(overview.psriScore ?? 0);
  const tdi = Number(overview.tdiScore ?? 0);
  const hotspots = Number(overview.hotspotFiles ?? 0);
  const totalFiles = Number(overview.totalFiles ?? 0);
  const aiSuccessRate = Number(overview.aiSuccessRate ?? 0);

  measures.push({ metric: 'reliability_rating', value: psri <= 0.3 ? '1' : psri <= 0.5 ? '2' : psri <= 0.7 ? '3' : '4' });
  measures.push({ metric: 'security_rating', value: '1' });
  measures.push({ metric: 'sqale_index', value: String(Math.round(tdi * 100)) });
  measures.push({ metric: 'code_smells', value: String(hotspots) });
  measures.push({ metric: 'ncloc', value: String(totalFiles) });
  measures.push({ metric: 'coverage', value: String((aiSuccessRate * 100).toFixed(1)) });
  measures.push({ metric: 'duplicated_lines_density', value: '0' });
  measures.push({ metric: 'bugs', value: String(Math.round(psri * 10)) });
  measures.push({ metric: 'vulnerabilities', value: '0' });
  measures.push({ metric: 'sqale_rating', value: tdi <= 0.05 ? '1' : tdi <= 0.1 ? '2' : tdi <= 0.2 ? '3' : '4' });

  return measures;
}

function determineGate(psri: number, tdi: number): 'OK' | 'WARN' | 'ERROR' {
  if (psri <= 0.4 && tdi <= 0.3) return 'OK';
  if (psri <= 0.7 && tdi <= 0.5) return 'WARN';
  return 'ERROR';
}

export const sonarqubeCommand = new Command('sonarqube')
  .description('Format metrics compatible with SonarQube')
  .option('--json', 'Output as raw JSON')
  .option('--project-key <key>', 'SonarQube project key')
  .action(async (opts) => {
    header('SonarQube Metrics');

    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview().catch(() => null);

    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const data = overview as Record<string, unknown>;
    const projectKey = opts.projectKey ?? config.projectId ?? 'vibebetter-project';
    const psri = Number(data.psriScore ?? 0);
    const tdi = Number(data.tdiScore ?? 0);

    const report: SonarQubeReport = {
      projectKey,
      measures: mapToSonarMetrics(data),
      qualityGate: determineGate(psri, tdi),
      timestamp: new Date().toISOString(),
    };

    if (opts.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    const gateColor = report.qualityGate === 'OK' ? pc.green : report.qualityGate === 'WARN' ? pc.yellow : pc.red;
    console.log(pc.bold(`  Project: ${projectKey}`));
    console.log(`  ${pc.dim('Quality Gate:')} ${gateColor(report.qualityGate)}`);
    console.log();

    for (const m of report.measures) {
      console.log(`  ${pc.dim(m.metric.padEnd(30))} ${m.value}`);
    }

    console.log();
    info('Use --json to pipe into SonarQube generic import');
  });
