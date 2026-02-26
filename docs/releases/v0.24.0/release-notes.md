# v0.24.0 Release Notes — Graceful Shutdown

Production-ready server lifecycle management.

- Handles SIGTERM and SIGINT signals for clean shutdown
- Closes BullMQ worker and queue connections before exiting
- 10-second force-exit timeout as safety net
- Dynamic import avoids top-level await issues
