# v0.38.0 Release Notes — Git Hook Install (Scenario)

CLI command to install VibeBetter pre-commit hooks.

- `vibe hook install` creates `.git/hooks/pre-commit` running `vibe check`
- `vibe hook uninstall` removes the hook
- Sets executable permissions automatically
- Warns if existing hook will be overwritten
