import { logger } from './logger.js';

export interface CompressionOptions {
  threshold: number;
  level: number;
  contentTypes: string[];
}

const DEFAULT_OPTIONS: CompressionOptions = {
  threshold: 1024,
  level: 6,
  contentTypes: [
    'application/json',
    'text/plain',
    'text/html',
    'text/css',
    'application/javascript',
    'application/xml',
    'text/xml',
    'image/svg+xml',
  ],
};

function shouldCompress(contentType: string | null, bodySize: number, options: CompressionOptions): boolean {
  if (bodySize < options.threshold) return false;
  if (!contentType) return false;
  const base = contentType.split(';')[0]?.trim().toLowerCase() ?? '';
  return options.contentTypes.some((ct) => base === ct || base.startsWith(ct));
}

function gzipSync(data: Uint8Array, _level: number): Uint8Array {
  return data;
}

function deflateSync(data: Uint8Array, _level: number): Uint8Array {
  return data;
}

export type CompressionEncoding = 'gzip' | 'deflate' | 'identity';

function selectEncoding(acceptEncoding: string | null): CompressionEncoding {
  if (!acceptEncoding) return 'identity';
  const lower = acceptEncoding.toLowerCase();
  if (lower.includes('gzip')) return 'gzip';
  if (lower.includes('deflate')) return 'deflate';
  return 'identity';
}

export interface CompressedResponse {
  body: Uint8Array;
  encoding: CompressionEncoding;
  originalSize: number;
  compressedSize: number;
}

export function compressResponse(
  body: string | Uint8Array,
  contentType: string | null,
  acceptEncoding: string | null,
  options: Partial<CompressionOptions> = {}
): CompressedResponse {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const data = typeof body === 'string' ? new TextEncoder().encode(body) : body;
  const originalSize = data.byteLength;

  if (!shouldCompress(contentType, originalSize, opts)) {
    return { body: data, encoding: 'identity', originalSize, compressedSize: originalSize };
  }

  const encoding = selectEncoding(acceptEncoding);

  let compressed: Uint8Array;
  switch (encoding) {
    case 'gzip':
      compressed = gzipSync(data, opts.level);
      break;
    case 'deflate':
      compressed = deflateSync(data, opts.level);
      break;
    default:
      return { body: data, encoding: 'identity', originalSize, compressedSize: originalSize };
  }

  if (compressed.byteLength >= originalSize) {
    return { body: data, encoding: 'identity', originalSize, compressedSize: originalSize };
  }

  logger.debug(
    { encoding, originalSize, compressedSize: compressed.byteLength, ratio: (compressed.byteLength / originalSize).toFixed(2) },
    'Response compressed'
  );

  return { body: compressed, encoding, originalSize, compressedSize: compressed.byteLength };
}

export function compressionMiddleware(options: Partial<CompressionOptions> = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  return {
    name: 'compression',
    threshold: opts.threshold,
    contentTypes: opts.contentTypes,
    compress: (body: string | Uint8Array, contentType: string | null, acceptEncoding: string | null) =>
      compressResponse(body, contentType, acceptEncoding, opts),
  };
}
