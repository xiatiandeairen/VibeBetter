# VibeBetter

## Cursor Cloud specific instructions

This is currently a **greenfield repository** with no application code, dependencies, or services. The only file is `README.md`.

### Current state (as of initial setup)

- **No programming language or framework** has been chosen yet.
- **No package manager lockfile** exists — when one is added, the update script should be updated accordingly.
- **No lint, test, or build commands** are available.
- **No services** need to be started.

### Future setup notes

When application code is added to this repo, the following should be configured:

1. Update the VM environment update script (via `SetupVmEnvironment`) to install the project's dependencies (e.g., `npm install`, `pip install -r requirements.txt`, etc.).
2. Update this section with instructions on how to run, test, lint, and build the application.
