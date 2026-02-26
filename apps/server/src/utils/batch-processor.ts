import { logger } from './logger.js';

export interface BatchOptions<T> {
  batchSize: number;
  concurrency?: number;
  onProgress?: (completed: number, total: number, item: T) => void;
  onError?: (error: Error, item: T, index: number) => 'skip' | 'abort';
  retries?: number;
  retryDelayMs?: number;
}

export interface BatchResult<T, R> {
  successful: Array<{ item: T; result: R; index: number }>;
  failed: Array<{ item: T; error: Error; index: number }>;
  totalProcessed: number;
  durationMs: number;
}

export async function processBatch<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: BatchOptions<T>,
): Promise<BatchResult<T, R>> {
  const start = Date.now();
  const successful: BatchResult<T, R>['successful'] = [];
  const failed: BatchResult<T, R>['failed'] = [];
  const { batchSize, concurrency = 1, onProgress, onError, retries = 0, retryDelayMs = 1000 } = options;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const chunks: T[][] = [];

    for (let c = 0; c < batch.length; c += concurrency) {
      chunks.push(batch.slice(c, c + concurrency));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (item, ci) => {
        const globalIndex = i + ci;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            const result = await processor(item, globalIndex);
            successful.push({ item, result, index: globalIndex });
            onProgress?.(successful.length + failed.length, items.length, item);
            return;
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            if (attempt < retries) {
              await sleep(retryDelayMs * Math.pow(2, attempt));
            }
          }
        }

        const action = onError?.(lastError!, item, globalIndex) ?? 'skip';
        failed.push({ item, error: lastError!, index: globalIndex });
        logger.warn({ index: globalIndex, error: lastError!.message }, 'Batch item failed');

        if (action === 'abort') {
          throw new Error(`Batch aborted at index ${globalIndex}: ${lastError!.message}`);
        }
      });

      await Promise.all(promises);
    }
  }

  return {
    successful,
    failed,
    totalProcessed: successful.length + failed.length,
    durationMs: Date.now() - start,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
