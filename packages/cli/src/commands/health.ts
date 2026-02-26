import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, success, warn, metric, benchmarkColor, percentStr } from '../utils/display.js';

export const healthCommand = new Command('health')
  .description('Comprehensive project health assessment')
  .action(async () => {
    header('Project Health Assessment');
    const config = requireConfig();
    const client = new ApiClient(config);
    
    let totalScore = 0;
    let checks = 0;
    
    // 1. API connectivity
    const apiOk = await client.healthCheck();
    if (apiOk) { totalScore += 10; success('API: Connected'); }
    else warn('API: Unreachable');
    checks += 10;
    
    // 2. Metrics
    const overview = await client.getOverview().catch(() => null);
    if (overview) {
      // AI Success Rate (max 20 points)
      const aiScore = Math.min(20, Math.round((overview.aiSuccessRate ?? 0) * 20));
      totalScore += aiScore;
      metric('AI Success Rate', percentStr(overview.aiSuccessRate), benchmarkColor('aiSuccessRate', overview.aiSuccessRate ?? 0));
      checks += 20;
      
      // PSRI (max 20 points, inverted — lower is better)
      const psriScore = Math.min(20, Math.round((1 - (overview.psriScore ?? 1)) * 20));
      totalScore += psriScore;
      metric('PSRI Risk', overview.psriScore?.toFixed(3) ?? 'N/A', benchmarkColor('psriScore', overview.psriScore ?? 0));
      checks += 20;
      
      // TDI (max 15 points, inverted)
      const tdiScore = Math.min(15, Math.round((1 - (overview.tdiScore ?? 1)) * 15));
      totalScore += tdiScore;
      metric('Tech Debt', overview.tdiScore?.toFixed(3) ?? 'N/A', benchmarkColor('tdiScore', overview.tdiScore ?? 0));
      checks += 15;
      
      // Hotspot ratio (max 10 points)
      const hotspotRatio = overview.totalFiles > 0 ? overview.hotspotFiles / overview.totalFiles : 0;
      const hotspotScore = Math.min(10, Math.round((1 - hotspotRatio) * 10));
      totalScore += hotspotScore;
      metric('Hotspot Ratio', `${overview.hotspotFiles}/${overview.totalFiles}`, hotspotRatio > 0.2 ? 'red' : 'green');
      checks += 10;
      
      // Data freshness (max 10 points)
      totalScore += overview.totalPrs > 0 ? 10 : 0;
      metric('Data Available', overview.totalPrs > 0 ? 'Yes' : 'No data', overview.totalPrs > 0 ? 'green' : 'red');
      checks += 10;
    }
    
    // AI tools (max 15 points)
    const aiStats = await client.getAiStats().catch(() => null);
    if (aiStats && aiStats.totalGenerations > 0) {
      const aiToolScore = Math.min(15, Math.round(aiStats.acceptanceRate * 15));
      totalScore += aiToolScore;
      metric('AI Tool Health', percentStr(aiStats.acceptanceRate), benchmarkColor('aiSuccessRate', aiStats.acceptanceRate));
    }
    checks += 15;
    
    // Final grade
    const grade = checks > 0 ? Math.round((totalScore / checks) * 100) : 0;
    console.log();
    console.log(pc.dim('━'.repeat(50)));
    const gradeColor = grade >= 80 ? pc.green : grade >= 60 ? pc.yellow : pc.red;
    const gradeLabel = grade >= 90 ? 'A+' : grade >= 80 ? 'A' : grade >= 70 ? 'B' : grade >= 60 ? 'C' : 'D';
    console.log(`  ${pc.bold('Overall Health:')} ${gradeColor(pc.bold(`${grade}% (${gradeLabel})`))}`);
    console.log();
  });
