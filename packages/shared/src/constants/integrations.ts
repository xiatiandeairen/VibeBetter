export interface Integration {
  id: string;
  name: string;
  category: 'scm' | 'project' | 'chat' | 'ci';
  description: string;
  docsUrl: string;
  supported: boolean;
}

export const INTEGRATIONS: Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    category: 'scm',
    description: 'Pull requests, commits, and repository analytics',
    docsUrl: 'https://docs.github.com',
    supported: true,
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'scm',
    description: 'Merge requests, pipelines, and repository analytics',
    docsUrl: 'https://docs.gitlab.com',
    supported: true,
  },
  {
    id: 'jira',
    name: 'Jira',
    category: 'project',
    description: 'Issue tracking, sprint metrics, and project boards',
    docsUrl: 'https://developer.atlassian.com/cloud/jira',
    supported: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'chat',
    description: 'Notifications, digest delivery, and alert channels',
    docsUrl: 'https://api.slack.com',
    supported: true,
  },
];

export function getIntegration(id: string): Integration | undefined {
  return INTEGRATIONS.find((i) => i.id === id);
}

export function getIntegrationsByCategory(category: Integration['category']): Integration[] {
  return INTEGRATIONS.filter((i) => i.category === category);
}
