export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}

export interface CursorPaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
  total?: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function normalizePaginationParams(params: CursorPaginationParams): {
  cursor: string | undefined;
  limit: number;
  direction: 'forward' | 'backward';
} {
  const limit = Math.min(Math.max(params.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  return {
    cursor: params.cursor || undefined,
    limit,
    direction: params.direction ?? 'forward',
  };
}

export function encodeCursor(id: string, sortValue?: string | number): string {
  const payload = sortValue !== undefined ? `${id}:${sortValue}` : id;
  return Buffer.from(payload).toString('base64url');
}

export function decodeCursor(cursor: string): { id: string; sortValue?: string } {
  const decoded = Buffer.from(cursor, 'base64url').toString();
  const colonIdx = decoded.indexOf(':');
  if (colonIdx === -1) return { id: decoded };
  return { id: decoded.slice(0, colonIdx), sortValue: decoded.slice(colonIdx + 1) };
}

export function buildCursorResult<T extends { id: string }>(
  items: T[],
  limit: number,
  extractSort?: (item: T) => string | number,
  total?: number,
): CursorPaginatedResult<T> {
  const hasMore = items.length > limit;
  const sliced = hasMore ? items.slice(0, limit) : items;
  const first = sliced[0];
  const last = sliced[sliced.length - 1];

  return {
    items: sliced,
    nextCursor: hasMore && last ? encodeCursor(last.id, extractSort?.(last)?.toString()) : null,
    prevCursor: first ? encodeCursor(first.id, extractSort?.(first)?.toString()) : null,
    hasMore,
    total,
  };
}
