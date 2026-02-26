import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { percentStr, benchmarkColor } from '../utils/display.js';

export const dashboardCommand = new Command('dashboard')
  .description('Terminal dashboard — key metrics at a glance')
  .action(async () => {
    const config = requireConfig();
    const client = new ApiClient(config);
    
    const overview = await client.getOverview();
    const aiStats = await client.getAiStats().catch(() => null);
    const decisions = await client.getDecisions().catch(() => []);
    const pending = Array.isArray(decisions) ? decisions.filter((d: { status: string }) => d.status === 'PENDING').length : 0;
    
    const w = 56;
    const line = '─'.repeat(w);
    const dline = '━'.repeat(w);
    
    console.log();
    console.log(pc.bold(pc.cyan(`  📊 VibeBetter Dashboard`)));
    console.log(`  ${pc.dim(dline)}`);
    console.log();
    
    // Metrics row
    const col = (label: string, value: string, color: 'green' | 'yellow' | 'red') => {
      const c = color === 'green' ? pc.green : color === 'red' ? pc.red : pc.yellow;
      return `${pc.dim(label.padEnd(20))}${c(pc.bold(value))}`;
    };
    
    console.log(`  ${col('AI Success Rate', percentStr(overview.aiSuccessRate), benchmarkColor('aiSuccessRate', overview.aiSuccessRate ?? 0))}`);
    console.log(`  ${col('AI Stable Rate', percentStr(overview.aiStableRate), benchmarkColor('aiStableRate', overview.aiStableRate ?? 0))}`);
    console.log(`  ${col('PSRI Score', overview.psriScore?.toFixed(3) ?? 'N/A', benchmarkColor('psriScore', overview.psriScore ?? 0))}`);
    console.log(`  ${col('TDI', overview.tdiScore?.toFixed(3) ?? 'N/A', benchmarkColor('tdiScore', overview.tdiScore ?? 0))}`);
    console.log(`  ${pc.dim(line)}`);
    console.log(`  ${col('Total PRs', String(overview.totalPrs), 'green')}`);
    console.log(`  ${col('AI PRs', String(overview.aiPrs), 'green')}`);
    console.log(`  ${col('Hotspot Files', String(overview.hotspotFiles), overview.hotspotFiles > 5 ? 'red' : 'green')}`);
    console.log(`  ${col('Pending Decisions', String(pending), pending > 0 ? 'yellow' : 'green')}`);
    
    if (aiStats) {
      console.log(`  ${pc.dim(line)}`);
      console.log(`  ${col('AI Acceptance', percentStr(aiStats.acceptanceRate), benchmarkColor('aiSuccessRate', aiStats.acceptanceRate))}`);
      console.log(`  ${col('Avg Edit Distance', aiStats.avgEditDistance.toFixed(2), aiStats.avgEditDistance < 0.3 ? 'green' : 'yellow')}`);
      console.log(`  ${col('Tools Tracked', String(Object.keys(aiStats.toolUsage).length), 'green')}`);
    }
    
    console.log();
  });
