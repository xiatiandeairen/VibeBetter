import { logger } from './logger.js';

export interface FunctionSignature {
  name: string;
  file: string;
  params: { name: string; type: string }[];
  returnType: string;
  isExported: boolean;
  hasDoc: boolean;
}

export interface GeneratedDoc {
  file: string;
  functionName: string;
  doc: string;
  lineNumber: number;
}

export function generateDocs(signatures: FunctionSignature[]): GeneratedDoc[] {
  if (signatures.length === 0) {
    logger.warn('No function signatures provided for doc generation');
    return [];
  }

  const results: GeneratedDoc[] = [];

  for (const sig of signatures) {
    if (sig.hasDoc) continue;

    const paramDocs = sig.params.map(p => ` * @param ${p.name} - ${p.type}`).join('\n');
    const returnDoc = sig.returnType !== 'void' ? `\n * @returns ${sig.returnType}` : '';

    const doc = [
      '/**',
      ` * ${sig.name} — ${sig.isExported ? 'public' : 'internal'} function`,
      paramDocs,
      returnDoc,
      ' */',
    ].filter(Boolean).join('\n');

    results.push({ file: sig.file, functionName: sig.name, doc, lineNumber: 0 });
  }

  logger.info({ signatures: signatures.length, generated: results.length }, 'Documentation generated');
  return results;
}
