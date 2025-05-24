/**
 * Generates recommended WebAuthn options based on environment and configuration
 */

import type {
  Environment,
  PasskeyOrchestratorConfig,
} from '@passkey-orchestrator/shared';

import {
  generateChallenge,
  base64URLToArrayBuffer,
  stringToArrayBuffer,
} from '@passkey-orchestrator/shared';

/**
 * Standard COSE algorithm identifiers for public key credentials
 */
const COSE_ALGORITHMS: PublicKeyCredentialParameters[] = [
  { type: 'public-key', alg: -7 },  // ES256 (ECDSA w/ SHA-256)
  { type: 'public-key', alg: -257 }, // RS256 (RSASSA-PKCS1-v1_5 w/ SHA-256)
  { type: 'public-key', alg: -37 },  // PS256 (RSASSA-PSS w/ SHA-256)
  { type: 'public-key', alg: -35 },  // ES384 (ECDSA w/ SHA-384)
  { type: 'public-key', alg: -36 },  // ES512 (ECDSA w/ SHA-512)
];

/**
 * Generates recommended PublicKeyCredentialCreationOptions based on environment
 */
export async function getRecommendedPasskeyOptions(
  userId: string,
  username: string,
  environment: Environment,
  config: PasskeyOrchestratorConfig
): Promise<PublicKeyCredentialCreationOptions> {
  // Generate a secure challenge
  const challenge = base64URLToArrayBuffer(generateChallenge());

  // Create user ID (should be non-PII)
  const userIdBuffer = stringToArrayBuffer(userId);

  // Determine authenticator attachment preference based on environment
  const authenticatorAttachment = getRecommendedAuthenticatorAttachment(
    environment,
    config.preferredAuthenticatorType
  );

  // Configure authenticator selection
  const authenticatorSelection: AuthenticatorSelectionCriteria = {
    authenticatorAttachment,
    residentKey: config.requireResidentKey ? 'required' : 'preferred',
    requireResidentKey: config.requireResidentKey,
    userVerification: config.requireUserVerification ? 'required' : 'preferred',
  };

  // Determine attestation preference based on environment
  const attestation = getRecommendedAttestation(environment);

  return {
    rp: {
      id: config.rpId,
      name: config.rpName,
    },
    user: {
      id: userIdBuffer,
      name: username,
      displayName: username, // Can be overridden by caller
    },
    challenge,
    pubKeyCredParams: COSE_ALGORITHMS,
    authenticatorSelection,
    timeout: config.timeout,
    attestation,
  };
}

/**
 * Determines the recommended authenticator attachment based on environment
 */
function getRecommendedAuthenticatorAttachment(
  environment: Environment,
  preference: PasskeyOrchestratorConfig['preferredAuthenticatorType']
): AuthenticatorAttachment | undefined {
  if (preference === 'platform') {
    return 'platform';
  }

  if (preference === 'cross-platform') {
    return 'cross-platform';
  }

  // Auto-detect based on environment
  const { os, isPlatformAuthenticatorAvailable, detectedProviders } = environment;

  // If platform authenticator is available and we're on a mobile device, prefer platform
  if (isPlatformAuthenticatorAvailable && (os === 'iOS' || os === 'Android')) {
    return 'platform';
  }

  // If we have high-confidence cross-platform providers detected, suggest that
  const highConfidenceCrossPlatform = detectedProviders.some(
    p => p.type === 'cross-platform' && p.confidence > 0.7
  );

  if (highConfidenceCrossPlatform) {
    return 'cross-platform';
  }

  // If platform authenticator is available, prefer it
  if (isPlatformAuthenticatorAvailable) {
    return 'platform';
  }

  // Let the browser decide
  return undefined;
}

/**
 * Determines the recommended attestation conveyance preference
 */
function getRecommendedAttestation(environment: Environment): AttestationConveyancePreference {
  // For most Passkey use cases, 'none' is recommended for better compatibility
  // Enterprise scenarios might want 'direct' or 'enterprise'

  const { os, detectedProviders } = environment;

  // On enterprise environments, we might want attestation
  const hasEnterpriseProviders = detectedProviders.some(
    p => p.name.includes('Windows Hello') || p.name.includes('Microsoft')
  );

  if (hasEnterpriseProviders) {
    return 'enterprise';
  }

  // For consumer use cases, prefer 'none' for better compatibility
  return 'none';
}

/**
 * Generates user-friendly suggestions for Passkey creation
 */
export function getPasskeySuggestions(environment: Environment): string[] {
  const suggestions: string[] = [];
  const { os, browser, isPlatformAuthenticatorAvailable, detectedProviders } = environment;

  // Platform-specific suggestions
  if (isPlatformAuthenticatorAvailable) {
    switch (os) {
      case 'iOS':
        suggestions.push('Use Face ID, Touch ID, or your device passcode');
        break;
      case 'macOS':
        suggestions.push('Use Touch ID, Face ID, or your device password');
        break;
      case 'Android':
        suggestions.push('Use your fingerprint, face unlock, or device PIN');
        break;
      case 'Windows':
        suggestions.push('Use Windows Hello with PIN, fingerprint, or face recognition');
        break;
    }
  }

  // Cross-platform provider suggestions
  const highConfidenceProviders = detectedProviders.filter(p => p.confidence > 0.7);

  if (highConfidenceProviders.length > 0) {
    const providerNames = highConfidenceProviders.map(p => p.name).join(' or ');
    suggestions.push(`Save to ${providerNames}`);
  }

  // Browser-specific suggestions
  switch (browser) {
    case 'Chrome':
      suggestions.push('Sync with your Google account across devices');
      break;
    case 'Safari':
      suggestions.push('Sync with iCloud Keychain across your Apple devices');
      break;
    case 'Edge':
      suggestions.push('Sync with your Microsoft account');
      break;
  }

  // Fallback suggestion
  if (suggestions.length === 0) {
    suggestions.push('Create a passkey for secure, passwordless access');
  }

  return suggestions;
}

/**
 * Generates user-friendly explanations for authentication
 */
export function getAuthenticationInstructions(environment: Environment): string[] {
  const instructions: string[] = [];
  const { os, isPlatformAuthenticatorAvailable, detectedProviders } = environment;

  if (isPlatformAuthenticatorAvailable) {
    switch (os) {
      case 'iOS':
        instructions.push('Use Face ID, Touch ID, or enter your device passcode');
        break;
      case 'macOS':
        instructions.push('Use Touch ID, Face ID, or enter your device password');
        break;
      case 'Android':
        instructions.push('Use your fingerprint, face unlock, or device PIN');
        break;
      case 'Windows':
        instructions.push('Use Windows Hello or enter your PIN');
        break;
    }
  }

  const crossPlatformProviders = detectedProviders.filter(p => p.type === 'cross-platform');
  if (crossPlatformProviders.length > 0) {
    const providerNames = crossPlatformProviders.map(p => p.name).join(' or ');
    instructions.push(`Or use ${providerNames}`);
  }

  if (instructions.length === 0) {
    instructions.push('Authenticate with your passkey');
  }

  return instructions;
}

/**
 * Gets environment-specific WebAuthn options
 */
export function getEnvironmentSpecificOptions(environment: Environment) {
  return {
    prefersPlatformAuthenticator: environment.isPlatformAuthenticatorAvailable,
    recommendedTimeout: environment.os === 'iOS' || environment.os === 'Android' ? 120000 : 60000,
    supportedAlgorithms: COSE_ALGORITHMS,
    browserSpecificHints: getBrowserSpecificHints(environment.browser)
  };
}

/**
 * Generates registration options for WebAuthn
 */
export async function generateRegistrationOptions(
  userId: string,
  username: string,
  displayName?: string
): Promise<PublicKeyCredentialCreationOptions> {
  const challenge = base64URLToArrayBuffer(generateChallenge());
  const userIdBuffer = stringToArrayBuffer(userId);

  return {
    challenge,
    rp: {
      id: window.location.hostname,
      name: document.title || window.location.hostname
    },
    user: {
      id: userIdBuffer,
      name: username,
      displayName: displayName || username
    },
    pubKeyCredParams: COSE_ALGORITHMS,
    timeout: 60000,
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      residentKey: 'preferred',
      requireResidentKey: false,
      userVerification: 'preferred'
    }
  };
}

/**
 * Generates authentication options for WebAuthn
 */
export async function generateAuthenticationOptions(
  allowCredentials?: PublicKeyCredentialDescriptor[]
): Promise<PublicKeyCredentialRequestOptions> {
  const challenge = base64URLToArrayBuffer(generateChallenge());

  return {
    challenge,
    timeout: 60000,
    rpId: window.location.hostname,
    allowCredentials,
    userVerification: 'preferred'
  };
}

/**
 * Gets browser-specific hints for better UX
 */
function getBrowserSpecificHints(browser: Environment['browser']) {
  switch (browser) {
    case 'Safari':
      return {
        supportsConditionalUI: false,
        recommendedTimeout: 120000,
        preferredAttachment: 'platform' as const
      };
    case 'Chrome':
      return {
        supportsConditionalUI: true,
        recommendedTimeout: 60000,
        preferredAttachment: 'both' as const
      };
    case 'Firefox':
      return {
        supportsConditionalUI: false,
        recommendedTimeout: 60000,
        preferredAttachment: 'both' as const
      };
    case 'Edge':
      return {
        supportsConditionalUI: true,
        recommendedTimeout: 60000,
        preferredAttachment: 'platform' as const
      };
    default:
      return {
        supportsConditionalUI: false,
        recommendedTimeout: 60000,
        preferredAttachment: 'both' as const
      };
  }
}
