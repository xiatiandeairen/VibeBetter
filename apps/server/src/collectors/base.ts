import type { DataSourceType, HealthStatus, CollectParams, NormalizedEvent } from '@vibebetter/shared';

export interface IDataCollector {
  readonly source: DataSourceType;
  readonly category: string;
  initialize(): Promise<void>;
  collect(params: CollectParams): Promise<NormalizedEvent[]>;
  healthCheck(): Promise<HealthStatus>;
  dispose(): Promise<void>;
}

export class CollectorRegistry {
  private collectors = new Map<DataSourceType, IDataCollector>();

  register(collector: IDataCollector): void {
    this.collectors.set(collector.source, collector);
  }

  get(source: DataSourceType): IDataCollector | undefined {
    return this.collectors.get(source);
  }

  listAll(): IDataCollector[] {
    return Array.from(this.collectors.values());
  }
}

export const collectorRegistry = new CollectorRegistry();
