import { logger } from './logger.js';

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxCalls: number;
}

const defaults: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
  halfOpenMaxCalls: 3,
};

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private successes = 0;
  private halfOpenCalls = 0;
  private nextAttemptAt = 0;
  private readonly opts: CircuitBreakerOptions;
  readonly name: string;

  constructor(name: string, options?: Partial<CircuitBreakerOptions>) {
    this.name = name;
    this.opts = { ...defaults, ...options };
  }

  getState(): CircuitState {
    if (this.state === 'open' && Date.now() >= this.nextAttemptAt) {
      this.transitionTo('half-open');
    }
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const current = this.getState();

    if (current === 'open') {
      throw new Error(`Circuit breaker "${this.name}" is open — call rejected`);
    }

    if (current === 'half-open' && this.halfOpenCalls >= this.opts.halfOpenMaxCalls) {
      throw new Error(`Circuit breaker "${this.name}" half-open limit reached`);
    }

    try {
      if (current === 'half-open') this.halfOpenCalls++;
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.successes++;
    if (this.state === 'half-open') {
      this.transitionTo('closed');
    }
  }

  private onFailure(): void {
    this.failures++;
    this.successes = 0;
    if (this.failures >= this.opts.failureThreshold) {
      this.transitionTo('open');
    }
  }

  private transitionTo(newState: CircuitState): void {
    const prev = this.state;
    this.state = newState;
    if (newState === 'open') {
      this.nextAttemptAt = Date.now() + this.opts.resetTimeoutMs;
    }
    if (newState === 'half-open') {
      this.halfOpenCalls = 0;
    }
    if (newState === 'closed') {
      this.failures = 0;
      this.halfOpenCalls = 0;
    }
    logger.info({ breaker: this.name, from: prev, to: newState }, 'Circuit breaker state change');
  }

  getStats(): { state: CircuitState; failures: number; successes: number } {
    return { state: this.getState(), failures: this.failures, successes: this.successes };
  }
}
