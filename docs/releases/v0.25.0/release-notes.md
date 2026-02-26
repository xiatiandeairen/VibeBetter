# v0.25.0 Release Notes — Auto-Detect Project from Git Remote

Streamlined project setup via git remote auto-detection.

- `vibe init --auto` reads the origin remote URL from git
- Extracts project slug (owner/repo) from the remote URL
- Eliminates manual project ID lookup during initialization
- Falls back to `--project <id>` when no origin remote is found
