export const BRANDING = {
  name: process.env.BRAND_NAME || 'VibeBetter',
  tagline: process.env.BRAND_TAGLINE || 'AI-Augmented Engineering Insight Platform',
  primaryColor: process.env.BRAND_COLOR || '#6366f1',
  logoText: process.env.BRAND_LOGO_TEXT || 'VB',
} as const;
