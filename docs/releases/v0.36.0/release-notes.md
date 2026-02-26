# v0.36.0 Release Notes — Config Command (User)

CLI command to view and edit configuration without manual file editing.

- `vibe config --list` displays current configuration (API key masked)
- `vibe config --get <key>` retrieves a single config value
- `vibe config --set key=value` updates a config value
- Works with existing config file format from `vibe init`
