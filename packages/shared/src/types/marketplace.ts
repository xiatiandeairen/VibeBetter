export type PluginCategory = 'integration' | 'analysis' | 'reporting' | 'notification' | 'security' | 'custom';
export type PluginStatus = 'draft' | 'published' | 'deprecated' | 'suspended';
export type PluginInstallStatus = 'installed' | 'disabled' | 'pending_update' | 'error';

export interface Plugin {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: PluginCategory;
  status: PluginStatus;
  authorId: string;
  authorName: string;
  version: string;
  iconUrl: string | null;
  repositoryUrl: string | null;
  documentationUrl: string | null;
  downloads: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  pricing: 'free' | 'paid' | 'freemium';
  priceMonthly: number | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  minAppVersion: string;
  description: string;
  author: string;
  license: string;
  homepage: string | null;
  entryPoint: string;
  permissions: PluginPermission[];
  hooks: PluginHook[];
  configSchema: PluginConfigField[];
  dependencies: Record<string, string>;
}

export type PluginPermission =
  | 'read:metrics'
  | 'write:metrics'
  | 'read:projects'
  | 'read:users'
  | 'send:notifications'
  | 'access:api'
  | 'execute:commands';

export interface PluginHook {
  event: string;
  handler: string;
  priority: number;
  async: boolean;
}

export interface PluginConfigField {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  label: string;
  description: string;
  required: boolean;
  default: unknown;
  options?: Array<{ label: string; value: string }>;
  validation?: { min?: number; max?: number; pattern?: string };
}

export interface PluginConfig {
  pluginId: string;
  organizationId: string;
  projectId: string | null;
  installStatus: PluginInstallStatus;
  version: string;
  config: Record<string, unknown>;
  enabledHooks: string[];
  installedBy: string;
  installedAt: Date;
  updatedAt: Date;
}

export interface PluginEvent {
  pluginId: string;
  event: string;
  payload: unknown;
  timestamp: Date;
}

export interface MarketplaceSearchResult {
  plugins: Plugin[];
  total: number;
  page: number;
  pageSize: number;
  categories: Record<PluginCategory, number>;
}
