# Release Notes — v2.9.0 to v2.28.0 (Final Batch)

_200-iteration sprint complete. This is the final batch of 20 versions._

## v2.9.0 — Team Management Types (Commercial)
- `packages/shared/src/types/team-management.ts` — TeamInvite, TeamRole, TeamAnalytics interfaces for team collaboration and member management

## v2.10.0 — Pulse (Product)
- `packages/cli/src/commands/pulse.ts` — `vibe pulse` shows real-time project pulse (quick health + trend in one line)

## v2.11.0 — Learn (User)
- `packages/cli/src/commands/learn.ts` — `vibe learn` provides educational content about AI coding best practices

## v2.12.0 — Backup (Maturity)
- `apps/server/src/utils/backup.ts` — database backup helper with timestamp naming, compression, and pruning

## v2.13.0 — Monorepo (Scenario)
- `packages/cli/src/commands/monorepo.ts` — `vibe monorepo` analyzes monorepo structure and per-package risk

## v2.14.0 — Trial Types (Commercial)
- `packages/shared/src/types/trial.ts` — TrialConfig, TrialStatus, ConversionEvent interfaces for trial management

## v2.15.0 — Impact (Product)
- `packages/cli/src/commands/impact.ts` — `vibe impact` analyzes blast radius of file changes

## v2.16.0 — Lang (User)
- `packages/cli/src/commands/lang.ts` — `vibe lang` sets CLI output language (en/zh placeholder)

## v2.17.0 — Memory Monitor (Maturity)
- `apps/server/src/utils/memory-monitor.ts` — monitor Node.js heap usage and alert on threshold

## v2.18.0 — npm Publish (Scenario)
- `packages/cli/src/commands/npm-publish.ts` — `vibe npm-publish` checks package readiness for npm publishing

## v2.19.0 — Referral Types (Commercial)
- `packages/shared/src/types/referral.ts` — ReferralProgram, ReferralReward interfaces for referral programs

## v2.20.0 — Roadmap (Product)
- `packages/cli/src/commands/roadmap.ts` — `vibe roadmap` shows project roadmap based on risk priorities

## v2.21.0 — Celebrate (User)
- `packages/cli/src/commands/celebrate.ts` — `vibe celebrate` celebrates team achievements when metrics improve

## v2.22.0 — Graceful Degradation (Maturity)
- `apps/server/src/utils/graceful-degradation.ts` — fallback strategies when Redis/external services are down

## v2.23.0 — Discord (Scenario)
- `packages/cli/src/commands/discord.ts` — `vibe discord` formats VibeBetter report for Discord webhook

## v2.24.0 — Enterprise Types (Commercial)
- `packages/shared/src/types/enterprise.ts` — EnterpriseConfig, SSO, AuditPolicy interfaces for enterprise customers

## v2.25.0 — Smart Review (Product)
- `packages/cli/src/commands/smart-review.ts` — `vibe smart-review` suggests optimal reviewers based on file ownership

## v2.26.0 — Wellbeing (User)
- `packages/cli/src/commands/wellbeing.ts` — `vibe wellbeing` developer wellbeing check (session length, break reminders)

## v2.27.0 — Performance Budget (Maturity)
- `apps/server/src/utils/performance-budget.ts` — define and check API performance budgets

## v2.28.0 — Ecosystem (Scenario)
- `packages/cli/src/commands/ecosystem.ts` — `vibe ecosystem` lists all VibeBetter ecosystem tools and integrations
