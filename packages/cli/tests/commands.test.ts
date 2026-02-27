import { describe, it, expect } from 'vitest';

describe('VibeBetter CLI v6 — 6 Core Commands', () => {
  it('exports all 8 commands (6 core + 2 setup)', async () => {
    const { initCommand } = await import('../src/commands/init.js');
    const { rulesCommand } = await import('../src/commands/rules.js');
    const { scanCommand } = await import('../src/commands/scan.js');
    const { planCommand } = await import('../src/commands/plan.js');
    const { promptCommand } = await import('../src/commands/prompt.js');
    const { guardCommand } = await import('../src/commands/guard.js');
    const { reviewCommand } = await import('../src/commands/review-check.js');
    const { commitCommand } = await import('../src/commands/commit-check.js');

    expect(initCommand.name()).toBe('init');
    expect(rulesCommand.name()).toBe('rules');
    expect(scanCommand.name()).toBe('scan');
    expect(planCommand.name()).toBe('plan');
    expect(promptCommand.name()).toBe('prompt');
    expect(guardCommand.name()).toBe('guard');
    expect(reviewCommand.name()).toBe('review');
    expect(commitCommand.name()).toBe('commit');
  });

  it('display utils', async () => {
    const { riskBadge, percentStr, benchmarkColor } = await import('../src/utils/display.js');
    expect(riskBadge(300).length).toBeGreaterThan(0);
    expect(percentStr(null)).toContain('N/A');
    expect(benchmarkColor('psriScore', 0.2)).toBe('green');
  });
});
