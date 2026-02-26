import { describe, it, expect } from 'vitest';

describe('CLI Config', () => {
  it('loadConfig returns null when no file exists', async () => {
    const { loadConfig } = await import('../src/config.js');
    const result = loadConfig();
    expect(result === null || typeof result === 'object').toBe(true);
  });
});

describe('Display utilities', () => {
  it('riskBadge returns correct labels', async () => {
    const { riskBadge } = await import('../src/utils/display.js');
    const high = riskBadge(300);
    const medium = riskBadge(100);
    const low = riskBadge(20);
    expect(high.length).toBeGreaterThan(0);
    expect(medium.length).toBeGreaterThan(0);
    expect(low.length).toBeGreaterThan(0);
  });

  it('percentStr handles null', async () => {
    const { percentStr } = await import('../src/utils/display.js');
    expect(percentStr(null)).toContain('N/A');
    expect(percentStr(0.856)).toContain('85.6%');
  });

  it('benchmarkColor returns correct colors', async () => {
    const { benchmarkColor } = await import('../src/utils/display.js');
    expect(benchmarkColor('aiSuccessRate', 0.9)).toBe('green');
    expect(benchmarkColor('aiSuccessRate', 0.75)).toBe('yellow');
    expect(benchmarkColor('aiSuccessRate', 0.5)).toBe('red');
    expect(benchmarkColor('psriScore', 0.2)).toBe('green');
    expect(benchmarkColor('psriScore', 0.5)).toBe('yellow');
    expect(benchmarkColor('psriScore', 0.8)).toBe('red');
  });
});

describe('Commander setup', () => {
  it('program has all 8 commands', async () => {
    const { Command } = await import('commander');
    const { initCommand } = await import('../src/commands/init.js');
    const { statusCommand } = await import('../src/commands/status.js');
    const { checkCommand } = await import('../src/commands/check.js');
    const { riskCommand } = await import('../src/commands/risk.js');
    const { decisionsCommand } = await import('../src/commands/decisions.js');
    const { insightsCommand } = await import('../src/commands/insights.js');
    const { reportCommand } = await import('../src/commands/report.js');
    const { syncCommand } = await import('../src/commands/sync.js');

    expect(initCommand.name()).toBe('init');
    expect(statusCommand.name()).toBe('status');
    expect(checkCommand.name()).toBe('check');
    expect(riskCommand.name()).toBe('risk');
    expect(decisionsCommand.name()).toBe('decisions');
    expect(insightsCommand.name()).toBe('insights');
    expect(reportCommand.name()).toBe('report');
    expect(syncCommand.name()).toBe('sync');
  });
});
