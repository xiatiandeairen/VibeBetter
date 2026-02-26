# v0.21.0 Release Notes — PR Risk Summary in CLI

Quickly assess risk for your current branch before opening a PR.

- `vibe pr` — Analyze changed files against risk data from the API
- `--base <branch>` — Compare against a specific base branch (default: main)
- `--markdown` — Output as markdown table for pasting into PR description
- Highlights high-risk files, new files, and outputs a summary
