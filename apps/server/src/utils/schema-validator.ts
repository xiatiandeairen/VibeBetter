import { logger } from './logger.js';

export interface TableSchema {
  name: string;
  columns: { name: string; type: string; nullable: boolean; indexed: boolean; foreignKey?: string }[];
}

export interface SchemaIssue {
  table: string;
  column: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

export function validateSchema(tables: TableSchema[], convention: 'snake_case' | 'camelCase' = 'snake_case'): SchemaIssue[] {
  if (tables.length === 0) {
    logger.warn('No tables provided for schema validation');
    return [];
  }

  const issues: SchemaIssue[] = [];
  const allTableNames = new Set(tables.map(t => t.name));

  for (const table of tables) {
    for (const col of table.columns) {
      if (col.foreignKey && !allTableNames.has(col.foreignKey)) {
        issues.push({ table: table.name, column: col.name, issue: 'orphan-fk', severity: 'high', suggestion: `Foreign key references non-existent table "${col.foreignKey}"` });
      }

      if (col.foreignKey && !col.indexed) {
        issues.push({ table: table.name, column: col.name, issue: 'missing-index', severity: 'high', suggestion: 'Add index on foreign key column for JOIN performance' });
      }

      const isSnake = /^[a-z][a-z0-9_]*$/.test(col.name);
      const isCamel = /^[a-z][a-zA-Z0-9]*$/.test(col.name);
      if (convention === 'snake_case' && !isSnake) {
        issues.push({ table: table.name, column: col.name, issue: 'naming-convention', severity: 'low', suggestion: `Use snake_case for column name` });
      } else if (convention === 'camelCase' && !isCamel) {
        issues.push({ table: table.name, column: col.name, issue: 'naming-convention', severity: 'low', suggestion: `Use camelCase for column name` });
      }
    }
  }

  issues.sort((a, b) => {
    const sevOrder = { high: 0, medium: 1, low: 2 };
    return sevOrder[a.severity] - sevOrder[b.severity];
  });

  logger.info({ tables: tables.length, issues: issues.length }, 'Schema validation complete');
  return issues;
}
