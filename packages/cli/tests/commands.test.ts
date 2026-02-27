import { describe, it, expect } from 'vitest';

describe('VibeBetter CLI v7', () => {
  it('has exactly 9 commands (8 core + init)', async () => {
    const cmds = await Promise.all([
      import('../src/commands/scan.js'),
      import('../src/commands/plan.js'),
      import('../src/commands/context.js'),
      import('../src/commands/prompt.js'),
      import('../src/commands/review-v7.js'),
      import('../src/commands/test-check.js'),
      import('../src/commands/commit-check.js'),
      import('../src/commands/rules.js'),
      import('../src/commands/init.js'),
    ]);
    const names = cmds.map(m => Object.values(m)[0] as { name: () => string });
    expect(names.map(c => c.name()).sort()).toEqual(
      ['commit', 'context', 'init', 'plan', 'prompt', 'review', 'rules', 'scan', 'test'].sort()
    );
  });

  it('display utils work', async () => {
    const { percentStr, benchmarkColor } = await import('../src/utils/display.js');
    expect(percentStr(null)).toContain('N/A');
    expect(percentStr(0.85)).toContain('85.0%');
    expect(benchmarkColor('psriScore', 0.2)).toBe('green');
    expect(benchmarkColor('psriScore', 0.8)).toBe('red');
  });
});
