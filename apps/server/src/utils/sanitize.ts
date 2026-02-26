export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

export function limitLength(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  return input.slice(0, maxLength);
}

export function escapeForLog(input: string): string {
  return input
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

export function trimWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

export function sanitizeInput(input: string, maxLength = 1000): string {
  return limitLength(trimWhitespace(stripHtml(input)), maxLength);
}
