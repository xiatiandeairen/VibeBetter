export type PluginCategory = 'integration' | 'visualization' | 'analysis' | 'reporting' | 'security' | 'workflow';
export type PluginStatus = 'draft' | 'published' | 'deprecated' | 'removed';
export type InstallStatus = 'installed' | 'pending' | 'failed' | 'uninstalled';

export interface PluginStore {
  id: string;
  name: string;
  description: string;
  featuredPlugins: string[];
  categories: PluginCategory[];
  totalPlugins: number;
  totalInstalls: number;
  lastUpdated: Date;
}

export interface PluginManifest {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  longDescription: string;
  category: PluginCategory;
  author: PluginAuthor;
  status: PluginStatus;
  icon: string | null;
  screenshots: string[];
  homepage: string | null;
  repository: string | null;
  minVibeVersion: string;
  maxVibeVersion: string | null;
  permissions: string[];
  configSchema: Record<string, unknown> | null;
  pricing: PluginPricing;
  stats: PluginStats;
  tags: string[];
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PluginAuthor {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  avatarUrl: string | null;
}

export interface PluginPricing {
  type: 'free' | 'paid' | 'freemium';
  price: number | null;
  currency: string;
  trialDays: number | null;
}

export interface PluginStats {
  totalInstalls: number;
  activeInstalls: number;
  averageRating: number;
  totalReviews: number;
}

export interface PluginReview {
  id: string;
  pluginId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PluginInstall {
  id: string;
  pluginId: string;
  organizationId: string;
  version: string;
  status: InstallStatus;
  config: Record<string, unknown>;
  installedBy: string;
  installedAt: Date;
  lastActiveAt: Date | null;
  uninstalledAt: Date | null;
}
