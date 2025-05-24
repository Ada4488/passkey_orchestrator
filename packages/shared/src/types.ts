/**
 * Core WebAuthn interfaces and types for the Passkey Orchestrator
 */

// Standard WebAuthn types (re-exported for convenience)
export type AttestationConveyancePreference = 'none' | 'indirect' | 'direct' | 'enterprise';
export type AuthenticatorAttachment = 'platform' | 'cross-platform';
export type AuthenticatorTransport = 'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid';
export type UserVerificationRequirement = 'required' | 'preferred' | 'discouraged';
export type ResidentKeyRequirement = 'discouraged' | 'preferred' | 'required';

export interface PublicKeyCredentialDescriptor {
  type: 'public-key';
  id: BufferSource;
  transports?: AuthenticatorTransport[];
}

// Re-export and extend standard WebAuthn types
export interface PublicKeyCredentialCreationOptionsExtended extends PublicKeyCredentialCreationOptions {
  // Add any custom extensions here
}

export interface PublicKeyCredentialRequestOptionsExtended extends PublicKeyCredentialRequestOptions {
  // Add any custom extensions here
}

// Custom attestation and assertion options for easier usage
export interface AttestationOptions {
  challenge: string;
  rp: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  excludeCredentials?: PublicKeyCredentialDescriptor[];
}

export interface AssertionOptions {
  challenge: string;
  timeout?: number;
  rpId?: string;
  allowCredentials?: PublicKeyCredentialDescriptor[];
  userVerification?: UserVerificationRequirement;
}

// Environment detection types
export interface Environment {
  os: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'unknown';
  browser: 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'unknown';
  isWebAuthnSupported: boolean;
  isPlatformAuthenticatorAvailable: boolean;
  detectedProviders: PasskeyProvider[];
}

export interface PasskeyProvider {
  type: 'platform' | 'cross-platform';
  name: string;
  confidence: number; // 0-1, how confident we are in the detection
}

// Serialized WebAuthn responses (for transport)
export interface SerializedAttestationResponse {
  id: string;
  rawId: string;
  type: 'public-key';
  clientDataJSON: string;
  attestationObject: string;
  transports?: AuthenticatorTransport[];
}

export interface SerializedAssertionResponse {
  id: string;
  rawId: string;
  type: 'public-key';
  clientDataJSON: string;
  authenticatorData: string;
  signature: string;
  userHandle?: string;
}

// Parsed WebAuthn responses (for server-side processing)
export interface ParsedClientData {
  type: string;
  challenge: string;
  origin: string;
  crossOrigin?: boolean;
  tokenBinding?: {
    status: string;
    id?: string;
  };
}

export interface ParsedAuthenticatorData {
  rpIdHash: Uint8Array;
  flags: {
    userPresent: boolean;
    userVerified: boolean;
    attestedCredentialData: boolean;
    extensionDataIncluded: boolean;
  };
  counter: number;
  attestedCredentialData?: {
    aaguid: Uint8Array;
    credentialId: Uint8Array;
    credentialPublicKey: Uint8Array;
  };
  extensions?: Record<string, unknown>;
}

export interface ParsedAttestationResponse {
  clientData: ParsedClientData;
  authenticatorData: ParsedAuthenticatorData;
  attestationStatement: Record<string, unknown>;
}

export interface ParsedAssertionResponse {
  clientData: ParsedClientData;
  authenticatorData: ParsedAuthenticatorData;
  signature: Uint8Array;
  userHandle?: Uint8Array;
}

// Registration and authentication result types
export interface RegistrationResult {
  credentialId: string;
  publicKey: Uint8Array;
  counter: number;
  userHandle?: string;
  attestationObject: string;
  transports?: AuthenticatorTransport[];
}

export interface AuthenticationResult {
  credentialId: string;
  counter: number;
  userHandle?: string;
  success: boolean;
}

// Configuration types
export interface PasskeyOrchestratorConfig {
  rpId: string;
  rpName: string;
  expectedOrigin: string;
  timeout?: number;
  preferredAuthenticatorType?: 'platform' | 'cross-platform' | 'both';
  requireUserVerification?: boolean;
  requireResidentKey?: boolean;
}

export interface RegistrationOptions {
  userId: string;
  username: string;
  displayName?: string;
  excludeCredentials?: PublicKeyCredentialDescriptor[];
  config?: Partial<PasskeyOrchestratorConfig>;
}

export interface AuthenticationOptions {
  allowCredentials?: PublicKeyCredentialDescriptor[];
  config?: Partial<PasskeyOrchestratorConfig>;
}
