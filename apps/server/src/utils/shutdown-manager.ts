import { logger } from './logger.js';

export type ShutdownPhase = 'workers' | 'cache' | 'database' | 'custom';
export type ShutdownState = 'running' | 'shutting_down' | 'stopped';

interface ShutdownHandler {
  name: string;
  phase: ShutdownPhase;
  order: number;
  fn: () => Promise<void>;
  timeoutMs: number;
}

export class ShutdownManager {
  private state: ShutdownState = 'running';
  private readonly handlers: ShutdownHandler[] = [];
  private readonly phaseOrder: ShutdownPhase[] = ['workers', 'cache', 'database', 'custom'];

  register(name: string, phase: ShutdownPhase, fn: () => Promise<void>, timeoutMs = 5000): void {
    this.handlers.push({ name, phase, order: this.phaseOrder.indexOf(phase), fn, timeoutMs });
    logger.info({ handler: name, phase }, 'Registered shutdown handler');
  }

  getState(): ShutdownState {
    return this.state;
  }

  async shutdown(): Promise<void> {
    if (this.state !== 'running') {
      logger.warn('Shutdown already in progress');
      return;
    }

    this.state = 'shutting_down';
    logger.info({ handlerCount: this.handlers.length }, 'Beginning ordered shutdown');

    const sorted = [...this.handlers].sort((a, b) => a.order - b.order);

    for (const handler of sorted) {
      logger.info({ handler: handler.name, phase: handler.phase }, 'Shutting down');
      try {
        await Promise.race([
          handler.fn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Shutdown timeout: ${handler.name}`)), handler.timeoutMs)
          ),
        ]);
        logger.info({ handler: handler.name }, 'Shutdown complete');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error({ handler: handler.name, error: msg }, 'Shutdown error');
      }
    }

    this.state = 'stopped';
    logger.info('All shutdown handlers completed');
  }

  installSignalHandlers(): void {
    const handle = (signal: string) => {
      logger.info({ signal }, 'Received signal, initiating shutdown');
      this.shutdown().then(() => process.exit(0)).catch(() => process.exit(1));
    };

    process.on('SIGTERM', () => handle('SIGTERM'));
    process.on('SIGINT', () => handle('SIGINT'));
  }
}
