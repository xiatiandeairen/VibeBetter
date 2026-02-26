interface EndpointMetrics {
  count: number;
  lastAccessed: Date;
}

class MetricsCollector {
  private counters = new Map<string, EndpointMetrics>();

  increment(endpoint: string): void {
    const existing = this.counters.get(endpoint);
    if (existing) {
      existing.count += 1;
      existing.lastAccessed = new Date();
    } else {
      this.counters.set(endpoint, { count: 1, lastAccessed: new Date() });
    }
  }

  getCount(endpoint: string): number {
    return this.counters.get(endpoint)?.count ?? 0;
  }

  getAll(): Record<string, EndpointMetrics> {
    const result: Record<string, EndpointMetrics> = {};
    for (const [key, value] of this.counters) {
      result[key] = { ...value };
    }
    return result;
  }

  getTotalRequests(): number {
    let total = 0;
    for (const m of this.counters.values()) {
      total += m.count;
    }
    return total;
  }

  reset(): void {
    this.counters.clear();
  }
}

export const metricsCollector = new MetricsCollector();
