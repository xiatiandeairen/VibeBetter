import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';

type IntegrationStatus = 'active' | 'available' | 'coming-soon' | 'deprecated';

interface Integration {
  name: string;
  category: string;
  status: IntegrationStatus;
  command: string | null;
  description: string;
}

const INTEGRATIONS: Integration[] = [
  { name: 'GitHub', category: 'VCS', status: 'active', command: 'vibe github-action', description: 'PR data collection, Actions workflow generation' },
  { name: 'GitLab', category: 'VCS', status: 'active', command: 'vibe gitlab', description: 'GitLab CI pipeline + MR analysis' },
  { name: 'Bitbucket', category: 'VCS', status: 'active', command: 'vibe bitbucket', description: 'Bitbucket Pipelines + PR sync' },
  { name: 'Azure DevOps', category: 'VCS', status: 'active', command: 'vibe azure', description: 'Azure Pipelines + Repos integration' },
  { name: 'Jira', category: 'Project Mgmt', status: 'active', command: 'vibe jira', description: 'Issue linking and risk reporting' },
  { name: 'Slack', category: 'Notifications', status: 'active', command: 'vibe slack-report', description: 'Webhook-based metric reports' },
  { name: 'Docker', category: 'Deployment', status: 'active', command: 'vibe docker', description: 'Dockerfile generation' },
  { name: 'Kubernetes', category: 'Deployment', status: 'active', command: 'vibe k8s', description: 'K8s deployment manifests' },
  { name: 'Helm', category: 'Deployment', status: 'active', command: 'vibe helm', description: 'Helm chart values generation' },
  { name: 'Terraform', category: 'IaC', status: 'active', command: 'vibe terraform', description: 'Terraform HCL infrastructure' },
  { name: 'Pulumi', category: 'IaC', status: 'active', command: 'vibe pulumi', description: 'Pulumi TypeScript infrastructure' },
  { name: 'Ansible', category: 'IaC', status: 'active', command: 'vibe ansible', description: 'Ansible playbook generation' },
  { name: 'ArgoCD', category: 'GitOps', status: 'active', command: 'vibe argocd', description: 'ArgoCD application manifests' },
  { name: 'Vercel', category: 'Deployment', status: 'active', command: 'vibe vercel', description: 'Vercel deployment config' },
  { name: 'Jenkins', category: 'CI/CD', status: 'active', command: 'vibe jenkins', description: 'Jenkinsfile pipeline generation' },
  { name: 'Datadog', category: 'Monitoring', status: 'active', command: 'vibe datadog', description: 'Custom metric push' },
  { name: 'Prometheus', category: 'Monitoring', status: 'active', command: 'vibe prometheus', description: 'Prometheus metrics format' },
  { name: 'OpenTelemetry', category: 'Observability', status: 'active', command: 'vibe opentelemetry', description: 'OTLP metric export' },
  { name: 'SonarQube', category: 'Quality', status: 'active', command: 'vibe sonarqube', description: 'SonarQube metric format' },
  { name: 'Backstage', category: 'Dev Portal', status: 'active', command: 'vibe backstage', description: 'Backstage catalog YAML' },
  { name: 'Chromatic', category: 'Visual Testing', status: 'active', command: 'vibe chromatic', description: 'Visual regression config' },
  { name: 'Playwright', category: 'E2E Testing', status: 'active', command: 'vibe playwright', description: 'E2E test generation' },
  { name: 'Email', category: 'Notifications', status: 'active', command: 'vibe email-report', description: 'HTML email reports' },
];

function statusIcon(s: IntegrationStatus): string {
  switch (s) {
    case 'active': return pc.green('●');
    case 'available': return pc.yellow('○');
    case 'coming-soon': return pc.dim('◌');
    case 'deprecated': return pc.red('✗');
  }
}

export const ecosystemCommand = new Command('ecosystem')
  .description('Show all integrations and their status')
  .option('--category <cat>', 'Filter by category')
  .option('--status <status>', 'Filter by status (active, available, coming-soon, deprecated)')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('VibeBetter Ecosystem');

    let integrations = INTEGRATIONS;

    if (opts.category) {
      integrations = integrations.filter(i => i.category.toLowerCase().includes(opts.category.toLowerCase()));
    }
    if (opts.status) {
      integrations = integrations.filter(i => i.status === opts.status);
    }

    if (opts.json) {
      console.log(JSON.stringify(integrations, null, 2));
      return;
    }

    const categories = [...new Set(integrations.map(i => i.category))];

    for (const cat of categories) {
      console.log();
      console.log(`  ${pc.bold(pc.cyan(cat))}`);
      const items = integrations.filter(i => i.category === cat);
      for (const item of items) {
        const icon = statusIcon(item.status);
        const cmd = item.command ? pc.dim(` (${item.command})`) : '';
        console.log(`  ${icon} ${pc.bold(item.name)}${cmd}`);
        console.log(`    ${pc.dim(item.description)}`);
      }
    }

    const active = integrations.filter(i => i.status === 'active').length;
    console.log();
    info(`${active} active integrations across ${categories.length} categories.`);
    info('Legend: ' + pc.green('● active') + '  ' + pc.yellow('○ available') + '  ' + pc.dim('◌ coming') + '  ' + pc.red('✗ deprecated'));
  });
