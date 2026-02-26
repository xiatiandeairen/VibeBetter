import { Command } from 'commander';
import pc from 'picocolors';
import { loadConfig } from '../config.js';
import { header, info, success, error } from '../utils/display.js';
import { writeFileSync } from 'fs';

function toYaml(obj: Record<string, unknown>, indent = 0): string {
  const prefix = '  '.repeat(indent);
  return Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return `${prefix}${key}:\n${toYaml(value as Record<string, unknown>, indent + 1)}`;
      }
      return `${prefix}${key}: ${JSON.stringify(value)}`;
    })
    .join('\n');
}

export const exportConfigCommand = new Command('export-config')
  .description('Export current configuration as YAML')
  .option('-o, --output <file>', 'Output file path')
  .action(async (opts) => {
    header('Export Configuration');
    const config = loadConfig();

    if (!config) {
      info('No configuration found. Run: vibe init');
      return;
    }

    const yaml = `# VibeBetter CLI Configuration\n# Generated: ${new Date().toISOString()}\n\n${toYaml(config as unknown as Record<string, unknown>)}\n`;

    if (opts.output) {
      try {
        writeFileSync(opts.output, yaml);
        success(`Configuration exported to ${opts.output}`);
      } catch {
        error(`Failed to write to ${opts.output}`);
      }
    } else {
      console.log(yaml);
      console.log(pc.dim('  Use --output <file> to save to a file.'));
    }
  });
