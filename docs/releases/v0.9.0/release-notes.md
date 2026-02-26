# v0.9.0 Release Notes — Local Analysis Mode

Offline analysis for developers without backend access.

- `vibe analyze` — Local git log analysis (no API required)
- Scans last 90 days of commits (configurable via `--days`)
- Identifies hotspot files (≥10 changes) with risk badges
- Outputs ranked file change frequency with risk summary
- Zero backend dependency — works anywhere with a git repo
