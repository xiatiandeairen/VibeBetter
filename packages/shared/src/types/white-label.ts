export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type LogoVariant = 'full' | 'icon' | 'wordmark';
export type DomainStatus = 'pending' | 'active' | 'failed' | 'expired';

export interface ThemeConfig {
  id: string;
  organizationId: string;
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  borderRadius: string;
  spacing: string;
  darkMode: boolean;
  customCSS: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  destructive: string;
  success: string;
  warning: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingFontFamily: string;
  baseFontSize: string;
  headingWeight: FontWeight;
  bodyWeight: FontWeight;
  lineHeight: string;
}

export interface BrandAssets {
  id: string;
  organizationId: string;
  logos: BrandLogo[];
  favicon: string | null;
  ogImage: string | null;
  appName: string;
  tagline: string | null;
  supportEmail: string | null;
  termsUrl: string | null;
  privacyUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandLogo {
  variant: LogoVariant;
  lightUrl: string;
  darkUrl: string | null;
  width: number;
  height: number;
  altText: string;
}

export interface CustomDomain {
  id: string;
  organizationId: string;
  domain: string;
  subdomain: string | null;
  status: DomainStatus;
  sslCertificateId: string | null;
  sslExpiresAt: Date | null;
  dnsRecords: DnsRecord[];
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DnsRecord {
  type: 'CNAME' | 'A' | 'TXT' | 'AAAA';
  name: string;
  value: string;
  verified: boolean;
  verifiedAt: Date | null;
}

export interface WhiteLabelConfig {
  theme: ThemeConfig;
  brand: BrandAssets;
  domain: CustomDomain | null;
  emailTemplatePrefix: string | null;
  hideVibeBetterBranding: boolean;
}
