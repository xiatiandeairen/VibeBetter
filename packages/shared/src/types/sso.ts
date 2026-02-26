export type SSOProtocol = 'saml' | 'oidc';
export type SSOStatus = 'active' | 'inactive' | 'pending_verification';
export type SAMLBinding = 'HTTP-POST' | 'HTTP-Redirect';
export type OIDCGrantType = 'authorization_code' | 'implicit' | 'client_credentials';

export interface SSOProvider {
  id: string;
  organizationId: string;
  name: string;
  protocol: SSOProtocol;
  status: SSOStatus;
  entityId: string;
  metadataUrl: string | null;
  domains: string[];
  enforced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SAMLConfig {
  entityId: string;
  ssoUrl: string;
  sloUrl: string | null;
  certificate: string;
  binding: SAMLBinding;
  nameIdFormat: string;
  signRequests: boolean;
  wantAssertionsSigned: boolean;
  attributeMapping: {
    email: string;
    firstName: string;
    lastName: string;
    groups?: string;
  };
}

export interface OIDCConfig {
  clientId: string;
  clientSecret: string;
  issuerUrl: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  grantType: OIDCGrantType;
  scopes: string[];
  responseType: string;
  pkceEnabled: boolean;
}

export interface SSOConfig {
  providerId: string;
  protocol: SSOProtocol;
  saml: SAMLConfig | null;
  oidc: OIDCConfig | null;
  defaultRole: string;
  autoProvision: boolean;
  jitProvisioning: boolean;
  groupMapping: Record<string, string>;
}

export interface SSOSession {
  id: string;
  userId: string;
  providerId: string;
  protocol: SSOProtocol;
  nameId: string;
  sessionIndex: string | null;
  attributes: Record<string, string | string[]>;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface SSOLoginResult {
  success: boolean;
  session: SSOSession | null;
  error: string | null;
  redirectUrl: string | null;
  isNewUser: boolean;
}
