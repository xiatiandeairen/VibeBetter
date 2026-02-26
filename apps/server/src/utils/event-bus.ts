import { logger } from './logger.js';

export type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

interface EventSubscription {
  handler: EventHandler;
  once: boolean;
}

export class EventBus {
  private listeners = new Map<string, EventSubscription[]>();
  private maxListeners: number;

  constructor(maxListeners: number = 50) {
    this.maxListeners = maxListeners;
  }

  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    return this.addListener(event, handler as EventHandler, false);
  }

  once<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    return this.addListener(event, handler as EventHandler, true);
  }

  private addListener(event: string, handler: EventHandler, once: boolean): () => void {
    const subs = this.listeners.get(event) ?? [];
    if (subs.length >= this.maxListeners) {
      logger.warn({ event, count: subs.length }, 'EventBus: max listeners reached');
    }
    subs.push({ handler, once });
    this.listeners.set(event, subs);
    return () => this.off(event, handler);
  }

  off(event: string, handler: EventHandler): void {
    const subs = this.listeners.get(event);
    if (!subs) return;
    const filtered = subs.filter((s) => s.handler !== handler);
    if (filtered.length === 0) {
      this.listeners.delete(event);
    } else {
      this.listeners.set(event, filtered);
    }
  }

  async emit<T = unknown>(event: string, payload: T): Promise<void> {
    const subs = this.listeners.get(event);
    if (!subs || subs.length === 0) return;

    const toRemove: EventHandler[] = [];

    for (const sub of subs) {
      try {
        await sub.handler(payload);
      } catch (err) {
        logger.error({ event, error: err }, 'EventBus: handler error');
      }
      if (sub.once) toRemove.push(sub.handler);
    }

    for (const handler of toRemove) {
      this.off(event, handler);
    }
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.length ?? 0;
  }

  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const eventBus = new EventBus();
