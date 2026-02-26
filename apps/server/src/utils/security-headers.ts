import { logger } from './logger.js';

export interface SecurityHeadersConfig {
  xContentTypeOptions: boolean;
  xFrameOptions: 'DENY' | 'SAMEORIGIN' | false;
  xXssProtection: boolean;
  strictTransportSecurity: boolean;
  hstsMaxAge: number;
  hstsIncludeSubDomains: boolean;
  referrerPolicy: string | false;
  contentSecurityPolicy: string | false;
  permissionsPolicy: string | false;
  crossOriginOpenerPolicy: string | false;
  crossOriginResourcePolicy: string | false;
  crossOriginEmbedderPolicy: string | false;
}

const DEFAULT_CONFIG: SecurityHeadersConfig = {
  xContentTypeOptions: true,
  xFrameOptions: 'DENY',
  xXssProtection: true,
  strictTransportSecurity: true,
  hstsMaxAge: 31_536_000,
  hstsIncludeSubDomains: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  contentSecurityPolicy: false,
  permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'same-origin',
  crossOriginEmbedderPolicy: false,
};

export function buildSecurityHeaders(config: Partial<SecurityHeadersConfig> = {}): Record<string, string> {
  const merged: SecurityHeadersConfig = { ...DEFAULT_CONFIG, ...config };
  const headers: Record<string, string> = {};

  if (merged.xContentTypeOptions) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  if (merged.xFrameOptions) {
    headers['X-Frame-Options'] = merged.xFrameOptions;
  }

  if (merged.xXssProtection) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }

  if (merged.strictTransportSecurity) {
    let value = `max-age=${merged.hstsMaxAge}`;
    if (merged.hstsIncludeSubDomains) value += '; includeSubDomains';
    headers['Strict-Transport-Security'] = value;
  }

  if (merged.referrerPolicy) {
    headers['Referrer-Policy'] = merged.referrerPolicy;
  }

  if (merged.contentSecurityPolicy) {
    headers['Content-Security-Policy'] = merged.contentSecurityPolicy;
  }

  if (merged.permissionsPolicy) {
    headers['Permissions-Policy'] = merged.permissionsPolicy;
  }

  if (merged.crossOriginOpenerPolicy) {
    headers['Cross-Origin-Opener-Policy'] = merged.crossOriginOpenerPolicy;
  }

  if (merged.crossOriginResourcePolicy) {
    headers['Cross-Origin-Resource-Policy'] = merged.crossOriginResourcePolicy;
  }

  if (merged.crossOriginEmbedderPolicy) {
    headers['Cross-Origin-Embedder-Policy'] = merged.crossOriginEmbedderPolicy;
  }

  return headers;
}

export function securityHeadersMiddleware(config: Partial<SecurityHeadersConfig> = {}) {
  const headers = buildSecurityHeaders(config);
  const headerCount = Object.keys(headers).length;
  logger.info({ headerCount }, 'Security headers middleware initialized');

  return (req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
    next();
  };
}
