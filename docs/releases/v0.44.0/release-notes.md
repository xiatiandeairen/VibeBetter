# v0.44.0 Release Notes — Integration Registry (Commercial)

Registry of supported third-party integrations.

- `INTEGRATIONS` constant with GitHub, GitLab, Jira, Slack definitions
- Each integration has id, name, category, description, docs URL
- `getIntegration()` and `getIntegrationsByCategory()` lookup helpers
- Categories: scm, project, chat, ci
