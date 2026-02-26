import { logger } from './logger.js';

export type JsonSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';

export interface JsonSchema {
  type?: JsonSchemaType | JsonSchemaType[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  format?: string;
  description?: string;
  default?: unknown;
  additionalProperties?: boolean | JsonSchema;
}

export interface ValidationError {
  path: string;
  message: string;
  expected?: string;
  received?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

function typeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function matchesType(value: unknown, expected: JsonSchemaType): boolean {
  const actual = typeOf(value);
  if (expected === 'integer') return actual === 'number' && Number.isInteger(value);
  return actual === expected;
}

function validateValue(value: unknown, schema: JsonSchema, path: string, errors: ValidationError[]): void {
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const matched = types.some((t) => matchesType(value, t));
    if (!matched) {
      errors.push({ path, message: `Expected type ${types.join('|')}`, expected: types.join('|'), received: typeOf(value) });
      return;
    }
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push({ path, message: `Value not in enum [${schema.enum.join(', ')}]` });
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({ path, message: `String length ${value.length} < minLength ${schema.minLength}` });
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({ path, message: `String length ${value.length} > maxLength ${schema.maxLength}` });
    }
    if (schema.pattern) {
      const re = new RegExp(schema.pattern);
      if (!re.test(value)) {
        errors.push({ path, message: `String does not match pattern ${schema.pattern}` });
      }
    }
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({ path, message: `Value ${value} < minimum ${schema.minimum}` });
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({ path, message: `Value ${value} > maximum ${schema.maximum}` });
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({ path, message: `Array length ${value.length} < minItems ${schema.minItems}` });
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push({ path, message: `Array length ${value.length} > maxItems ${schema.maxItems}` });
    }
    if (schema.uniqueItems) {
      const serialized = value.map((v) => JSON.stringify(v));
      if (new Set(serialized).size !== serialized.length) {
        errors.push({ path, message: 'Array items are not unique' });
      }
    }
    if (schema.items) {
      for (let i = 0; i < value.length; i++) {
        validateValue(value[i], schema.items, `${path}[${i}]`, errors);
      }
    }
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in obj)) {
          errors.push({ path: `${path}.${key}`, message: `Missing required property "${key}"` });
        }
      }
    }
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          validateValue(obj[key], propSchema, `${path}.${key}`, errors);
        }
      }
    }
    if (schema.additionalProperties === false && schema.properties) {
      const allowed = new Set(Object.keys(schema.properties));
      for (const key of Object.keys(obj)) {
        if (!allowed.has(key)) {
          errors.push({ path: `${path}.${key}`, message: `Additional property "${key}" not allowed` });
        }
      }
    }
  }
}

export function validateJsonSchema(data: unknown, schema: JsonSchema): ValidationResult {
  const errors: ValidationError[] = [];
  validateValue(data, schema, '$', errors);
  if (errors.length > 0) {
    logger.debug({ errorCount: errors.length }, 'JSON Schema validation failed');
  }
  return { valid: errors.length === 0, errors };
}

export function createSchema(type: JsonSchemaType, options?: Partial<JsonSchema>): JsonSchema {
  return { type, ...options };
}
