import pc from 'picocolors';

export function header(text: string): void {
  console.log();
  console.log(pc.bold(pc.cyan(`📊 VibeBetter — ${text}`)));
  console.log(pc.dim('━'.repeat(50)));
}

export function success(text: string): void {
  console.log(pc.green(`✓ ${text}`));
}

export function warn(text: string): void {
  console.log(pc.yellow(`⚠ ${text}`));
}

export function error(text: string): void {
  console.log(pc.red(`✗ ${text}`));
}

export function info(text: string): void {
  console.log(pc.dim(`  ${text}`));
}

export function metric(label: string, value: string | number, color?: 'green' | 'yellow' | 'red'): void {
  const colorFn = color === 'green' ? pc.green : color === 'red' ? pc.red : color === 'yellow' ? pc.yellow : pc.white;
  console.log(`  ${pc.dim(label.padEnd(22))} ${colorFn(pc.bold(String(value)))}`);
}

export function riskBadge(score: number): string {
  if (score > 200) return pc.red(pc.bold('HIGH'));
  if (score > 50) return pc.yellow('MEDIUM');
  return pc.green('LOW');
}

export function percentStr(value: number | null): string {
  if (value === null) return pc.dim('N/A');
  return `${(value * 100).toFixed(1)}%`;
}

export function benchmarkColor(metric: string, value: number): 'green' | 'yellow' | 'red' {
  if (metric === 'psriScore' || metric === 'tdiScore') {
    return value <= 0.3 ? 'green' : value <= 0.6 ? 'yellow' : 'red';
  }
  return value >= 0.85 ? 'green' : value >= 0.7 ? 'yellow' : 'red';
}
