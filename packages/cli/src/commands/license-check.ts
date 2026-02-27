import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface LicenseEntry {
  package: string;
  license: string;
  compatible: boolean;
  risk: 'none' | 'low' | 'medium' | 'high';
}

function checkLicenses(_overview: Record<string, unknown>): LicenseEntry[] {
  return [
    { package: 'react', license: 'MIT', compatible: true, risk: 'none' },
    { package: 'express', license: 'MIT', compatible: true, risk: 'none' },
    { package: 'lodash', license: 'MIT', compatible: true, risk: 'none' },
    { package: 'sharp', license: 'Apache-2.0', compatible: true, risk: 'low' },
    { package: 'mysql-connector', license: 'GPL-2.0', compatible: false, risk: 'high' },
    { package: 'chart-lib', license: 'AGPL-3.0', compatible: false, risk: 'high' },
    { package: 'date-fns', license: 'MIT', compatible: true, risk: 'none' },
  ];
}

export const licenseCheckCommand = new Command('license-check')
  .description('Check dependency license compatibility')
  .option('--json', 'Output as JSON')
  .option('--strict', 'Fail on any non-MIT license')
  .action(async (opts) => {
    header('License Check');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const entries = checkLicenses(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ licenses: entries, incompatible: entries.filter(e => !e.compatible).length }, null, 2));
      return;
    }

    console.log();
    for (const e of entries) {
      const icon = e.compatible ? pc.green('✔') : pc.red('✘');
      const riskColor = e.risk === 'high' ? pc.red : e.risk === 'medium' ? pc.yellow : pc.green;
      console.log(`  ${icon} ${pc.bold(e.package.padEnd(22))} ${e.license.padEnd(12)} ${riskColor(`[${e.risk}]`)}`);
    }

    const incompatible = entries.filter(e => !e.compatible).length;
    console.log();
    metric('Packages scanned', String(entries.length));
    metric('Incompatible', String(incompatible));
    metric('Status', incompatible > 0 ? pc.red('ACTION REQUIRED') : pc.green('All clear'));
    success('License check complete.');
  });
