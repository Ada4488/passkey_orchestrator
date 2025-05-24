/**
 * Environment detection utilities for cross-platform Passkey support
 * Detects OS, browser, and available authenticator capabilities
 */

import type { Environment, PasskeyProvider } from '@passkey-orchestrator/shared';
import { PasskeyEnvironmentError } from '@passkey-orchestrator/shared';

/**
 * Detects the current operating system
 */
function detectOS(): Environment['os'] {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || '';

  // iOS detection (iPhone, iPad, iPod)
  if (/ipad|iphone|ipod/.test(userAgent) || (platform === 'macintel' && navigator.maxTouchPoints > 1)) {
    return 'iOS';
  }

  // Android detection
  if (/android/.test(userAgent)) {
    return 'Android';
  }

  // Windows detection
  if (/win/.test(platform) || /windows/.test(userAgent)) {
    return 'Windows';
  }

  // macOS detection
  if (/mac/.test(platform) && navigator.maxTouchPoints <= 1) {
    return 'macOS';
  }

  // Linux detection
  if (/linux/.test(platform) || /x11/.test(platform)) {
    return 'Linux';
  }

  return 'unknown';
}

/**
 * Detects the current browser
 */
function detectBrowser(): Environment['browser'] {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }

  const userAgent = navigator.userAgent.toLowerCase();

  // Edge detection (must come before Chrome since Edge also contains 'chrome')
  if (/edg\//.test(userAgent)) {
    return 'Edge';
  }

  // Chrome detection
  if (/chrome/.test(userAgent) && !/edg\//.test(userAgent)) {
    return 'Chrome';
  }

  // Firefox detection
  if (/firefox/.test(userAgent)) {
    return 'Firefox';
  }

  // Safari detection
  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
    return 'Safari';
  }

  return 'unknown';
}

/**
 * Checks if WebAuthn is supported in the current environment
 */
function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'navigator' in window &&
    'credentials' in navigator &&
    'create' in navigator.credentials &&
    'get' in navigator.credentials &&
    typeof PublicKeyCredential !== 'undefined'
  );
}

/**
 * Checks if a platform authenticator is available
 */
async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    return false;
  }

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (error) {
    console.warn('Failed to check platform authenticator availability:', error);
    return false;
  }
}

/**
 * Detects potential Passkey providers based on environment
 */
function detectPasskeyProviders(os: Environment['os'], browser: Environment['browser']): PasskeyProvider[] {
  const providers: PasskeyProvider[] = [];

  // Platform-specific providers
  switch (os) {
    case 'iOS':
      providers.push({
        type: 'platform',
        name: 'iCloud Keychain',
        confidence: 0.9,
      });
      break;
    case 'macOS':
      providers.push({
        type: 'platform',
        name: 'iCloud Keychain',
        confidence: 0.9,
      });
      break;
    case 'Android':
      providers.push({
        type: 'platform',
        name: 'Google Password Manager',
        confidence: 0.8,
      });
      break;
    case 'Windows':
      providers.push({
        type: 'platform',
        name: 'Windows Hello',
        confidence: 0.8,
      });
      break;
  }

  // Browser-specific providers
  switch (browser) {
    case 'Chrome':
      providers.push({
        type: 'cross-platform',
        name: 'Google Password Manager',
        confidence: 0.7,
      });
      break;
    case 'Edge':
      providers.push({
        type: 'cross-platform',
        name: 'Microsoft Authenticator',
        confidence: 0.6,
      });
      break;
  }

  // Check for common password manager extensions
  if (typeof window !== 'undefined') {
    // Bitwarden detection
    if (window.BitwardenProviderApp || document.querySelector('[data-bitwarden]')) {
      providers.push({
        type: 'cross-platform',
        name: 'Bitwarden',
        confidence: 0.8,
      });
    }

    // 1Password detection
    if (window.OnePasswordProviderApp || document.querySelector('[data-1password]')) {
      providers.push({
        type: 'cross-platform',
        name: '1Password',
        confidence: 0.8,
      });
    }

    // Dashlane detection
    if (window.DashlaneProviderApp || document.querySelector('[data-dashlane]')) {
      providers.push({
        type: 'cross-platform',
        name: 'Dashlane',
        confidence: 0.7,
      });
    }
  }

  return providers;
}

/**
 * Detects the current environment and capabilities
 */
export async function detectEnvironment(): Promise<Environment> {
  try {
    const os = detectOS();
    const browser = detectBrowser();
    const webAuthnSupported = isWebAuthnSupported();
    const platformAuthenticatorAvailable = webAuthnSupported
      ? await isPlatformAuthenticatorAvailable()
      : false;

    const detectedProviders = detectPasskeyProviders(os, browser);

    return {
      os,
      browser,
      isWebAuthnSupported: webAuthnSupported,
      isPlatformAuthenticatorAvailable: platformAuthenticatorAvailable,
      detectedProviders
    };
  } catch (error) {
    throw new PasskeyEnvironmentError(
      'Failed to detect environment capabilities',
      'detection_failed',
      error as Error
    );
  }
}

/**
 * Validates that the current environment supports WebAuthn
 */
export function validateEnvironment(environment: Environment): void {
  if (!environment.isWebAuthnSupported) {
    throw new PasskeyEnvironmentError(
      'WebAuthn is not supported in this environment',
      'webauthn_not_supported'
    );
  }

  // Check for secure context
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    throw new PasskeyEnvironmentError(
      'WebAuthn requires a secure context (HTTPS)',
      'insecure_context'
    );
  }
}

/**
 * Gets a user-friendly description of the environment
 */
export function getEnvironmentDescription(environment: Environment): string {
  const { os, browser, isPlatformAuthenticatorAvailable, detectedProviders } = environment;

  let description = `${os} with ${browser}`;

  if (isPlatformAuthenticatorAvailable) {
    description += ' (Platform authenticator available)';
  }

  if (detectedProviders.length > 0) {
    const providerNames = detectedProviders
      .filter(p => p.confidence > 0.6)
      .map(p => p.name)
      .join(', ');

    if (providerNames) {
      description += ` - Detected providers: ${providerNames}`;
    }
  }

  return description;
}

/**
 * Gets browser information
 */
export function getBrowserInfo(): Environment['browser'] {
  return detectBrowser();
}

/**
 * Gets OS information
 */
export function getOSInfo(): Environment['os'] {
  return detectOS();
}

/**
 * Checks if WebAuthn is supported
 */
export function checkWebAuthnSupport(): boolean {
  return isWebAuthnSupported();
}

/**
 * Checks if platform authenticator is supported
 */
export async function checkPlatformAuthenticatorSupport(): Promise<boolean> {
  return isPlatformAuthenticatorAvailable();
}

/**
 * Detects the primary passkey provider
 */
export function detectPasskeyProvider(): string {
  const os = detectOS();
  const browser = detectBrowser();
  const providers = detectPasskeyProviders(os, browser);
  return providers.length > 0 ? providers[0].name : 'Unknown';
}

// Type augmentation for password manager detection
declare global {
  interface Window {
    BitwardenProviderApp?: unknown;
    OnePasswordProviderApp?: unknown;
    DashlaneProviderApp?: unknown;
  }
}
