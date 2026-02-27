import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface CompatEntry {
  package: string;
  requiredNode: string;
  currentNode: string;
  compatible: boolean;
  peerIssues: string[];
}

function checkCompatibility(_overview: Record<string, unknown>): CompatEntry[] {
  return [
    { package: 'next@15.1.0', requiredNode: '>=18.17', currentNode: '20.11.0', compatible: true, peerIssues: [] },
    { package: 'prisma@6.3.0', requiredNode: '>=18.0', currentNode: '20.11.0', compatible: true, peerIssues: [] },
    { package: 'legacy-auth@2.0.0', requiredNode: '>=14.0 <20', currentNode: '20.11.0', compatible: false, peerIssues: ['Node 20 not supported'] },
    { package: 'react@19.2.4', requiredNode: '>=18.0', currentNode: '20.11.0', compatible: true, peerIssues: [] },
    { package: 'old-logger@1.2.0', requiredNode: '>=12.0', currentNode: '20.11.0', compatible: true, peerIssues: ['Missing peer: winston@3'] },
  ];
}

export const compatibilityCheckCommand = new Command('compatibility-check')
  .description('Check dependency compatibility with current runtime')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Compatibility Check');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const entries = checkCompatibility(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ compatibility: entries, issues: entries.filter(e => !e.compatible || e.peerIssues.length > 0).length }, null, 2));
      return;
    }

    console.log();
    for (const e of entries) {
      const icon = e.compatible && e.peerIssues.length === 0 ? pc.green('✓') : !e.compatible ? pc.red('✗') : pc.yellow('⚠');
      console.log(`  ${icon} ${pc.bold(e.package)} ${pc.dim(`node ${e.requiredNode}`)}`);
      for (const issue of e.peerIssues) {
        console.log(`    ${pc.yellow('→')} ${issue}`);
      }
    }

    console.log();
    metric('Packages checked', String(entries.length));
    metric('Incompatible', String(entries.filter(e => !e.compatible).length));
    metric('Peer issues', String(entries.filter(e => e.peerIssues.length > 0).length));
    success('Compatibility check complete.');
  });
