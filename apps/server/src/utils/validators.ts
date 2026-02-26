const URL_REGEX = /^https?:\/\/[^\s/$.?#].\S*$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROJECT_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

export function isValidUrl(value: string): boolean {
  return URL_REGEX.test(value);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

export function isValidProjectId(value: string): boolean {
  return PROJECT_ID_REGEX.test(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}
