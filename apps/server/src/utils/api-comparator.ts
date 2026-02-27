import { logger } from './logger.js';

export interface ApiEndpoint {
  path: string;
  method: string;
  params: string[];
  responseShape: string;
  version: string;
}

export interface ApiDiff {
  endpoint: string;
  method: string;
  change: 'added' | 'removed' | 'modified' | 'deprecated';
  breaking: boolean;
  detail: string;
}

export function compareApis(base: ApiEndpoint[], target: ApiEndpoint[]): ApiDiff[] {
  if (base.length === 0 && target.length === 0) {
    logger.warn('No API endpoints provided for comparison');
    return [];
  }

  const baseMap = new Map(base.map(e => [`${e.method}:${e.path}`, e]));
  const targetMap = new Map(target.map(e => [`${e.method}:${e.path}`, e]));
  const diffs: ApiDiff[] = [];

  for (const [key, endpoint] of targetMap) {
    if (!baseMap.has(key)) {
      diffs.push({ endpoint: endpoint.path, method: endpoint.method, change: 'added', breaking: false, detail: `New endpoint in ${endpoint.version}` });
    } else {
      const baseEndpoint = baseMap.get(key)!;
      if (baseEndpoint.responseShape !== endpoint.responseShape) {
        diffs.push({ endpoint: endpoint.path, method: endpoint.method, change: 'modified', breaking: true, detail: 'Response shape changed' });
      } else if (baseEndpoint.params.length !== endpoint.params.length) {
        const breaking = endpoint.params.length < baseEndpoint.params.length;
        diffs.push({ endpoint: endpoint.path, method: endpoint.method, change: 'modified', breaking, detail: 'Parameters changed' });
      }
    }
  }

  for (const [key, endpoint] of baseMap) {
    if (!targetMap.has(key)) {
      diffs.push({ endpoint: endpoint.path, method: endpoint.method, change: 'removed', breaking: true, detail: 'Endpoint removed' });
    }
  }

  logger.info({ base: base.length, target: target.length, diffs: diffs.length }, 'API comparison complete');
  return diffs;
}
