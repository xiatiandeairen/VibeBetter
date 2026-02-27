export interface EnvVariable {
  name: string;
  required: boolean;
  present: boolean;
  valid: boolean;
  type: 'string' | 'number' | 'boolean' | 'url' | 'secret';
  hint: string;
  defaultValue?: string;
}

export interface EnvValidationReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  variables: EnvVariable[];
  totalVariables: number;
  missingRequired: number;
  isValid: boolean;
}

export interface EnvValidationConfig {
  envFile: string;
  strict: boolean;
  warnOnExtra: boolean;
  requiredPrefix: string;
  excludePatterns: string[];
}
