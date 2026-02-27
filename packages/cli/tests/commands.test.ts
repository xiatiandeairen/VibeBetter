import { describe, it, expect } from 'vitest';

describe('CLI v5 — AI Coding Companion', () => {
  it('has 8 core commands', async () => {
    const { contextCommand } = await import('../src/commands/context.js');
    const { promptCommand } = await import('../src/commands/prompt.js');
    const { guardCommand } = await import('../src/commands/guard.js');
    const { rulesCommand } = await import('../src/commands/rules.js');
    const { flowCommand } = await import('../src/commands/flow-workflow.js');
    const { boundaryCommand } = await import('../src/commands/boundary.js');
    const { qualityCommand } = await import('../src/commands/quality-check.js');
    const { initCommand } = await import('../src/commands/init.js');

    expect(contextCommand.name()).toBe('context');
    expect(promptCommand.name()).toBe('prompt');
    expect(guardCommand.name()).toBe('guard');
    expect(rulesCommand.name()).toBe('rules');
    expect(flowCommand.name()).toBe('flow');
    expect(boundaryCommand.name()).toBe('boundary');
    expect(qualityCommand.name()).toBe('quality');
    expect(initCommand.name()).toBe('init');
  });

  it('display utils work', async () => {
    const { riskBadge, percentStr, benchmarkColor } = await import('../src/utils/display.js');
    expect(riskBadge(300).length).toBeGreaterThan(0);
    expect(percentStr(0.85)).toContain('85.0%');
    expect(percentStr(null)).toContain('N/A');
    expect(benchmarkColor('psriScore', 0.2)).toBe('green');
    expect(benchmarkColor('psriScore', 0.8)).toBe('red');
  });
});
