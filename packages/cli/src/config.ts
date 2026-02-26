import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface VibeConfig {
  apiUrl: string;
  apiKey: string;
  projectId: string;
}

const CONFIG_DIR = join(homedir(), '.vibebetter');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export function loadConfig(): VibeConfig | null {
  if (!existsSync(CONFIG_FILE)) return null;
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) as VibeConfig;
  } catch {
    return null;
  }
}

export function saveConfig(config: VibeConfig): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function requireConfig(): VibeConfig {
  const config = loadConfig();
  if (!config) {
    console.error('Not initialized. Run: vibe init --api-url <url> --api-key <key> --project <id>');
    process.exit(1);
  }
  return config;
}
